"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Persona = { id: string; name: string; tagline: string | null; segmentId: string | null };
type Segment = { id: string; name: string };

const STUDY_TYPES: { value: string; label: string; hint: string }[] = [
  { value: "UX_WALKTHROUGH", label: "UX / usability walkthrough", hint: "Directional friction-finding, not a replacement for observed testing." },
  { value: "CONCEPT_TEST", label: "Concept test", hint: "Desirability, comprehension, and fit." },
  { value: "PRODUCT_VALIDATION", label: "Product validation", hint: "Ship / kill / refine gate for a product decision." },
  { value: "MESSAGE_TEST", label: "Message / positioning test", hint: "Compare copy, headlines, value props, price framing." },
  { value: "SEGMENTATION", label: "Segmentation", hint: "Same question across personas — divergence is the finding." },
];

const PROMPT_PATTERNS = [
  { value: "STANDARD", label: "Standard" },
  { value: "EXPLAIN_AND_EVALUATE", label: "Explain-and-evaluate" },
  { value: "COMPARE_AND_JUSTIFY", label: "Compare-and-justify" },
  { value: "OBJECTION_SURFACE", label: "Objection-surface" },
];

const PANEL_PRESETS = ["Customer Panel", "User Panel", "Expert Panel", "Stakeholder Panel"];

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

export default function NewStudyPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
      <NewStudyForm />
    </Suspense>
  );
}

function NewStudyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPersonaId = searchParams.get("personaId");

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [type, setType] = useState("PRODUCT_VALIDATION");
  const [promptPattern, setPromptPattern] = useState("STANDARD");
  const [confidenceMode, setConfidenceMode] = useState<"STATED_PREFERENCE" | "PREDICTED_BEHAVIOUR">("STATED_PREFERENCE");
  const [researchQuestion, setResearchQuestion] = useState("");
  const [stimulusTitle, setStimulusTitle] = useState("");
  const [stimulusContent, setStimulusContent] = useState("");
  const [stimulusUrl, setStimulusUrl] = useState("");
  const [stimulusType, setStimulusType] = useState<"TEXT" | "URL">("TEXT");
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(
    () => new Set(preselectedPersonaId ? [preselectedPersonaId] : []),
  );
  const [panelPreset, setPanelPreset] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/personas").then((r) => r.json()).then(setPersonas);
    fetch("/api/segments").then((r) => r.json()).then(setSegments);
  }, []);

  function togglePersona(id: string) {
    setSelectedPersonaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectSegment(segmentId: string) {
    const ids = personas.filter((p) => p.segmentId === segmentId).map((p) => p.id);
    setSelectedPersonaIds(new Set(ids));
  }

  async function submit() {
    setError(null);
    if (!researchQuestion.trim()) return setError("A single-sentence research question is required");
    if (selectedPersonaIds.size === 0) return setError("Select at least one persona");

    setSubmitting(true);
    try {
      let stimulusId: string | undefined;
      if (stimulusTitle.trim() && (stimulusContent.trim() || stimulusUrl.trim())) {
        const res = await fetch("/api/stimuli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: stimulusTitle,
            type: stimulusType,
            content: stimulusContent || null,
            url: stimulusUrl || null,
          }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save stimulus");
        stimulusId = (await res.json()).id;
      }

      const studyRes = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, researchQuestion, promptPattern, confidenceMode, stimulusId }),
      });
      if (!studyRes.ok) throw new Error((await studyRes.json()).error ?? "Failed to create study");
      const study = await studyRes.json();

      const personaIds = Array.from(selectedPersonaIds);
      const runRes = await fetch(`/api/studies/${study.id}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaIds,
          mode: personaIds.length > 1 ? "PANEL" : "SOLO",
          panelPreset: personaIds.length > 1 ? panelPreset || null : null,
        }),
      });
      if (!runRes.ok) throw new Error((await runRes.json()).error ?? "Failed to start run");
      const run = await runRes.json();

      router.push(`/runs/${run.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const segmentsWithCounts = segments.map((s) => ({ ...s, count: personas.filter((p) => p.segmentId === s.id).length }));

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold tracking-tight mb-1">Study builder</h1>
      <p className="text-sm text-zinc-500 mb-6">Define the question, attach a stimulus, pick your panel, and run.</p>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">1. Study type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STUDY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`text-left rounded-md border px-3 py-2 text-sm ${
                type === t.value
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-zinc-500">{t.hint}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">2. Research question</h2>
        <p className="text-xs text-zinc-500 mb-2">One sentence. This is required — it&apos;s what keeps a run decision-focused.</p>
        <input
          className={inputClass}
          value={researchQuestion}
          onChange={(e) => setResearchQuestion(e.target.value)}
          placeholder="Does this pricing page change reduce hesitation for SME buyers?"
        />
        <div className="mt-3 flex gap-4 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={confidenceMode === "STATED_PREFERENCE"}
              onChange={() => setConfidenceMode("STATED_PREFERENCE")}
            />
            Stated preference
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={confidenceMode === "PREDICTED_BEHAVIOUR"}
              onChange={() => setConfidenceMode("PREDICTED_BEHAVIOUR")}
            />
            Predicted behaviour
          </label>
        </div>
        <div className="mt-3">
          <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Prompt pattern</span>
          <select className={inputClass} value={promptPattern} onChange={(e) => setPromptPattern(e.target.value)}>
            {PROMPT_PATTERNS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">3. Stimulus (optional)</h2>
        <div className="flex flex-col gap-2">
          <input className={inputClass} placeholder="Stimulus title" value={stimulusTitle} onChange={(e) => setStimulusTitle(e.target.value)} />
          <div className="flex gap-2">
            <select className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-2 text-sm" value={stimulusType} onChange={(e) => setStimulusType(e.target.value as "TEXT" | "URL")}>
              <option value="TEXT">Text description</option>
              <option value="URL">URL / prototype link</option>
            </select>
          </div>
          {stimulusType === "TEXT" ? (
            <textarea
              className={inputClass}
              rows={3}
              placeholder="Describe the concept, message, or screen"
              value={stimulusContent}
              onChange={(e) => setStimulusContent(e.target.value)}
            />
          ) : (
            <input className={inputClass} placeholder="https://…" value={stimulusUrl} onChange={(e) => setStimulusUrl(e.target.value)} />
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-2">4. Select personas / segment / panel</h2>
        {segmentsWithCounts.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {segmentsWithCounts.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSegment(s.id)}
                className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-xs hover:border-indigo-400"
              >
                Select segment: {s.name} ({s.count})
              </button>
            ))}
          </div>
        )}
        <div className="max-h-72 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-900">
          {personas.map((p) => (
            <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <input type="checkbox" checked={selectedPersonaIds.has(p.id)} onChange={() => togglePersona(p.id)} />
              <div>
                <div className="font-medium">{p.name}</div>
                {p.tagline && <div className="text-xs text-zinc-500">{p.tagline}</div>}
              </div>
            </label>
          ))}
          {personas.length === 0 && <p className="px-3 py-4 text-sm text-zinc-500">No personas yet.</p>}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {selectedPersonaIds.size <= 1 ? "1 persona → 1:1 depth conversation." : `${selectedPersonaIds.size} personas → panel run with synthesis.`}
        </p>
        {selectedPersonaIds.size > 1 && (
          <div className="mt-2">
            <select className={inputClass} value={panelPreset} onChange={(e) => setPanelPreset(e.target.value)}>
              <option value="">No preset framing</option>
              {PANEL_PRESETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? "Starting run…" : "Run study"}
      </button>
    </div>
  );
}
