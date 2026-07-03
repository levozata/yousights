"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/badges";

type Persona = { id: string; name: string; tagline: string | null };

type StudyDetail = {
  id: string;
  type: string;
  researchQuestion: string;
  confidenceMode: "STATED_PREFERENCE" | "PREDICTED_BEHAVIOUR";
  stimulus: { title: string; content: string | null; url: string | null } | null;
  runs: {
    id: string;
    mode: string;
    status: string;
    createdAt: string;
    participants: { persona: { id: string; name: string } }[];
    insight: { recommendation: string } | null;
  }[];
};

export default function StudyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showNewRun, setShowNewRun] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [starting, setStarting] = useState(false);

  function load() {
    fetch(`/api/studies/${id}`).then((r) => r.json()).then(setStudy);
  }
  useEffect(load, [id]);
  useEffect(() => {
    fetch("/api/personas").then((r) => r.json()).then(setPersonas);
  }, []);

  async function startRun() {
    if (selected.size === 0) return;
    setStarting(true);
    const personaIds = Array.from(selected);
    const res = await fetch(`/api/studies/${id}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaIds, mode: personaIds.length > 1 ? "PANEL" : "SOLO" }),
    });
    const run = await res.json();
    router.push(`/runs/${run.id}`);
  }

  if (!study) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <Link href="/studies" className="text-xs text-zinc-500 hover:underline">
        ← Studies
      </Link>
      <div className="mt-1 flex items-center gap-2">
        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium">{study.type.replace(/_/g, " ")}</span>
        <ConfidenceBadge mode={study.confidenceMode} />
      </div>
      <h1 className="text-lg font-semibold tracking-tight mt-2">{study.researchQuestion}</h1>
      {study.stimulus && (
        <p className="mt-1 text-sm text-zinc-500">
          Stimulus: {study.stimulus.title}
          {study.stimulus.content && ` — ${study.stimulus.content.slice(0, 140)}`}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Runs</h2>
        <button onClick={() => setShowNewRun((s) => !s)} className="text-xs font-medium text-indigo-600 hover:underline">
          + New run
        </button>
      </div>

      {showNewRun && (
        <div className="mt-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-3">
          <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {personas.map((p) => (
              <label key={p.id} className="flex items-center gap-2 py-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(p.id)) next.delete(p.id);
                      else next.add(p.id);
                      return next;
                    })
                  }
                />
                {p.name}
              </label>
            ))}
          </div>
          <button
            onClick={startRun}
            disabled={starting || selected.size === 0}
            className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {starting ? "Starting…" : "Start run"}
          </button>
        </div>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {study.runs.map((run) => (
          <li key={run.id}>
            <Link
              href={`/runs/${run.id}`}
              className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 hover:border-indigo-400"
            >
              <div>
                <span className="text-sm font-medium">
                  {run.mode === "PANEL" ? `Panel (${run.participants.length})` : "1:1 depth"}
                </span>
                <span className="ml-2 text-xs text-zinc-500">{run.participants.map((p) => p.persona.name).join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                {run.insight && (
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium">
                    {run.insight.recommendation}
                  </span>
                )}
                <span className="text-xs text-zinc-400">{run.status}</span>
              </div>
            </Link>
          </li>
        ))}
        {study.runs.length === 0 && <p className="text-sm text-zinc-500">No runs yet.</p>}
      </ul>
    </div>
  );
}
