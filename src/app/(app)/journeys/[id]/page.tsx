"use client";

import { useEffect, useState, use as usePromise, useCallback } from "react";
import Link from "next/link";

type StageResponse = {
  stageKey: string;
  action: string | null;
  thought: string | null;
  emotionValence: number | null;
  emotionIntensity: number | null;
  painPoint: string | null;
  opportunity: string | null;
};
type JourneySession = {
  id: string;
  persona: { id: string; name: string; tagline: string | null; groundingStrength: number };
  stageResponses: StageResponse[];
};
type Journey = {
  id: string;
  name: string;
  stages: { key: string; label: string }[];
  sessions: JourneySession[];
};
type Persona = { id: string; name: string };

function emotionColor(valence: number | null) {
  if (valence === null) return "bg-zinc-200 dark:bg-zinc-800";
  if (valence <= -1) return "bg-red-500";
  if (valence < 0) return "bg-amber-500";
  if (valence === 0) return "bg-zinc-400";
  if (valence === 1) return "bg-emerald-400";
  return "bg-emerald-600";
}

function EmotionCurve({ stages, responses }: { stages: { key: string }[]; responses: StageResponse[] }) {
  const width = 200;
  const height = 32;
  const points = stages.map((s, i) => {
    const r = responses.find((res) => res.stageKey === s.key);
    const v = r?.emotionValence ?? 0;
    const x = (i / Math.max(stages.length - 1, 1)) * width;
    const y = height / 2 - (v / 2) * (height / 2 - 4);
    return { x, y, has: !!r };
  });
  const path = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity={0.15} />
      <polyline points={path} fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.has ? 3 : 1.5} fill={p.has ? "currentColor" : "none"} stroke="currentColor" opacity={p.has ? 0.8 : 0.3} />
      ))}
    </svg>
  );
}

export default function JourneyCanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addPersonaId, setAddPersonaId] = useState("");

  const load = useCallback(() => {
    fetch(`/api/journeys/${id}`).then((r) => r.json()).then((j: Journey) => {
      setJourney(j);
      setSelectedPersonaIds((prev) => {
        const existing = j.sessions.map((s) => s.persona.id);
        return Array.from(new Set([...prev, ...existing]));
      });
    });
  }, [id]);

  useEffect(load, [load]);
  useEffect(() => {
    fetch("/api/personas").then((r) => r.json()).then((ps: { id: string; name: string }[]) => setPersonas(ps));
  }, []);

  async function runStage(personaId: string, stageKey: string, stageLabel: string) {
    const cellKey = `${personaId}:${stageKey}`;
    const defaultPrompt = `You're at "${stageLabel}". Narrate what you'd do, think, and feel here.`;
    const stagePrompt = prompt(`Prompt for "${stageLabel}"`, defaultPrompt);
    if (!stagePrompt) return;
    setRunning(cellKey);
    await fetch(`/api/journeys/${id}/walk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId, stageKey, stagePrompt }),
    });
    setRunning(null);
    load();
  }

  if (!journey) return <p className="text-sm text-zinc-500">Loading…</p>;

  const rows = selectedPersonaIds
    .map((pid) => {
      const session = journey.sessions.find((s) => s.persona.id === pid);
      const personaMeta = personas.find((p) => p.id === pid);
      return session ?? (personaMeta ? { id: pid, persona: { id: pid, name: personaMeta.name, tagline: null, groundingStrength: 0 }, stageResponses: [] } : null);
    })
    .filter((r): r is JourneySession => !!r);

  return (
    <div className="max-w-6xl">
      <Link href="/journeys" className="text-xs text-zinc-500 hover:underline">
        ← Journeys
      </Link>
      <h1 className="text-lg font-semibold tracking-tight mt-1 mb-4">{journey.name}</h1>

      <div className="mb-4 flex items-center gap-2">
        <select className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" value={addPersonaId} onChange={(e) => setAddPersonaId(e.target.value)}>
          <option value="">Add persona to journey…</option>
          {personas.filter((p) => !selectedPersonaIds.includes(p.id)).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          disabled={!addPersonaId}
          onClick={() => {
            setSelectedPersonaIds((s) => [...s, addPersonaId]);
            setAddPersonaId("");
          }}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Add a persona above to start walking them through this journey.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-zinc-500 w-40">Persona</th>
                {journey.stages.map((s) => (
                  <th key={s.key} className="text-left text-xs font-medium text-zinc-500 min-w-[160px]">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.persona.id}>
                  <td className="align-top">
                    <Link href={`/personas/${row.persona.id}`} className="text-sm font-medium hover:underline">
                      {row.persona.name}
                    </Link>
                    <div className="mt-2 text-zinc-400">
                      <EmotionCurve stages={journey.stages} responses={row.stageResponses} />
                    </div>
                  </td>
                  {journey.stages.map((s) => {
                    const r = row.stageResponses.find((res) => res.stageKey === s.key);
                    const cellKey = `${row.persona.id}:${s.key}`;
                    const isExpanded = expanded === cellKey;
                    return (
                      <td key={s.key} className="align-top">
                        {!r ? (
                          <button
                            onClick={() => runStage(row.persona.id, s.key, s.label)}
                            disabled={running === cellKey}
                            className="rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs text-zinc-500 hover:border-indigo-400 w-full"
                          >
                            {running === cellKey ? "Running…" : "Run stage"}
                          </button>
                        ) : (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : cellKey)}
                            className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 p-2 text-left text-xs hover:border-indigo-400"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`inline-block h-2 w-2 rounded-full ${emotionColor(r.emotionValence)}`} />
                              <span className="font-medium">{r.action}</span>
                            </div>
                            {isExpanded && (
                              <div className="mt-1 flex flex-col gap-1 text-zinc-500">
                                <p>
                                  <span className="font-medium text-zinc-600 dark:text-zinc-400">Thought: </span>
                                  {r.thought}
                                </p>
                                {r.painPoint && (
                                  <p>
                                    <span className="font-medium text-red-600">Pain: </span>
                                    {r.painPoint}
                                  </p>
                                )}
                                {r.opportunity && (
                                  <p>
                                    <span className="font-medium text-emerald-600">Opportunity: </span>
                                    {r.opportunity}
                                  </p>
                                )}
                              </div>
                            )}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
