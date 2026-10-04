"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import type { CampaignStep } from "@/lib/types";
import { sendStepAction, type StepAction } from "@/lib/n8n";

export interface Resolution {
  action: StepAction;
  draft?: string;
  demo: boolean;
}

// Approve / Edit / Skip for one pending step. Shared by the campaign timeline
// and the approvals queue.
export function PendingAction({
  opportunityId,
  step,
  onResolved,
}: {
  opportunityId: string;
  step: CampaignStep;
  onResolved: (r: Resolution) => void;
}) {
  const [text, setText] = useState(step.draft ?? "");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: StepAction, draft?: string) {
    setBusy(true);
    setError(null);
    const res = await sendStepAction({
      opportunityId,
      stepKind: step.kind,
      action,
      draft,
    }).catch(() => ({ ok: false, demo: false }));
    setBusy(false);
    if (!res.ok) return setError("Couldn't reach n8n. Nothing was sent.");
    setEditing(false);
    onResolved({ action, draft, demo: res.demo });
  }

  const hasDraft = step.draft !== undefined;

  return (
    <div className="mt-4 max-w-2xl rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      {hasDraft && (
        <div className="border-b border-rule p-4">
          <p className="eyebrow mb-2">Draft</p>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full resize-y rounded-sm border border-rule bg-paper p-3 font-mono text-sm leading-relaxed outline-none focus:border-ink"
            />
          ) : (
            <p className="whitespace-pre-line break-words font-mono text-[0.8rem] leading-relaxed">
              {text}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 p-3">
        {editing ? (
          <>
            <Btn primary disabled={busy} onClick={() => act("edit", text)}>
              Save &amp; approve
            </Btn>
            <Btn disabled={busy} onClick={() => setEditing(false)}>
              Cancel
            </Btn>
          </>
        ) : (
          <>
            <Btn primary disabled={busy} onClick={() => act("approve")}>
              Approve
            </Btn>
            {hasDraft && (
              <Btn disabled={busy} onClick={() => setEditing(true)}>
                Edit
              </Btn>
            )}
            <Btn disabled={busy} onClick={() => act("skip")}>
              Skip
            </Btn>
          </>
        )}
        {busy && <span className="font-mono text-xs text-ink-soft">sending…</span>}
        {error && <span className="text-sm text-signal">{error}</span>}
      </div>
    </div>
  );
}

export const demoNotice =
  "Demo mode: no n8n webhook configured, so this change only shows here.";
export const sentNotice =
  "Sent to n8n. The campaign runner will take it from here.";

function Btn({
  primary,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <button
      {...props}
      className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-50 ${
        primary
          ? "border-ink bg-ink text-card hover:border-signal hover:bg-signal"
          : "border-ink hover:bg-paper-deep"
      }`}
    >
      {children}
    </button>
  );
}
