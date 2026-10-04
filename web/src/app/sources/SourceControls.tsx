"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  addSourceAction,
  deleteSourceAction,
  retestSourceAction,
  setSourceEnabledAction,
} from "@/app/actions";

export function SourceToggle({ id, name, enabled }: { id: string; name: string; enabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={`Scan ${name}`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setSourceEnabledAction(id, !enabled);
          router.refresh();
        })
      }
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-60 ${
        enabled ? "border-ink bg-ink" : "border-ink-soft bg-paper-deep"
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
          enabled ? "left-[1.45rem]" : "left-0.5 border border-ink-soft"
        }`}
      />
    </button>
  );
}

export function OwnSourceActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [retested, setRetested] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const btn = "h-9 rounded-full border px-3.5 text-sm transition-colors disabled:opacity-50";

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await retestSourceAction(id);
            setRetested(true);
            router.refresh();
            setTimeout(() => setRetested(false), 2000);
          })
        }
        className={`${btn} border-ink hover:bg-paper-deep`}
      >
        {pending ? "Retesting…" : retested ? "✓ Retested" : "Retest"}
      </button>
      {confirming ? (
        <>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteSourceAction(id);
                router.refresh();
              })
            }
            className={`${btn} border-urgent bg-urgent text-card`}
            aria-label={`Confirm delete ${name}`}
          >
            Delete
          </button>
          <button disabled={pending} onClick={() => setConfirming(false)} className={`${btn} border-rule`}>
            Cancel
          </button>
        </>
      ) : (
        <button
          disabled={pending}
          onClick={() => setConfirming(true)}
          className={`${btn} border-rule text-urgent hover:border-urgent`}
          aria-label={`Delete ${name}`}
        >
          Delete
        </button>
      )}
    </div>
  );
}

export function AddSourceForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await addSourceAction(url);
      setNote({ text: r.message, ok: r.ok });
      if (r.ok) {
        setUrl("");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-2 rounded-full border border-ink bg-card p-1.5 pl-4">
        <input
          type="url"
          inputMode="url"
          required
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setNote(null);
          }}
          placeholder="https://… a notice board, listings page or newsletter archive"
          aria-label="Source URL"
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft"
        />
        <button
          disabled={pending || !url.trim()}
          className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${
            url.trim() ? "bg-signal-ink text-card hover:bg-ink" : "cursor-not-allowed border border-rule bg-paper-deep text-ink-soft"
          }`}
        >
          {pending ? "Adding…" : "Add source"}
        </button>
      </div>
      {note && (
        <p role="status" className={`mt-2 pl-4 text-sm ${note.ok ? "text-go" : "text-urgent"}`}>
          {note.text}
        </p>
      )}
    </form>
  );
}
