import type { Persona } from "@/generated/prisma/client";
import type { RetrievedChunk } from "./rag";

type BigFive = {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
};

function traitLine(label: string, value: number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const level = value >= 70 ? "high" : value >= 40 ? "moderate" : "low";
  return `- ${label}: ${level} (${value}/100)`;
}

/**
 * Builds the persona's simulation system prompt from identity + point of
 * view + behavioural constraints + psychographic layer + retrieved
 * grounding chunks (§8). This is what makes the psychographic sliders and
 * grounding data *actually shape* the simulation rather than just being
 * displayed in the UI.
 */
export function buildPersonaSystemPrompt(
  persona: Persona,
  groundingChunks: RetrievedChunk[],
): string {
  const demographics = (persona.demographics as Record<string, unknown> | null) ?? {};
  const bigFive = (persona.bigFive as BigFive | null) ?? {};

  const lines: string[] = [];

  lines.push(
    `You are ${persona.name}${persona.role ? `, ${persona.role}` : ""}, responding in a synthetic user ` +
      `research session. You are role-playing this specific person as faithfully as the material below ` +
      `allows — stay fully in character, answer from this person's own perspective, and never break ` +
      `character to mention that you are an AI.`,
  );

  if (Object.keys(demographics).length) {
    lines.push(`\nDemographics:\n${Object.entries(demographics)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n")}`);
  }
  if (persona.context) lines.push(`\nContext / situation:\n${persona.context}`);

  const pov = [
    persona.beliefs && `- Existing beliefs: ${persona.beliefs}`,
    persona.priorAttempts && `- What they've already tried: ${persona.priorAttempts}`,
    persona.skepticismSources && `- Where their skepticism comes from: ${persona.skepticismSources}`,
  ].filter(Boolean);
  if (pov.length) lines.push(`\nPoint of view:\n${pov.join("\n")}`);

  const constraints = [
    persona.decisionProcess && `- How they decide: ${persona.decisionProcess}`,
    persona.consults && `- Who they consult before deciding: ${persona.consults}`,
    persona.dealbreakers && `- What makes them say no: ${persona.dealbreakers}`,
  ].filter(Boolean);
  if (constraints.length) lines.push(`\nBehavioural constraints:\n${constraints.join("\n")}`);

  const traits = [
    traitLine("Openness", bigFive.openness),
    traitLine("Conscientiousness", bigFive.conscientiousness),
    traitLine("Extraversion", bigFive.extraversion),
    traitLine("Agreeableness", bigFive.agreeableness),
    traitLine("Neuroticism", bigFive.neuroticism),
  ].filter(Boolean);
  if (traits.length) {
    lines.push(
      `\nPersonality (Big Five) — let these traits visibly shape tone, risk appetite, and how ` +
        `readily this person volunteers objections:\n${traits.join("\n")}`,
    );
  }
  if (persona.values.length) lines.push(`\nCore values: ${persona.values.join(", ")}`);
  if (persona.motivations) lines.push(`\nMotivations: ${persona.motivations}`);
  if (persona.decisionBehaviour) lines.push(`\nDecision / buying behaviour: ${persona.decisionBehaviour}`);

  if (groundingChunks.length) {
    lines.push(
      `\nGrounding material — real material from or about this person. Prefer this over generic ` +
        `assumptions; echo its vocabulary and specific concerns where relevant:\n` +
        groundingChunks.map((c) => `[from "${c.sourceTitle}"]\n${c.content}`).join("\n\n"),
    );
  } else {
    lines.push(
      `\nNo grounding material is attached to this persona yet — this response is a directional ` +
        `estimate from the profile above, not calibrated against real data. Keep responses plausible ` +
        `but avoid inventing specific facts you weren't given.`,
    );
  }

  lines.push(
    `\nRespond conversationally, in first person, the way this person would actually talk — not as a ` +
      `report. It's fine to be uncertain, ask a clarifying question, or push back. When something would ` +
      `genuinely bother or excite this person, say so specifically rather than generically.`,
  );

  return lines.join("\n");
}
