"use client";

import { useState, useTransition, type ButtonHTMLAttributes } from "react";
import type { CampaignStep, StepAction } from "@/lib/types";
import { resolveStepAction } from "@/app/actions";

// Approve / Edit / Skip for one pending step. Shared by the campaign timeline
// and the approvals queue. The server action stores the decision and tells
// n8n; the page then re-renders from the data layer.
export function PendingAction({
  opportunityId,
  step,
}: {
  opportunityId: string;
  step: CampaignStep;
}) {
  const [text, setText] = useState(step.draft ?? "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function act(action: StepAction, draft?: string) {
    setError(null);
    startTransition(async () => {
      try {
        await resolveStepAction(opportunityId, step.kind, action, draft);
      } catch {
        setError("Something went wrong. Nothing was changed.");
      }
    });
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
            <Btn primary disabled={pending} onClick={() => act("edit", text)}>
              Save &amp; approve
            </Btn>
            <Btn
              disabled={pending}
              onClick={() => {
                setText(step.draft ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </Btn>
          </>
        ) : (
          <>
            <Btn primary disabled={pending} onClick={() => act("approve")}>
              Approve
            </Btn>
            {hasDraft && (
              <Btn disabled={pending} onClick={() => setEditing(true)}>
                Edit
              </Btn>
            )}
            <Btn disabled={pending} onClick={() => act("skip")}>
              Skip
            </Btn>
          </>
        )}
        {pending && <span className="font-mono text-xs text-ink-soft">saving…</span>}
        {error && <span className="text-sm text-urgent">{error}</span>}
      </div>
    </div>
  );
}

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
          ? "border-ink bg-ink text-card hover:border-signal-ink hover:bg-signal-ink"
          : "border-ink hover:bg-paper-deep"
      }`}
    >
      {children}
    </button>
  );
}
