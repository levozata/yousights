"use client";

import { useState } from "react";

export type PersonaFormValue = {
  name: string;
  tagline: string;
  role: string;
  demographics: Record<string, string>;
  context: string;
  beliefs: string;
  priorAttempts: string;
  skepticismSources: string;
  decisionProcess: string;
  consults: string;
  dealbreakers: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  values: string[];
  motivations: string;
  decisionBehaviour: string;
  tags: string[];
};

const TRAIT_LABELS: [keyof PersonaFormValue["bigFive"], string][] = [
  ["openness", "Openness"],
  ["conscientiousness", "Conscientiousness"],
  ["extraversion", "Extraversion"],
  ["agreeableness", "Agreeableness"],
  ["neuroticism", "Neuroticism"],
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500";

function ChipList({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-zinc-700">
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        className={inputClass}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onChange([...values, draft.trim()]);
            setDraft("");
          }
        }}
      />
    </div>
  );
}

export function PersonaForm({
  value,
  onChange,
  provenanceFields,
}: {
  value: PersonaFormValue;
  onChange: (v: PersonaFormValue) => void;
  provenanceFields?: Set<string>;
}) {
  const set = <K extends keyof PersonaFormValue>(key: K, v: PersonaFormValue[K]) => onChange({ ...value, [key]: v });

  const label = (base: string, field: string) =>
    provenanceFields?.has(field) ? `${base} (from grounding data)` : base;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Identity</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input className={inputClass} value={value.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Role">
            <input className={inputClass} value={value.role} onChange={(e) => set("role", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Tagline" hint="One-line summary shown in the persona library">
            <input className={inputClass} value={value.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={label("Context / situation", "context")}>
            <textarea className={inputClass} rows={2} value={value.context} onChange={(e) => set("context", e.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Point of view</h3>
        <div className="flex flex-col gap-4">
          <Field label={label("Existing beliefs", "beliefs")}>
            <textarea className={inputClass} rows={2} value={value.beliefs} onChange={(e) => set("beliefs", e.target.value)} />
          </Field>
          <Field label={label("What they've already tried", "priorAttempts")}>
            <textarea className={inputClass} rows={2} value={value.priorAttempts} onChange={(e) => set("priorAttempts", e.target.value)} />
          </Field>
          <Field label={label("Sources of skepticism", "skepticismSources")}>
            <textarea className={inputClass} rows={2} value={value.skepticismSources} onChange={(e) => set("skepticismSources", e.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Behavioural constraints</h3>
        <div className="flex flex-col gap-4">
          <Field label={label("How they decide", "decisionProcess")}>
            <textarea className={inputClass} rows={2} value={value.decisionProcess} onChange={(e) => set("decisionProcess", e.target.value)} />
          </Field>
          <Field label={label("Who they consult", "consults")}>
            <input className={inputClass} value={value.consults} onChange={(e) => set("consults", e.target.value)} />
          </Field>
          <Field label={label("What makes them say no", "dealbreakers")}>
            <textarea className={inputClass} rows={2} value={value.dealbreakers} onChange={(e) => set("dealbreakers", e.target.value)} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Psychographic layer
          <span className="ml-2 text-xs font-normal text-zinc-400">shapes the simulation directly</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 mb-4">
          {TRAIT_LABELS.map(([key, l]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-40 text-xs text-zinc-600 dark:text-zinc-400">{l}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={value.bigFive[key]}
                onChange={(e) => set("bigFive", { ...value.bigFive, [key]: Number(e.target.value) })}
                className="flex-1"
              />
              <span className="w-8 text-right text-xs tabular-nums text-zinc-500">{value.bigFive[key]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Core values">
            <ChipList values={value.values} onChange={(v) => set("values", v)} placeholder="Add a value, press Enter" />
          </Field>
          <Field label="Tags">
            <ChipList values={value.tags} onChange={(v) => set("tags", v)} placeholder="Add a tag, press Enter" />
          </Field>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <Field label={label("Motivations", "motivations")}>
            <textarea className={inputClass} rows={2} value={value.motivations} onChange={(e) => set("motivations", e.target.value)} />
          </Field>
          <Field label={label("Decision / buying behaviour", "decisionBehaviour")}>
            <textarea className={inputClass} rows={2} value={value.decisionBehaviour} onChange={(e) => set("decisionBehaviour", e.target.value)} />
          </Field>
        </div>
      </section>
    </div>
  );
}

export const EMPTY_PERSONA_FORM: PersonaFormValue = {
  name: "",
  tagline: "",
  role: "",
  demographics: {},
  context: "",
  beliefs: "",
  priorAttempts: "",
  skepticismSources: "",
  decisionProcess: "",
  consults: "",
  dealbreakers: "",
  bigFive: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
  values: [],
  motivations: "",
  decisionBehaviour: "",
  tags: [],
};
