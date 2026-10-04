"use client";

import { useTransition } from "react";
import type { MatchStatus } from "@/lib/types";
import { setStatusAction } from "@/app/actions";

export function CardActions({ id, status }: { id: string; status: MatchStatus }) {
  const [pending, startTransition] = useTransition();
  const set = (s: MatchStatus) => startTransition(() => setStatusAction(id, s));

  const base =
    "h-9 rounded-full border px-3.5 text-sm transition-colors disabled:opacity-50";

  if (status === "skipped") {
    return (
      <button disabled={pending} onClick={() => set("new")} className={`${base} border-ink hover:bg-paper-deep`}>
        Undo skip
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => set(status === "saved" ? "new" : "saved")}
        aria-pressed={status === "saved"}
        className={`${base} ${status === "saved" ? "border-ink bg-ink text-card hover:bg-signal-ink hover:border-signal" : "border-ink hover:bg-paper-deep"}`}
      >
        {status === "saved" ? "★ Saved" : "☆ Save"}
      </button>
      <button disabled={pending} onClick={() => set("skipped")} className={`${base} border-rule text-ink-soft hover:border-ink hover:text-ink`}>
        Skip
      </button>
    </div>
  );
}
