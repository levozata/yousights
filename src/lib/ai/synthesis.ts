import { db } from "@/lib/db";
import { chatWithTool } from "./client";
import { groundingStrengthLabel } from "./grounding-strength";

type QuoteRef = {
  personaName: string;
  excerpt: string;
};

type SynthesisToolOutput = {
  distribution: { label: string; sentiment: "positive" | "negative" | "mixed"; personaNames: string[] }[];
  themes: { title: string; summary: string; quotes: QuoteRef[] }[];
  divergences: { title: string; summary: string; sideA: string; sideB: string; quotes: QuoteRef[] }[];
  unexpectedAngles: { title: string; summary: string; quotes: QuoteRef[] }[];
  recommendation: "SHIP" | "KILL" | "REFINE";
  recommendationNote: string;
  confidenceNote: string;
};

const SYNTHESIS_TOOL = {
  name: "record_synthesis",
  description: "Records the structured cross-persona synthesis of a research run.",
  input_schema: {
    type: "object" as const,
    properties: {
      distribution: {
        type: "array",
        description: "Directional split of how personas reacted. Avoid false-precision percentages.",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "e.g. 'Positive', 'Skeptical', 'Needs more info'" },
            sentiment: { type: "string", enum: ["positive", "negative", "mixed"] },
            personaNames: { type: "array", items: { type: "string" } },
          },
          required: ["label", "sentiment", "personaNames"],
        },
      },
      themes: {
        type: "array",
        description: "Reasoning that recurred consistently across personas.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  personaName: { type: "string" },
                  excerpt: { type: "string", description: "Verbatim excerpt from that persona's response." },
                },
                required: ["personaName", "excerpt"],
              },
            },
          },
          required: ["title", "summary", "quotes"],
        },
      },
      divergences: {
        type: "array",
        description: "Where personas disagreed — flagged as high-value, signals where strategy needs segmentation.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            sideA: { type: "string" },
            sideB: { type: "string" },
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  personaName: { type: "string" },
                  excerpt: { type: "string" },
                },
                required: ["personaName", "excerpt"],
              },
            },
          },
          required: ["title", "summary", "sideA", "sideB", "quotes"],
        },
      },
      unexpectedAngles: {
        type: "array",
        description: "What personas surfaced that the team likely did not anticipate.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  personaName: { type: "string" },
                  excerpt: { type: "string" },
                },
                required: ["personaName", "excerpt"],
              },
            },
          },
          required: ["title", "summary", "quotes"],
        },
      },
      recommendation: { type: "string", enum: ["SHIP", "KILL", "REFINE"] },
      recommendationNote: { type: "string", description: "The reasoning that supports the recommendation." },
      confidenceNote: {
        type: "string",
        description:
          "Honest framing of how much to trust this signal: grounding strength across personas, whether " +
          "this was a stated-preference or predicted-behaviour question, and what this run can't tell you.",
      },
    },
    required: [
      "distribution",
      "themes",
      "divergences",
      "unexpectedAngles",
      "recommendation",
      "recommendationNote",
      "confidenceNote",
    ],
  },
};

function demoSynthesis(personaNames: string[]): SynthesisToolOutput {
  return {
    distribution: [
      { label: "Interested, with reservations", sentiment: "mixed", personaNames },
    ],
    themes: [
      {
        title: "Reasonable first impression",
        summary: "Personas generally understood the stimulus but wanted more concrete detail before committing.",
        quotes: personaNames.slice(0, 1).map((p) => ({ personaName: p, excerpt: "I get the idea, but I'd want to see it in practice first." })),
      },
    ],
    divergences: [],
    unexpectedAngles: [],
    recommendation: "REFINE",
    recommendationNote:
      "[demo mode] Set ANTHROPIC_API_KEY for a real synthesis. This is a placeholder recommendation.",
    confidenceNote:
      "Demo mode — no live model call was made. Treat this output as a UI placeholder, not a signal.",
  };
}

/** Runs the synthesis agent across a completed run's transcripts (§7) and
 *  persists the resulting Insight, resolving quote excerpts back to the
 *  originating session/message for click-to-source traceability (§9). */
export async function runSynthesis(runId: string): Promise<void> {
  const run = await db.run.findUniqueOrThrow({
    where: { id: runId },
    include: {
      study: true,
      participants: {
        include: {
          persona: { select: { id: true, name: true, groundingStrength: true } },
          session: { include: { messages: { orderBy: { createdAt: "asc" } } } },
        },
      },
    },
  });

  const transcripts = run.participants
    .filter((p) => p.session)
    .map((p) => {
      const personaReply = p.session!.messages.find((m) => m.role === "PERSONA");
      return {
        personaName: p.persona.name,
        groundingStrength: groundingStrengthLabel(p.persona.groundingStrength),
        text: personaReply?.content ?? "(no response)",
      };
    });

  const personaNames = transcripts.map((t) => t.personaName);

  const system =
    "You are a research synthesis analyst for a synthetic user research platform. You never overclaim: " +
    "this is directional signal from simulated personas, not statistically valid market research. Distinguish " +
    "consistent themes from genuine divergence, and call out what this specific run cannot tell the team.";

  const userPrompt =
    `Research question: ${run.study.researchQuestion}\n` +
    `Question type: ${run.study.confidenceMode === "STATED_PREFERENCE" ? "stated-preference (stronger signal)" : "predicted-behaviour (weaker signal — down-weight confidence)"}\n\n` +
    `Persona responses:\n\n` +
    transcripts
      .map((t) => `### ${t.personaName} (grounding: ${t.groundingStrength})\n${t.text}`)
      .join("\n\n");

  const result = await chatWithTool<SynthesisToolOutput>(
    "synthesis",
    system,
    [{ role: "user", content: userPrompt }],
    SYNTHESIS_TOOL,
    { demoFallback: demoSynthesis(personaNames), maxTokens: 4096 },
  );

  const resolveQuotes = (quotes: QuoteRef[]) =>
    quotes.map((q) => {
      const participant = run.participants.find(
        (p) => p.persona.name.toLowerCase() === q.personaName.toLowerCase(),
      );
      const message = participant?.session?.messages.find(
        (m) => m.role === "PERSONA" && m.content.includes(q.excerpt.slice(0, 24)),
      );
      return {
        personaId: participant?.persona.id ?? null,
        personaName: q.personaName,
        excerpt: q.excerpt,
        sessionId: participant?.session?.id ?? null,
        messageId: message?.id ?? null,
      };
    });

  await db.insight.upsert({
    where: { runId },
    create: {
      runId,
      distribution: result.distribution.map((d) => ({
        label: d.label,
        sentiment: d.sentiment,
        personaIds: run.participants
          .filter((p) => d.personaNames.some((n) => n.toLowerCase() === p.persona.name.toLowerCase()))
          .map((p) => p.persona.id),
        personaNames: d.personaNames,
      })),
      themes: result.themes.map((t) => ({ title: t.title, summary: t.summary, quotes: resolveQuotes(t.quotes) })),
      divergences: result.divergences.map((d) => ({
        title: d.title,
        summary: d.summary,
        sideA: d.sideA,
        sideB: d.sideB,
        quotes: resolveQuotes(d.quotes),
      })),
      unexpectedAngles: result.unexpectedAngles.map((u) => ({
        title: u.title,
        summary: u.summary,
        quotes: resolveQuotes(u.quotes),
      })),
      recommendation: result.recommendation,
      recommendationNote: result.recommendationNote,
      confidenceNote: result.confidenceNote,
    },
    update: {
      distribution: result.distribution,
      themes: result.themes,
      divergences: result.divergences,
      unexpectedAngles: result.unexpectedAngles,
      recommendation: result.recommendation,
      recommendationNote: result.recommendationNote,
      confidenceNote: result.confidenceNote,
    },
  });
}
