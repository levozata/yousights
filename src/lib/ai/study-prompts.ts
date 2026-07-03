import type { PromptPattern, Stimulus, Study, StudyType } from "@/generated/prisma/client";

function stimulusBlock(stimulus: Stimulus | null): string {
  if (!stimulus) return "";
  const parts = [`Stimulus — ${stimulus.title} (${stimulus.type}):`];
  if (stimulus.content) parts.push(stimulus.content);
  if (stimulus.url) parts.push(`URL: ${stimulus.url}`);
  return parts.join("\n");
}

const STUDY_TYPE_FRAMING: Record<StudyType, string> = {
  UX_WALKTHROUGH:
    "Walk through this step by step as if you were actually using it. Narrate your first impression, " +
    "where you'd click or look first, anything confusing, and any point where you'd hesitate or give up.",
  CONCEPT_TEST:
    "Evaluate this concept as a real option you might consider. Say whether you understand what it does, " +
    "whether it appeals to you, and why.",
  PRODUCT_VALIDATION:
    "React to this as a validation question for a product decision your team is making. Be candid about " +
    "whether this would actually change what you do.",
  MESSAGE_TEST:
    "React to this specific message/copy. Would it grab your attention, and does it say something you'd " +
    "believe or care about?",
  SEGMENTATION:
    "Answer from your own situation and priorities, in your own words, without trying to represent anyone else.",
};

const PROMPT_PATTERN_FRAMING: Record<PromptPattern, string> = {
  EXPLAIN_AND_EVALUATE:
    "First, explain back in your own words what you think this is. Then say whether you'd want it and why.",
  COMPARE_AND_JUSTIFY:
    "If there are multiple options presented, rank them in the order you'd prefer, and justify the ranking " +
    "with your actual reasoning, not just a preference.",
  OBJECTION_SURFACE:
    "Focus specifically on what would make you say no to this. Surface every real objection or hesitation " +
    "you'd have, even minor ones.",
  STANDARD: "",
};

/** Builds the opening researcher prompt sent to each persona at the start of a run. */
export function buildStudyOpeningPrompt(study: Study & { stimulus: Stimulus | null }): string {
  const parts = [
    `Research question: ${study.researchQuestion}`,
    stimulusBlock(study.stimulus),
    STUDY_TYPE_FRAMING[study.type],
    PROMPT_PATTERN_FRAMING[study.promptPattern],
  ].filter(Boolean);
  return parts.join("\n\n");
}
