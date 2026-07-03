import Anthropic from "@anthropic-ai/sdk";
import { AI_CONFIG, isLiveMode } from "./config";

let _client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: AI_CONFIG.anthropicApiKey });
  }
  return _client;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ModelRole = "simulation" | "synthesis" | "extraction";

function modelFor(role: ModelRole): string {
  return AI_CONFIG.models[role];
}

/** Deterministic offline stand-in used only when no ANTHROPIC_API_KEY is set,
 *  so the full product loop stays demoable without external dependencies. */
function demoReply(system: string, messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content ?? "";
  const nameMatch = system.match(/You are ([^.,\n]+)/i);
  const persona = nameMatch ? nameMatch[1].trim() : "This persona";
  return (
    `[demo mode — set ANTHROPIC_API_KEY for a live simulation]\n\n` +
    `${persona} would weigh this against their usual concerns and respond to ` +
    `"${last.slice(0, 140)}${last.length > 140 ? "…" : ""}" with a mix of interest ` +
    `and a few pointed questions before deciding whether it fits how they already work.`
  );
}

export async function chatComplete(
  role: ModelRole,
  system: string,
  messages: ChatMessage[],
  maxTokens = 1024,
): Promise<string> {
  if (!isLiveMode()) return demoReply(system, messages);

  const res = await anthropic().messages.create({
    model: modelFor(role),
    max_tokens: maxTokens,
    system,
    messages,
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}

/** Streams plain-text deltas. Used for the live run view. */
export async function* chatStream(
  role: ModelRole,
  system: string,
  messages: ChatMessage[],
  maxTokens = 1024,
): AsyncGenerator<string> {
  if (!isLiveMode()) {
    const text = demoReply(system, messages);
    for (const word of text.split(" ")) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 12));
    }
    return;
  }

  const stream = anthropic().messages.stream({
    model: modelFor(role),
    max_tokens: maxTokens,
    system,
    messages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

/**
 * Forces a tool call so the model's response is well-formed JSON matching
 * `schema`, then returns the parsed input. Used for extraction, synthesis,
 * and journey-stage decomposition where downstream code needs structure.
 */
export async function chatWithTool<T = unknown>(
  role: ModelRole,
  system: string,
  messages: ChatMessage[],
  tool: { name: string; description: string; input_schema: Anthropic.Tool["input_schema"] },
  opts?: { maxTokens?: number; demoFallback?: T },
): Promise<T> {
  if (!isLiveMode()) {
    if (opts?.demoFallback !== undefined) return opts.demoFallback;
    throw new Error("chatWithTool requires ANTHROPIC_API_KEY (no demo fallback provided)");
  }

  const res = await anthropic().messages.create({
    model: modelFor(role),
    max_tokens: opts?.maxTokens ?? 2048,
    system,
    messages,
    tools: [{ name: tool.name, description: tool.description, input_schema: tool.input_schema }],
    tool_choice: { type: "tool", name: tool.name },
  });

  const toolUse = res.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not return a tool_use block");
  }
  return toolUse.input as T;
}
