import type { Persona } from "@/generated/prisma/client";
import { chatComplete, chatStream, type ChatMessage } from "./client";
import { buildPersonaSystemPrompt } from "./persona-prompt";
import { retrieveGroundingChunks } from "./rag";

async function systemPromptFor(persona: Persona, conversation: ChatMessage[]) {
  const query = conversation[conversation.length - 1]?.content ?? "";
  const chunks = await retrieveGroundingChunks(persona.id, query);
  return buildPersonaSystemPrompt(persona, chunks);
}

/** Non-streaming persona turn — used for panel fan-out where per-persona
 *  completion (not per-token) is the unit of progressive reveal. */
export async function generatePersonaReply(persona: Persona, conversation: ChatMessage[]): Promise<string> {
  const system = await systemPromptFor(persona, conversation);
  return chatComplete("simulation", system, conversation);
}

/** Token-streaming persona turn — used for 1:1 depth sessions. */
export async function* streamPersonaReply(
  persona: Persona,
  conversation: ChatMessage[],
): AsyncGenerator<string> {
  const system = await systemPromptFor(persona, conversation);
  yield* chatStream("simulation", system, conversation);
}
