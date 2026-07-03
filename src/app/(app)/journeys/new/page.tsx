"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

export default function NewJourneyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [stages, setStages] = useState([{ key: "stage_1", label: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateStage(i: number, label: string) {
    setStages((s) => s.map((st, idx) => (idx === i ? { key: st.key, label } : st)));
  }
  function addStage() {
    setStages((s) => [...s, { key: `stage_${s.length + 1}`, label: "" }]);
  }
  function removeStage(i: number) {
    setStages((s) => s.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setError(null);
    const cleanStages = stages.filter((s) => s.label.trim()).map((s, i) => ({ key: `stage_${i + 1}`, label: s.label.trim() }));
    if (!name.trim()) return setError("Journey name is required");
    if (cleanStages.length === 0) return setError("Add at least one stage");

    setSubmitting(true);
    const res = await fetch("/api/journeys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stages: cleanStages, scaffoldSource: "custom" }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to create journey");
      setSubmitting(false);
      return;
    }
    const journey = await res.json();
    router.push(`/journeys/${journey.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-semibold tracking-tight mb-1">New journey</h1>
      <p className="text-sm text-zinc-500 mb-6">Define the stages a persona will walk through, one at a time.</p>

      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Journey name</label>
      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Checkout journey" />

      <div className="mt-4">
        <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">Stages</span>
        <div className="flex flex-col gap-2">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-xs text-zinc-400">{i + 1}</span>
              <input className={inputClass} value={s.label} onChange={(e) => updateStage(i, e.target.value)} placeholder={`Stage ${i + 1} label`} />
              <button onClick={() => removeStage(i)} className="text-zinc-400 hover:text-red-600 text-sm">
                ×
              </button>
            </div>
          ))}
        </div>
        <button onClick={addStage} className="mt-2 text-xs font-medium text-indigo-600 hover:underline">
          + Add stage
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create journey"}
      </button>
    </div>
  );
}
