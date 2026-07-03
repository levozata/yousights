import type { Persona } from "@/generated/prisma/client";
import { chatWithTool } from "./client";
import { buildPersonaSystemPrompt } from "./persona-prompt";
import { retrieveGroundingChunks } from "./rag";

export type JourneyStageResult = {
  narrative: string;
  action: string;
  thought: string;
  emotionValence: number; // -2..2
  emotionIntensity: number; // 0..100
  painPoint: string;
  opportunity: string;
};

const JOURNEY_STAGE_TOOL = {
  name: "record_journey_stage",
  description: "Records this persona's behaviour-in-context at one journey stage.",
  input_schema: {
    type: "object" as const,
    properties: {
      narrative: { type: "string", description: "1-2 sentences, first person, what goes through their head here." },
      action: { type: "string", description: "What they concretely do at this stage." },
      thought: { type: "string", description: "Their internal reasoning at this stage." },
      emotionValence: { type: "integer", description: "-2 (very negative) to 2 (very positive)." },
      emotionIntensity: { type: "integer", description: "0-100, how strongly they feel it." },
      painPoint: { type: "string", description: "The friction or concern here, or empty string if none." },
      opportunity: { type: "string", description: "What would improve this moment, or empty string if none." },
    },
    required: ["narrative", "action", "thought", "emotionValence", "emotionIntensity", "painPoint", "opportunity"],
  },
};

function demoStage(stageLabel: string): JourneyStageResult {
  return {
    narrative: `[demo mode] At "${stageLabel}", this persona would react in a way consistent with their profile.`,
    action: "Proceeds cautiously, scanning for anything that contradicts expectations.",
    thought: "Wondering whether this stage will introduce a surprise cost or extra step.",
    emotionValence: 0,
    emotionIntensity: 40,
    painPoint: "Uncertainty about what happens next.",
    opportunity: "Set expectations explicitly before this stage.",
  };
}

/** Walks a persona through one journey stage (§4A conversational journey walk). */
export async function runJourneyStage(
  persona: Persona,
  stageLabel: string,
  stagePrompt: string,
  priorStagesSummary: string,
): Promise<JourneyStageResult> {
  const query = `${stageLabel}: ${stagePrompt}`;
  const chunks = await retrieveGroundingChunks(persona.id, query);
  const system = buildPersonaSystemPrompt(persona, chunks);

  const userPrompt =
    (priorStagesSummary ? `So far in this journey:\n${priorStagesSummary}\n\n` : "") +
    `You're now at this stage: "${stageLabel}".\n${stagePrompt}\n\n` +
    `Respond as yourself, then record the structured fields for this stage.`;

  return chatWithTool<JourneyStageResult>(
    "simulation",
    system,
    [{ role: "user", content: userPrompt }],
    JOURNEY_STAGE_TOOL,
    { demoFallback: demoStage(stageLabel), maxTokens: 700 },
  );
}
