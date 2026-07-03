import { groundingStrengthLabel } from "@/lib/ai/grounding-strength";

export function GroundingBadge({ score }: { score: number }) {
  const label = groundingStrengthLabel(score);
  const color =
    label === "Thin"
      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
      : label === "Emerging"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        : label === "Calibrated"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

  return (
    <span
      title={`Grounding strength: ${score}/100 — how much real data backs this persona`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label} · {score}
    </span>
  );
}

export function ConfidenceBadge({ mode }: { mode: "STATED_PREFERENCE" | "PREDICTED_BEHAVIOUR" }) {
  const isStated = mode === "STATED_PREFERENCE";
  return (
    <span
      title={
        isStated
          ? "Stated-preference question — stronger signal"
          : "Predicted-behaviour question — weaker signal, treat with more caution"
      }
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isStated
          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
      }`}
    >
      {isStated ? "Stated preference" : "Predicted behaviour"}
    </span>
  );
}

export function RecommendationBadge({ rec }: { rec: "SHIP" | "KILL" | "REFINE" }) {
  const color =
    rec === "SHIP"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
      : rec === "KILL"
        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  return <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${color}`}>{rec}</span>;
}

export function SentimentDot({ sentiment }: { sentiment: "positive" | "negative" | "mixed" }) {
  const color = sentiment === "positive" ? "bg-emerald-500" : sentiment === "negative" ? "bg-red-500" : "bg-amber-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}
