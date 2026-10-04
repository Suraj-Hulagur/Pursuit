"use client";

import { useState, useTransition, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import type { Profile } from "@/lib/types";
import { updateProfileAction } from "@/app/actions";

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

export function ProfileForm({ profile }: { profile: Profile }) {
  const [year, setYear] = useState(profile.year);
  const [branch, setBranch] = useState(profile.branch);
  const [location, setLocation] = useState(profile.location);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [documents, setDocuments] = useState<string[]>(profile.documents);
  const [skillDraft, setSkillDraft] = useState("");
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function pendingSkills() {
    return skillDraft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function addSkill() {
    const parts = pendingSkills();
    if (parts.length) setSkills((prev) => [...new Set([...prev, ...parts])]);
    setSkillDraft("");
  }

  function onSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  function toggleDoc(d: string) {
    setDocuments((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
    setStatus(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const allSkills = [...new Set([...skills, ...pendingSkills()])];
    setSkills(allSkills);
    setSkillDraft("");
    startTransition(async () => {
      try {
        const r = await updateProfileAction({ year, branch, location, skills: allSkills, documents });
        setStatus({ text: r.message });
      } catch {
        setStatus({ text: "Couldn't save. Try again.", error: true });
      }
    });
  }

  return (
    <form className="space-y-8" onSubmit={onSubmit} onChange={() => setStatus(null)}>
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Account</legend>
        <Field label="Name">
          <input value={profile.name} readOnly className={`${inputCls} text-ink-soft`} />
        </Field>
        <Field label="Email">
          <input value={profile.email} readOnly className={`${inputCls} text-ink-soft`} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="eyebrow mb-3">Studies</legend>
        <Field label="Year">
          <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
            <option value="" disabled>
              Select…
            </option>
            {YEARS.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        <Field label="Branch / course">
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. B.Tech Computer Science"
            className={inputCls}
          />
        </Field>
        <Field label="Location (city, state)">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Pune, Maharashtra"
            className={inputCls}
          />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Skills</legend>
        <div className="flex flex-wrap gap-2 rounded-sm border border-rule bg-paper p-2 focus-within:border-ink">
          {skills.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => {
                setSkills((prev) => prev.filter((x) => x !== s));
                setStatus(null);
              }}
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
              <input
                type="checkbox"
                checked={documents.includes(d)}
                onChange={() => toggleDoc(d)}
                className="h-4 w-4 accent-[var(--ink)]"
              />
              <span className="text-sm">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 border-t border-rule pt-6">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-ink px-6 font-medium text-card transition-colors hover:bg-signal disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {status && (
          <p
            role="status"
            className={`font-mono text-xs ${status.error ? "text-signal" : "text-go"}`}
          >
            {status.text}
          </p>
        )}
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
