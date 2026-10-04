"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { Profile } from "@/lib/types";
import { updateProfileAction } from "@/app/actions";
import { TagInput } from "@/components/TagInput";
import { CITIZENSHIPS, DOCUMENTS, LEVELS, inputCls } from "@/components/profileOptions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [p, setP] = useState(profile);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  }

  function toggleDoc(d: string) {
    set("documents", p.documents.includes(d) ? p.documents.filter((x) => x !== d) : [...p.documents, d]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const r = await updateProfileAction({
          name: p.name,
          location: p.location,
          citizenship: p.citizenship,
          level: p.level,
          field: p.field,
          college: p.college,
          gpa: p.gpa,
          skills: p.skills,
          interests: p.interests,
          documents: p.documents,
          notifyDigest: p.notifyDigest,
          notifyReminders: p.notifyReminders,
        });
        setStatus({ text: r.message, error: !r.ok });
      } catch {
        setStatus({ text: "Couldn't save. Try again.", error: true });
      }
    });
  }

  return (
    <form className="space-y-9" onSubmit={onSubmit}>
      <Section title="Basics">
        <Field label="Full name">
          <input required value={p.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Email">
          <input value={p.email} readOnly className={`${inputCls} text-ink-soft`} />
        </Field>
        <Field label="Location (city, state)">
          <input value={p.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Pune, Maharashtra" className={inputCls} />
        </Field>
        <Field label="Citizenship">
          <select value={p.citizenship} onChange={(e) => set("citizenship", e.target.value)} className={inputCls}>
            <option value="" disabled>Select…</option>
            {CITIZENSHIPS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Level of study">
          <select value={p.level} onChange={(e) => set("level", e.target.value)} className={inputCls}>
            <option value="" disabled>Select…</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Academic">
        <Field label="Field of study">
          <input value={p.field} onChange={(e) => set("field", e.target.value)} placeholder="e.g. Computer Science" className={inputCls} />
        </Field>
        <Field label="College / school">
          <input value={p.college} onChange={(e) => set("college", e.target.value)} className={inputCls} />
        </Field>
        <Field label="GPA / CGPA (optional)">
          <input value={p.gpa} onChange={(e) => set("gpa", e.target.value)} placeholder="e.g. 8.2 / 10" className={inputCls} />
        </Field>
      </Section>

      <Section title="Skills & interests" cols={1}>
        <Field label="Skills" as="div">
          <TagInput value={p.skills} onChange={(v) => set("skills", v)} placeholder="Python, design, public speaking…" label="Add skills, separated by commas" />
        </Field>
        <Field label="Interests" as="div">
          <TagInput value={p.interests} onChange={(v) => set("interests", v)} placeholder="Climate, fintech, robotics…" label="Add interests, separated by commas" />
        </Field>
      </Section>

      <Section title="Documents on hand">
        {DOCUMENTS.map((d) => (
          <label
            key={d}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border border-rule bg-card px-3 has-[:checked]:border-ink"
          >
            <input type="checkbox" checked={p.documents.includes(d)} onChange={() => toggleDoc(d)} className="h-4 w-4 accent-[var(--ink)]" />
            <span className="text-sm">{d}</span>
          </label>
        ))}
      </Section>

      <Section title="Notifications" cols={1}>
        <Toggle
          label="Weekly email digest"
          hint="Your top picks and new matches, every Monday."
          checked={p.notifyDigest}
          onChange={(v) => set("notifyDigest", v)}
        />
        <Toggle
          label="Deadline reminders"
          hint="An email 7 days and 1 day before anything you've saved closes."
          checked={p.notifyReminders}
          onChange={(v) => set("notifyReminders", v)}
        />
      </Section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-rule bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-ink px-6 font-medium text-card transition-colors hover:bg-signal-ink disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {status && (
          <p role="status" className={`text-sm ${status.error ? "text-urgent" : "text-go"}`}>
            {status.text}
          </p>
        )}
      </div>
    </form>
  );
}

function Section({ title, children, cols = 2 }: { title: string; children: ReactNode; cols?: 1 | 2 }) {
  return (
    <fieldset>
      <legend className="mb-3 font-display text-2xl">{title}</legend>
      <div className={`grid gap-4 ${cols === 2 ? "sm:grid-cols-2" : ""}`}>{children}</div>
    </fieldset>
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

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-sm border border-rule bg-card p-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-ink-soft">{hint}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 shrink-0 rounded-full border border-ink-soft bg-paper-deep transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-signal/50 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-card after:shadow after:transition-all peer-checked:after:left-[1.45rem]"
      />
    </label>
  );
}
