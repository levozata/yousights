"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PersonaForm, PersonaFormValue } from "@/components/persona-form";
import { GroundingBadge } from "@/components/badges";

type GroundingSource = {
  id: string;
  title: string;
  type: string;
  rawText: string;
  fileName: string | null;
  createdAt: string;
};

type PersonaDetail = PersonaFormValue & {
  id: string;
  groundingStrength: number;
  groundingSources: GroundingSource[];
  provenance: { fieldName: string; sourceLabel: string }[];
};

export default function PersonaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [persona, setPersona] = useState<PersonaDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceType, setSourceType] = useState("OTHER");
  const [addingSource, setAddingSource] = useState(false);

  function load() {
    fetch(`/api/personas/${id}`)
      .then((r) => r.json())
      .then(setPersona);
  }

  useEffect(load, [id]);

  async function save() {
    if (!persona) return;
    setSaving(true);
    await fetch(`/api/personas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(persona),
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  async function addSource() {
    if (!sourceTitle.trim() || !sourceText.trim()) return;
    setAddingSource(true);
    await fetch(`/api/personas/${id}/grounding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: sourceTitle, rawText: sourceText, type: sourceType }),
    });
    setSourceTitle("");
    setSourceText("");
    setAddingSource(false);
    setShowAddSource(false);
    load();
  }

  async function removeSource(sourceId: string) {
    await fetch(`/api/personas/${id}/grounding/${sourceId}`, { method: "DELETE" });
    load();
  }

  async function deletePersona() {
    if (!confirm("Delete this persona? This can't be undone.")) return;
    await fetch(`/api/personas/${id}`, { method: "DELETE" });
    router.push("/personas");
  }

  if (!persona) return <p className="text-sm text-zinc-500">Loading…</p>;

  const provenanceFields = new Set(persona.provenance.map((p) => p.fieldName));

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/personas" className="text-xs text-zinc-500 hover:underline">
            ← Persona library
          </Link>
          <h1 className="text-lg font-semibold tracking-tight mt-1">{persona.name || "Untitled persona"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <GroundingBadge score={persona.groundingStrength} />
          <Link
            href={`/studies/new?personaId=${id}`}
            className="rounded-md border border-indigo-300 dark:border-indigo-800 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
          >
            Run a study →
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Grounding sources</h2>
          <button onClick={() => setShowAddSource((s) => !s)} className="text-xs font-medium text-indigo-600 hover:underline">
            + Add source
          </button>
        </div>

        {showAddSource && (
          <div className="mb-4 rounded-md border border-zinc-200 dark:border-zinc-800 p-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Source title"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
              />
              <select
                className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-2 text-sm"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              >
                {["TRANSCRIPT", "CRM_NOTE", "REVIEW", "SUPPORT_TICKET", "SURVEY_VERBATIM", "SALES_CALL", "WEB_RESEARCH", "OTHER"].map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ").toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              rows={5}
              placeholder="Paste transcript, reviews, tickets, CRM notes…"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
            <div>
              <button
                onClick={addSource}
                disabled={addingSource}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {addingSource ? "Adding…" : "Add & re-embed"}
              </button>
            </div>
          </div>
        )}

        {persona.groundingSources.length === 0 ? (
          <p className="text-sm text-zinc-500">No grounding sources yet — this persona is a directional estimate.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {persona.groundingSources.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-zinc-500">{s.type.replace("_", " ").toLowerCase()} · {s.rawText.length.toLocaleString()} chars</p>
                </div>
                <button onClick={() => removeSource(s.id)} className="text-xs text-red-600 hover:underline shrink-0">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PersonaForm value={persona} onChange={(v) => setPersona({ ...persona, ...v })} provenanceFields={provenanceFields} />

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {savedAt && <span className="text-xs text-zinc-500">Saved</span>}
        <button onClick={deletePersona} className="ml-auto text-sm text-red-600 hover:underline">
          Delete persona
        </button>
      </div>
    </div>
  );
}
