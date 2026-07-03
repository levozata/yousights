"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GroundingBadge } from "@/components/badges";

type PersonaListItem = {
  id: string;
  name: string;
  tagline: string | null;
  role: string | null;
  tags: string[];
  groundingStrength: number;
  segment: { id: string; name: string } | null;
  _count: { groundingSources: number };
};

export default function PersonaLibraryPage() {
  const [personas, setPersonas] = useState<PersonaListItem[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    fetch(`/api/personas?${params}`)
      .then((r) => r.json())
      .then(setPersonas);
  }, [q]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Persona library</h1>
          <p className="text-sm text-zinc-500">Grounded synthetic respondents, reusable across studies.</p>
        </div>
        <Link href="/personas/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          + New persona
        </Link>
      </div>

      <input
        className="mb-5 w-full max-w-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Search personas, roles, tags…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {personas === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : personas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No personas yet.{" "}
          <Link href="/personas/new" className="text-indigo-600 hover:underline">
            Create your first one
          </Link>{" "}
          or load a{" "}
          <Link href="/packs" className="text-indigo-600 hover:underline">
            sector pack
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((p) => (
            <Link
              key={p.id}
              href={`/personas/${p.id}`}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                  {p.role && <p className="text-xs text-zinc-500">{p.role}</p>}
                </div>
                <GroundingBadge score={p.groundingStrength} />
              </div>
              {p.tagline && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{p.tagline}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {p.segment && (
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                    {p.segment.name}
                  </span>
                )}
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                    {t}
                  </span>
                ))}
                <span className="ml-auto text-[11px] text-zinc-400">{p._count.groundingSources} source(s)</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
