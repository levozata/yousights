"use client";

import type { Insight, QuoteRef, Theme } from "@/lib/insight-types";
import { RecommendationBadge } from "@/components/badges";

const SENTIMENT_STYLE: Record<string, { bar: string; dot: string }> = {
  positive: { bar: "bg-emerald-500/70", dot: "bg-emerald-500" },
  negative: { bar: "bg-red-500/70", dot: "bg-red-500" },
  mixed: { bar: "bg-amber-500/70", dot: "bg-amber-500" },
};

function QuoteList({ quotes, onQuoteClick }: { quotes: QuoteRef[]; onQuoteClick?: (q: QuoteRef) => void }) {
  if (!quotes.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {quotes.map((q, i) => (
        <button
          key={i}
          onClick={() => q.sessionId && onQuoteClick?.(q)}
          disabled={!q.sessionId}
          className={`text-left rounded-md bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 ${
            q.sessionId ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer" : ""
          }`}
        >
          <span className="italic">&ldquo;{q.excerpt}&rdquo;</span>
          <span className="ml-1 font-medium text-zinc-500">— {q.personaName}</span>
        </button>
      ))}
    </div>
  );
}

function ThemeCard({ theme, onQuoteClick, badge }: { theme: Theme; onQuoteClick?: (q: QuoteRef) => void; badge?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium">{theme.title}</h4>
        {badge}
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{theme.summary}</p>
      <QuoteList quotes={theme.quotes} onQuoteClick={onQuoteClick} />
    </div>
  );
}

export function SynthesisDashboard({
  insight,
  onQuoteClick,
  exportHref,
}: {
  insight: Insight;
  onQuoteClick?: (q: QuoteRef) => void;
  exportHref: string;
}) {
  const totalPersonas = insight.distribution.reduce((sum, d) => sum + d.personaNames.length, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recommendation</h3>
          <RecommendationBadge rec={insight.recommendation} />
        </div>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{insight.recommendationNote}</p>
        <p className="mt-3 rounded-md bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">Confidence: </span>
          {insight.confidenceNote}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Distribution</h3>
        <div className="flex flex-col gap-2">
          {insight.distribution.map((d, i) => {
            const style = SENTIMENT_STYLE[d.sentiment] ?? SENTIMENT_STYLE.mixed;
            const pct = Math.max((d.personaNames.length / totalPersonas) * 100, 6);
            return (
              <div key={i}>
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{d.label}</span>
                  <span className="text-zinc-400">({d.personaNames.length})</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div className={`h-2 rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">{d.personaNames.join(", ")}</p>
              </div>
            );
          })}
        </div>
      </div>

      {insight.themes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Recurring themes</h3>
          <div className="flex flex-col gap-2">
            {insight.themes.map((t, i) => (
              <ThemeCard key={i} theme={t} onQuoteClick={onQuoteClick} />
            ))}
          </div>
        </div>
      )}

      {insight.divergences.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            Divergences <span className="font-normal text-zinc-400">— where strategy may need segmentation</span>
          </h3>
          <div className="flex flex-col gap-2">
            {insight.divergences.map((d, i) => (
              <div key={i} className="rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                <h4 className="text-sm font-medium">{d.title}</h4>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{d.summary}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-white dark:bg-zinc-950 px-2 py-1">{d.sideA}</div>
                  <div className="rounded bg-white dark:bg-zinc-950 px-2 py-1">{d.sideB}</div>
                </div>
                <QuoteList quotes={d.quotes} onQuoteClick={onQuoteClick} />
              </div>
            ))}
          </div>
        </div>
      )}

      {insight.unexpectedAngles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Unexpected angles</h3>
          <div className="flex flex-col gap-2">
            {insight.unexpectedAngles.map((u, i) => (
              <ThemeCard key={i} theme={u} onQuoteClick={onQuoteClick} />
            ))}
          </div>
        </div>
      )}

      <a
        href={exportHref}
        className="self-start rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        Export report (Markdown)
      </a>
    </div>
  );
}
