"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/badges";

type StudyListItem = {
  id: string;
  type: string;
  researchQuestion: string;
  confidenceMode: "STATED_PREFERENCE" | "PREDICTED_BEHAVIOUR";
  createdAt: string;
  stimulus: { title: string } | null;
  runs: { id: string; mode: string; status: string }[];
};

const TYPE_LABEL: Record<string, string> = {
  UX_WALKTHROUGH: "UX walkthrough",
  CONCEPT_TEST: "Concept test",
  PRODUCT_VALIDATION: "Product validation",
  MESSAGE_TEST: "Message test",
  SEGMENTATION: "Segmentation",
};

export default function StudiesPage() {
  const [studies, setStudies] = useState<StudyListItem[] | null>(null);

  useEffect(() => {
    fetch("/api/studies").then((r) => r.json()).then(setStudies);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Studies</h1>
          <p className="text-sm text-zinc-500">UX walkthroughs, concept tests, validation, and message tests.</p>
        </div>
        <Link href="/studies/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          + New study
        </Link>
      </div>

      {studies === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : studies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-sm text-zinc-500">
          No studies yet.{" "}
          <Link href="/studies/new" className="text-indigo-600 hover:underline">
            Start one
          </Link>{" "}
          — every study starts with a single-sentence research question.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {studies.map((s) => (
            <li key={s.id}>
              <Link
                href={`/studies/${s.id}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    {TYPE_LABEL[s.type] ?? s.type}
                  </span>
                  <ConfidenceBadge mode={s.confidenceMode} />
                  <span className="ml-auto text-xs text-zinc-400">{s.runs.length} run(s)</span>
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.researchQuestion}</p>
                {s.stimulus && <p className="mt-1 text-xs text-zinc-500">Stimulus: {s.stimulus.title}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
