import { chatWithTool } from "./client";

export type PersonaDraft = {
  name: string;
  tagline: string;
  role: string;
  demographics: Record<string, string>;
  context: string;
  beliefs: string;
  priorAttempts: string;
  skepticismSources: string;
  decisionProcess: string;
  consults: string;
  dealbreakers: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  values: string[];
  motivations: string;
  decisionBehaviour: string;
  tags: string[];
};

export const PERSONA_DRAFT_TOOL = {
  name: "record_persona_draft",
  description: "Records a structured synthetic-research persona draft.",
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "A plausible first+last name for this persona." },
      tagline: { type: "string", description: "One-line summary, e.g. 'Budget-conscious SME owner wary of hidden fees'." },
      role: { type: "string" },
      demographics: {
        type: "object",
        description: "Free-form key/value pairs, e.g. ageRange, location, income, household.",
        additionalProperties: { type: "string" },
      },
      context: { type: "string", description: "Their situation/environment relevant to the research domain." },
      beliefs: { type: "string" },
      priorAttempts: { type: "string" },
      skepticismSources: { type: "string" },
      decisionProcess: { type: "string" },
      consults: { type: "string" },
      dealbreakers: { type: "string" },
      bigFive: {
        type: "object",
        properties: {
          openness: { type: "number" },
          conscientiousness: { type: "number" },
          extraversion: { type: "number" },
          agreeableness: { type: "number" },
          neuroticism: { type: "number" },
        },
        required: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
        description: "Each 0-100.",
      },
      values: { type: "array", items: { type: "string" } },
      motivations: { type: "string" },
      decisionBehaviour: { type: "string" },
      tags: { type: "array", items: { type: "string" }, description: "2-5 short tags for the persona library." },
    },
    required: [
      "name",
      "tagline",
      "role",
      "demographics",
      "context",
      "beliefs",
      "priorAttempts",
      "skepticismSources",
      "decisionProcess",
      "consults",
      "dealbreakers",
      "bigFive",
      "values",
      "motivations",
      "decisionBehaviour",
      "tags",
    ],
  },
};

const DEMO_DRAFT: PersonaDraft = {
  name: "Alex Rivera",
  tagline: "Pragmatic mid-market buyer who needs proof before switching tools",
  role: "Operations Manager",
  demographics: { ageRange: "35-44", location: "Urban, EU", household: "Working parent" },
  context: "[demo mode] Set ANTHROPIC_API_KEY for a real AI-expanded draft. This is placeholder content.",
  beliefs: "Skeptical of vendor claims until they see a peer using it successfully.",
  priorAttempts: "Has tried two similar tools before and abandoned both after onboarding friction.",
  skepticismSources: "Past experience with tools that looked good in a demo but broke down at scale.",
  decisionProcess: "Builds a shortlist, runs a trial with the team, decides by consensus.",
  consults: "Their direct team and one trusted peer at another company.",
  dealbreakers: "Hidden pricing tiers, no clear migration path, weak support.",
  bigFive: { openness: 55, conscientiousness: 75, extraversion: 45, agreeableness: 60, neuroticism: 40 },
  values: ["Reliability", "Transparency", "Efficiency"],
  motivations: "Wants to reduce manual busywork without adding risk to the team's existing workflow.",
  decisionBehaviour: "Slow, evidence-driven; needs a low-risk trial before committing budget.",
  tags: ["demo", "operations", "mid-market"],
};

/** Expands a short researcher brief into a full persona draft (§3 write-a-brief path). */
export async function expandBriefToPersonaDraft(brief: string): Promise<PersonaDraft> {
  const system =
    "You expand a short researcher brief into a plausible, specific synthetic-research persona. Avoid " +
    "generic stereotypes — invent concrete, coherent detail consistent with the brief. This persona will " +
    "be used to simulate real reactions, so specificity matters more than breadth.";

  return chatWithTool<PersonaDraft>(
    "extraction",
    system,
    [{ role: "user", content: `Brief:\n${brief}` }],
    PERSONA_DRAFT_TOOL,
    { demoFallback: DEMO_DRAFT, maxTokens: 1536 },
  );
}

export type ExtractedField = { field: keyof PersonaDraft; value: unknown };

/** Extracts persona attributes from raw grounding-source text (§3 ground-from-data path). */
export async function extractPersonaDraftFromSource(sourceText: string, sourceTitle: string): Promise<PersonaDraft> {
  const system =
    "You extract a synthetic-research persona from real grounding material (an interview transcript, " +
    "reviews, support tickets, CRM notes, etc). Ground every field in what the material actually says or " +
    "clearly implies — do not invent facts the material doesn't support. Where the material is silent on a " +
    "field, make a conservative, clearly-labelled best guess rather than a confident fabrication.";

  return chatWithTool<PersonaDraft>(
    "extraction",
    system,
    [{ role: "user", content: `Source: ${sourceTitle}\n\n${sourceText}` }],
    PERSONA_DRAFT_TOOL,
    { demoFallback: DEMO_DRAFT, maxTokens: 1536 },
  );
}
