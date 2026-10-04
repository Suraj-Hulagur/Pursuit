"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { checkOpportunityAction } from "@/app/actions";
import type { IntakeResult } from "@/lib/n8n";
import { IntakeResultCard } from "./IntakeResultCard";

// One-row intake bar. A link or pasted text goes to the n8n Intake workflow
// (via a server action); the extracted details come back as a card.
export function AddOpportunity() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const hasInput = value.trim().length > 0;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasInput || pending) return;
    setNotice(null);
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await checkOpportunityAction(value));
      } catch {
        setResult({ ok: false, executionId: null, error: "Something went wrong sending this to n8n." });
      }
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} aria-label="Add an opportunity">
        <div className="flex items-center gap-2 rounded-full border border-ink bg-card p-1.5 pl-4">
          <span className="hidden font-mono text-[0.75rem] uppercase tracking-wider text-ink-soft sm:inline">
            Add
          </span>
          <input
            type="text"
            placeholder="Paste a link or the opportunity text…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Opportunity link or text"
            disabled={pending}
            className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload a PDF or poster"
            title="Upload a PDF or poster"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule transition-colors hover:border-ink"
          >
            <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4" />
              <path d="m6 10 6-6 6 6" />
              <path d="M4 20h16" />
            </svg>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setNotice("PDF and poster uploads aren't connected to n8n yet. Paste the link or the text instead.");
              }
              e.target.value = "";
            }}
          />
          <button
            type="submit"
            disabled={pending || !hasInput}
            className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${
              hasInput
                ? "bg-signal-ink text-card hover:bg-ink"
                : "cursor-not-allowed border border-rule bg-paper-deep text-ink-soft"
            }`}
          >
            {pending ? "Checking…" : "Check it"}
          </button>
        </div>
        {(pending || notice) && (
          <p role="status" className="mt-2 pl-4 font-mono text-[0.75rem] text-ink-soft">
            {pending ? "Pursuit is reading the page with Gemini in n8n. This usually takes 10–20 seconds…" : notice}
          </p>
        )}
      </form>

      {result && (
        <IntakeResultCard
          result={result}
          onDismiss={() => {
            setResult(null);
            if (result.ok) setValue("");
          }}
        />
      )}
    </div>
  );
}
