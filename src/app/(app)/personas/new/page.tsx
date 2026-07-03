"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaForm, PersonaFormValue } from "@/components/persona-form";

type Mode = "brief" | "ground";

export default function NewPersonaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("brief");
  const [brief, setBrief] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PersonaFormValue | null>(null);
  const [origin, setOrigin] = useState<"BRIEF" | "GROUNDED">("BRIEF");

  async function generateDraft() {
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "brief" ? "/api/personas/expand-brief" : "/api/personas/extract";
      const body = mode === "brief" ? { brief } : { sourceText, sourceTitle };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to generate draft");
      const data = await res.json();
      setDraft(data);
      setOrigin(mode === "brief" ? "BRIEF" : "GROUNDED");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function savePersona() {
    if (!draft) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          origin,
          sourceLabel: mode === "ground" ? sourceTitle : undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save persona");
      const persona = await res.json();

      if (mode === "ground" && sourceText) {
        await fetch(`/api/personas/${persona.id}/grounding`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: sourceTitle, rawText: sourceText, type: "OTHER" }),
        });
      }

      router.push(`/personas/${persona.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold tracking-tight mb-1">New persona</h1>
      <p className="text-sm text-zinc-500 mb-6">
        A generic persona returns generic insight — ground it in real material whenever you can.
      </p>

      {!draft && (
        <>
          <div className="mb-5 flex gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 w-fit">
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "brief" ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500"}`}
              onClick={() => setMode("brief")}
            >
              Write a brief
            </button>
            <button
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === "ground" ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500"}`}
              onClick={() => setMode("ground")}
            >
              Ground from data
            </button>
          </div>

          {mode === "brief" ? (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                2-3 sentences: who they are, their context, what they know
              </label>
              <textarea
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="A 38-year-old head of procurement at a 300-person German manufacturer, reports to the CFO, has been burned by hidden implementation costs before."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Source title</label>
                <input
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="Interview transcript — Customer #14"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Paste transcript, reviews, tickets, CRM notes…
                </label>
                <textarea
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={8}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={generateDraft}
            disabled={loading || (mode === "brief" ? !brief.trim() : !sourceText.trim() || !sourceTitle.trim())}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate persona draft"}
          </button>
        </>
      )}

      {draft && (
        <div>
          <div className="mb-4 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 px-3 py-2 text-xs text-indigo-800 dark:text-indigo-300">
            Review and edit the AI-expanded draft below, then save it to your library.
          </div>
          <PersonaForm value={draft} onChange={setDraft} />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex gap-2">
            <button
              onClick={savePersona}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save to library"}
            </button>
            <button
              onClick={() => setDraft(null)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
