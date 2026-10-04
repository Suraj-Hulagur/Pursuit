"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { submitIntake } from "@/lib/n8n";

// Hands a link or poster/PDF to the n8n intake workflow. No parsing here.
export function AddOpportunity() {
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!link && !file) return;
    setBusy(true);
    setNotice(null);
    const res = await submitIntake({ link: link || undefined, file: file ?? undefined }).catch(
      () => ({ ok: false, demo: false }),
    );
    setBusy(false);
    if (!res.ok) return setNotice({ text: "Couldn't reach n8n. Try again.", error: true });
    setNotice({
      text: res.demo
        ? "Demo mode: no intake webhook configured, so nothing was sent."
        : "Sent to Pursuit. It will appear here once eligibility is checked.",
    });
    setLink("");
    setFile(null);
  }

  return (
    <form
      onSubmit={onSubmit}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-sm border-2 border-dashed p-5 transition-colors sm:p-6 ${
        dragging ? "border-signal bg-signal/5" : "border-ink bg-card"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl sm:text-3xl">Add an opportunity</h2>
        <p className="eyebrow">Link · PDF · Poster</p>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Paste a link or drop a poster. Pursuit reads the fine print and tells you if you qualify.
      </p>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          aria-label="Opportunity link"
          className="h-12 min-w-0 flex-1 rounded-sm border border-rule bg-paper px-3 text-base outline-none focus:border-ink"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-12 truncate rounded-sm border border-ink px-4 text-sm transition-colors hover:bg-paper-deep md:max-w-64"
        >
          {file ? `📎 ${file.name}` : "Upload PDF or image"}
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
          disabled={busy || (!link && !file)}
          className="h-12 rounded-full bg-ink px-6 font-medium text-card transition-colors hover:bg-signal disabled:opacity-40"
        >
          {busy ? "Sending…" : "Check it"}
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-3 font-mono text-xs ${notice.error ? "text-signal" : "text-ink-soft"}`}
        >
          {notice.text}
        </p>
      )}
    </form>
  );
}
