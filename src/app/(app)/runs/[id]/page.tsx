"use client";

import { useEffect, useRef, useState, use as usePromise, useCallback } from "react";
import Link from "next/link";
import { GroundingBadge } from "@/components/badges";
import { SynthesisDashboard } from "@/components/synthesis-dashboard";
import type { Insight, QuoteRef } from "@/lib/insight-types";

type Message = { id: string; role: "SYSTEM" | "RESEARCHER" | "PERSONA"; content: string; isFollowUp: boolean };
type Participant = {
  id: string;
  persona: { id: string; name: string; tagline: string | null; groundingStrength: number };
  session: { id: string; messages: Message[] } | null;
};
type Run = {
  id: string;
  mode: "SOLO" | "PANEL";
  status: string;
  study: { researchQuestion: string; type: string };
  participants: Participant[];
  insight: Insight | null;
};

export default function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [run, setRun] = useState<Run | null>(null);
  const [followUpText, setFollowUpText] = useState<Record<string, string>>({});
  const [sendingFollowUp, setSendingFollowUp] = useState<Record<string, boolean>>({});
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sessionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const load = useCallback(() => {
    fetch(`/api/runs/${id}`).then((r) => r.json()).then(setRun);
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!run || run.status !== "PENDING") return;
    const es = new EventSource(`/api/runs/${id}/stream`);
    es.addEventListener("persona_done", load);
    es.addEventListener("complete", () => {
      load();
      es.close();
    });
    es.addEventListener("already_processed", () => {
      load();
      es.close();
    });
    es.addEventListener("error", () => es.close());
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status, id]);

  async function sendFollowUp(sessionId: string) {
    const text = followUpText[sessionId]?.trim();
    if (!text) return;
    setSendingFollowUp((s) => ({ ...s, [sessionId]: true }));
    await fetch(`/api/sessions/${sessionId}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setFollowUpText((s) => ({ ...s, [sessionId]: "" }));
    setSendingFollowUp((s) => ({ ...s, [sessionId]: false }));
    load();
  }

  function jumpToQuote(q: QuoteRef) {
    if (q.sessionId) sessionRefs.current[q.sessionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (q.messageId) {
      const el = messageRefs.current[q.messageId];
      if (el) {
        el.classList.add("ring-2", "ring-indigo-400");
        setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400"), 1600);
      }
    }
  }

  if (!run) return <p className="text-sm text-zinc-500">Loading…</p>;

  const isPanel = run.mode === "PANEL";

  return (
    <div className="max-w-4xl">
      <p className="text-xs text-zinc-500">{run.study.type.replace(/_/g, " ")}</p>
      <h1 className="text-lg font-semibold tracking-tight mt-1 mb-6">{run.study.researchQuestion}</h1>

      {run.status === "PENDING" && (
        <div className="mb-4 rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300">
          Running personas in parallel — responses will appear as each finishes…
        </div>
      )}

      <div className={isPanel ? "grid grid-cols-1 gap-4" : "flex flex-col gap-4"}>
        {run.participants.map((p) => (
          <div
            key={p.id}
            ref={(el) => {
              if (p.session) sessionRefs.current[p.session.id] = el;
            }}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <Link href={`/personas/${p.persona.id}`} className="text-sm font-medium hover:underline">
                  {p.persona.name}
                </Link>
                {p.persona.tagline && <span className="ml-2 text-xs text-zinc-500">{p.persona.tagline}</span>}
              </div>
              <GroundingBadge score={p.persona.groundingStrength} />
            </div>

            {!p.session || p.session.messages.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">Waiting…</p>
            ) : (
              <div className="flex flex-col gap-2">
                {p.session.messages.map((m) => (
                  <div
                    key={m.id}
                    ref={(el) => {
                      messageRefs.current[m.id] = el;
                    }}
                    className={`rounded-md px-3 py-2 text-sm transition-shadow ${
                      m.role === "PERSONA"
                        ? "bg-zinc-50 dark:bg-zinc-900"
                        : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200"
                    }`}
                  >
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-zinc-400 mb-1">
                      {m.role === "PERSONA" ? p.persona.name : m.isFollowUp ? "Follow-up" : "Researcher"}
                    </span>
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  </div>
                ))}
              </div>
            )}

            {p.session && p.session.messages.some((m) => m.role === "PERSONA") && (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Probe further — ask a follow-up…"
                  value={followUpText[p.session.id] ?? ""}
                  onChange={(e) => setFollowUpText((s) => ({ ...s, [p.session!.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && sendFollowUp(p.session!.id)}
                />
                <button
                  onClick={() => sendFollowUp(p.session!.id)}
                  disabled={sendingFollowUp[p.session.id]}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {sendingFollowUp[p.session.id] ? "…" : "Ask"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {run.insight && (
        <div className="mt-8">
          <h2 className="text-base font-semibold mb-3">Synthesis</h2>
          <SynthesisDashboard insight={run.insight} onQuoteClick={jumpToQuote} exportHref={`/api/runs/${id}/export`} />
        </div>
      )}

      {isPanel && run.status === "COMPLETE" && !run.insight && (
        <p className="mt-6 text-sm text-zinc-500">Synthesis unavailable for this run.</p>
      )}
    </div>
  );
}
