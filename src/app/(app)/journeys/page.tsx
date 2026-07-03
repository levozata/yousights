"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JourneyListItem = {
  id: string;
  name: string;
  scaffoldSource: string | null;
  stages: { key: string; label: string }[];
  _count: { sessions: number };
};

export default function JourneysPage() {
  const [journeys, setJourneys] = useState<JourneyListItem[] | null>(null);

  useEffect(() => {
    fetch("/api/journeys").then((r) => r.json()).then(setJourneys);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Journeys</h1>
          <p className="text-sm text-zinc-500">Map how personas move through a flow, stage by stage.</p>
        </div>
        <Link href="/journeys/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          + New journey
        </Link>
      </div>

      {journeys === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : journeys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No journeys yet.{" "}
          <Link href="/journeys/new" className="text-indigo-600 hover:underline">
            Create one
          </Link>{" "}
          or load a{" "}
          <Link href="/packs" className="text-indigo-600 hover:underline">
            sector pack
          </Link>{" "}
          for a ready-made scaffold.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {journeys.map((j) => (
            <li key={j.id}>
              <Link
                href={`/journeys/${j.id}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-indigo-400"
              >
                <h3 className="font-medium">{j.name}</h3>
                <p className="mt-1 text-xs text-zinc-500">{j.stages.map((s) => s.label).join(" → ")}</p>
                <p className="mt-2 text-[11px] text-zinc-400">
                  {j._count.sessions} persona walk(s){j.scaffoldSource && j.scaffoldSource !== "custom" ? ` · from ${j.scaffoldSource} pack` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
