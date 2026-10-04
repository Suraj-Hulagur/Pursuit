"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitIntake } from "@/lib/n8n";

// One-row intake bar: hands a link or poster/PDF to the n8n intake workflow.
export function AddOpportunity() {
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInput = Boolean(link.trim() || file);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasInput) return;
    setBusy(true);
    setNotice(null);
    const res = await submitIntake({ link: link.trim() || undefined, file: file ?? undefined }).catch(
      () => ({ ok: false, demo: false }),
    );
    setBusy(false);
    if (!res.ok) return setNotice({ text: "Couldn't reach n8n. Try again.", error: true });
    setNotice({
      text: res.demo
        ? "Demo mode: no intake webhook configured, so nothing was sent."
        : "Sent. It will appear in Opportunities once eligibility is checked.",
    });
    setLink("");
    setFile(null);
  }

  return (
    <form onSubmit={onSubmit} aria-label="Add an opportunity">
      <div className="flex items-center gap-2 rounded-full border border-ink bg-card p-1.5 pl-4">
        <span className="hidden font-mono text-[0.75rem] uppercase tracking-wider text-ink-soft sm:inline">
          Add
        </span>
        <input
          type="url"
          inputMode="url"
          placeholder={file ? file.name : "Paste a link to an opportunity…"}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          aria-label="Opportunity link"
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={file ? `Attached ${file.name}. Choose a different file` : "Upload a PDF or poster"}
          title={file ? file.name : "Upload a PDF or poster"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
            file ? "border-ink bg-ink text-card" : "border-rule hover:border-ink"
          }`}
        >
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4" />
            <path d="m6 10 6-6 6 6" />
            <path d="M4 20h16" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="submit"
          disabled={busy || !hasInput}
          className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${
            hasInput
              ? "bg-signal-ink text-card hover:bg-ink"
              : "cursor-not-allowed border border-rule bg-paper-deep text-ink-soft"
          }`}
        >
          {busy ? "Sending…" : "Check it"}
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className={`mt-2 pl-4 font-mono text-[0.75rem] ${notice.error ? "text-urgent" : "text-ink-soft"}`}
        >
          {notice.text}
        </p>
      )}
    </form>
  );
}
