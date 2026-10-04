"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { Profile } from "@/lib/types";
import { completeOnboardingAction } from "@/app/actions";
import { TagInput } from "@/components/TagInput";
import { CITIZENSHIPS, LEVELS, inputCls } from "@/components/profileOptions";

const STEPS = ["Basics", "Academic", "Skills & interests"] as const;

export function OnboardingFlow({ profile }: { profile: Profile }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [citizenship, setCitizenship] = useState(profile.citizenship);
  const [level, setLevel] = useState(profile.level);
  const [field, setField] = useState(profile.field);
  const [college, setCollege] = useState(profile.college);
  const [gpa, setGpa] = useState(profile.gpa);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      const r = await completeOnboardingAction({
        name, location, citizenship, level, field, college, gpa, skills, interests,
      });
      // Only returns on validation failure; success redirects to /opportunities.
      if (r && !r.ok) setError(r.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      <ol className="grid grid-cols-3 border-b border-ink" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`px-3 py-3 text-center text-sm ${i === step ? "bg-ink text-card" : i < step ? "text-ink" : "text-ink-soft"} ${i > 0 ? "border-l border-ink" : ""}`}
          >
            <span className="font-mono text-[0.72rem]">{i < step ? "✓" : `0${i + 1}`}</span>{" "}
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      <div className="space-y-5 p-5 sm:p-6">
        <h2 className="font-display text-2xl">
          Step {step + 1} of 3 · {STEPS[step]}
        </h2>

        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Location (city, state)">
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Pune, Maharashtra" className={inputCls} />
            </Field>
            <Field label="Citizenship">
              <select required value={citizenship} onChange={(e) => setCitizenship(e.target.value)} className={inputCls}>
                <option value="" disabled>Select…</option>
                {CITIZENSHIPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Level of study">
              <select required value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                <option value="" disabled>Select…</option>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Field of study">
              <input required value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. Computer Science" className={inputCls} />
            </Field>
            <Field label="College / school">
              <input required value={college} onChange={(e) => setCollege(e.target.value)} className={inputCls} />
            </Field>
            <Field label="GPA / CGPA (optional)">
              <input value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 8.2 / 10" className={inputCls} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Skills" as="div">
              <TagInput value={skills} onChange={setSkills} placeholder="Python, design, public speaking…" label="Add skills, separated by commas" />
            </Field>
            <Field label="Interests" as="div">
              <TagInput value={interests} onChange={setInterests} placeholder="Climate, fintech, robotics…" label="Add interests, separated by commas" />
            </Field>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-urgent">{error}</p>}

        <div className="flex items-center justify-between gap-3 border-t border-rule pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="h-11 rounded-full border border-ink px-5 text-sm hover:bg-paper-deep">
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-ink px-6 font-medium text-card transition-colors hover:bg-signal-ink disabled:opacity-50"
          >
            {step < 2 ? "Continue" : pending ? "Saving…" : "Finish & see opportunities"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children, as = "label" }: { label: string; children: ReactNode; as?: "label" | "div" }) {
  const Tag = as;
  return (
    <Tag className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
    </Tag>
  );
}
