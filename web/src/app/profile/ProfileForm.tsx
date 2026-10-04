"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "5th year", "Postgraduate"];
const DOCUMENTS = [
  "Marksheets",
  "Income certificate",
  "Resume / CV",
  "ID proof (Aadhaar etc.)",
  "Bonafide certificate",
  "Caste / category certificate",
  "Recommendation letter",
];

const inputCls =
  "h-11 w-full rounded-sm border border-rule bg-paper px-3 text-base outline-none transition-colors focus:border-ink";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");

  function addSkill() {
    const parts = skillDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) setSkills((prev) => [...new Set([...prev, ...parts])]);
    setSkillDraft("");
  }

  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Account</legend>
        <Field label="Name">
          <input value={name} readOnly className={`${inputCls} text-ink-soft`} />
        </Field>
        <Field label="Email">
          <input value={email} readOnly className={`${inputCls} text-ink-soft`} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Studies</legend>
        <Field label="Year">
          <select defaultValue="" className={inputCls}>
            <option value="" disabled>
              Select…
            </option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="Branch / course">
          <input placeholder="e.g. B.Tech Computer Science" className={inputCls} />
        </Field>
        <Field label="Location (city, state)">
          <input placeholder="e.g. Pune, Maharashtra" className={inputCls} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Skills</legend>
        <div className="flex flex-wrap gap-2 rounded-sm border border-rule bg-paper p-2 focus-within:border-ink">
          {skills.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
              className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-sm text-card hover:bg-signal"
              aria-label={`Remove ${s}`}
            >
              {s} <span aria-hidden>×</span>
            </button>
          ))}
          <input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={onSkillKey}
            onBlur={addSkill}
            placeholder={skills.length ? "Add more…" : "Python, React, public speaking…"}
            aria-label="Add skills, separated by commas"
            className="h-8 min-w-40 flex-1 bg-transparent px-1 text-base outline-none"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Documents on hand</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {DOCUMENTS.map((d) => (
            <label
              key={d}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border border-rule bg-card px-3 has-[:checked]:border-ink"
            >
              <input type="checkbox" className="h-4 w-4 accent-[var(--ink)]" />
              <span className="text-sm">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-6">
        <button
          type="submit"
          disabled
          className="h-11 rounded-full bg-ink px-6 font-medium text-card opacity-40"
        >
          Save profile
        </button>
        <p className="font-mono text-xs text-ink-soft">
          Saving comes with Supabase tables.
        </p>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
