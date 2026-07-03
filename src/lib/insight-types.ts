export type QuoteRef = {
  personaId: string | null;
  personaName: string;
  excerpt: string;
  sessionId: string | null;
  messageId: string | null;
};

export type DistributionEntry = { label: string; sentiment: "positive" | "negative" | "mixed"; personaIds: string[]; personaNames: string[] };
export type Theme = { title: string; summary: string; quotes: QuoteRef[] };
export type Divergence = Theme & { sideA: string; sideB: string };

export type Insight = {
  id: string;
  distribution: DistributionEntry[];
  themes: Theme[];
  divergences: Divergence[];
  unexpectedAngles: Theme[];
  recommendation: "SHIP" | "KILL" | "REFINE";
  recommendationNote: string;
  confidenceNote: string;
};
