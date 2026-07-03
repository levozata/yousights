/**
 * Grounding strength (§3): how much real data backs a persona, surfaced
 * everywhere the persona appears so a thin persona is never presented with
 * the same confidence as a well-grounded one.
 *
 * Heuristic, not a statistical measure: source count, total grounded text
 * volume, and source diversity (a spread of source types calibrates a
 * persona better than five copies of the same interview).
 */
export function computeGroundingStrength(sources: { type: string; rawText: string }[]): number {
  if (sources.length === 0) return 0;

  const sourceCountScore = Math.min(sources.length / 5, 1) * 40; // up to 40 pts for 5+ sources
  const totalChars = sources.reduce((sum, s) => sum + s.rawText.length, 0);
  const volumeScore = Math.min(totalChars / 8000, 1) * 40; // up to 40 pts for ~8k chars grounded
  const distinctTypes = new Set(sources.map((s) => s.type)).size;
  const diversityScore = Math.min(distinctTypes / 3, 1) * 20; // up to 20 pts for 3+ source types

  return Math.round(sourceCountScore + volumeScore + diversityScore);
}

export function groundingStrengthLabel(score: number): "Thin" | "Emerging" | "Calibrated" | "Strong" {
  if (score < 20) return "Thin";
  if (score < 50) return "Emerging";
  if (score < 80) return "Calibrated";
  return "Strong";
}
