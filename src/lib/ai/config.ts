// Swappable model layer (§8). Every call site asks for a *role*
// (simulation / synthesis / extraction) rather than a hard-coded model id,
// so the underlying model can change per environment without touching
// call sites.

export const AI_CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  models: {
    // Strong reasoning model — persona simulation and cross-persona synthesis.
    simulation: process.env.ANTHROPIC_SIMULATION_MODEL || "claude-sonnet-5",
    synthesis: process.env.ANTHROPIC_SYNTHESIS_MODEL || "claude-sonnet-5",
    // Cheaper model — brief expansion, attribute extraction.
    extraction: process.env.ANTHROPIC_EXTRACTION_MODEL || "claude-haiku-4-5-20251001",
  },
  voyageApiKey: process.env.VOYAGE_API_KEY || "",
};

/** True once a real Anthropic key is configured. When false, the app runs in
 *  demo mode with deterministic canned responses so the product loop stays
 *  fully clickable without any external dependency. */
export function isLiveMode(): boolean {
  return AI_CONFIG.anthropicApiKey.length > 0;
}

export function hasEmbeddingProvider(): boolean {
  return AI_CONFIG.voyageApiKey.length > 0;
}
