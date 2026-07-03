"use client";

import { useEffect, useState } from "react";

type Pack = {
  slug: string;
  name: string;
  description: string;
  note: string | null;
  segmentCount: number;
  personaCount: number;
  groundingTemplates: string[];
  loaded: boolean;
};

export default function SectorPacksPage() {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  function load() {
    fetch("/api/sector-packs").then((r) => r.json()).then(setPacks);
  }
  useEffect(load, []);

  async function loadPack(slug: string) {
    setLoading(slug);
    await fetch(`/api/sector-packs/${slug}/load`, { method: "POST" });
    setLoading(null);
    load();
  }

  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight mb-1">Sector packs</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Pre-built segment libraries and study framings to get useful research on day one. Packs are starting points —
        grounding strength stays visible so you know to calibrate before trusting output.
      </p>

      {packs === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packs.map((p) => (
            <div key={p.slug} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{p.name}</h3>
                {p.loaded && (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-medium">
                    Loaded
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {p.segmentCount} segments · {p.personaCount} starter personas
              </p>
              {p.note && (
                <p className="mt-2 rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5 text-xs text-amber-800 dark:text-amber-300">{p.note}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                {p.groundingTemplates.map((g) => (
                  <span key={g} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">
                    {g}
                  </span>
                ))}
              </div>
              <button
                onClick={() => loadPack(p.slug)}
                disabled={p.loaded || loading === p.slug}
                className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {p.loaded ? "Already loaded" : loading === p.slug ? "Loading…" : "Load into workspace"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
