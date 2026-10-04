"use client";

import { useState, type KeyboardEvent } from "react";

// Comma/Enter separated tags. Pending text is committed on blur, and callers
// can read it with `flush` semantics by passing the latest value on submit.
export function TagInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  label: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-sm border border-rule bg-paper p-2 focus-within:border-ink">
      {value.map((t) => (
        <button
          type="button"
          key={t}
          onClick={() => onChange(value.filter((x) => x !== t))}
          className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-sm text-card hover:bg-signal-ink"
          aria-label={`Remove ${t}`}
        >
          {t} <span aria-hidden>×</span>
        </button>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={value.length ? "Add more…" : placeholder}
        aria-label={label}
        className="h-8 min-w-40 flex-1 bg-transparent px-1 text-base outline-none"
      />
    </div>
  );
}
