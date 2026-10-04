"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import type { CampaignStep, StepStatus } from "@/lib/types";
import { sendStepAction, type StepAction } from "@/lib/n8n";

const dot: Record<StepStatus, string> = {
  done: "bg-ink border-ink",
  pending: "bg-signal border-signal ring-4 ring-signal/20",
  upcoming: "bg-card border-rule",
  skipped: "bg-card border-no",
};

const statusLabel: Record<StepStatus, string> = {
  done: "Done",
  pending: "Needs you",
  upcoming: "Upcoming",
  skipped: "Skipped",
};

export function Timeline({
  opportunityId,
  steps: initial,
}: {
  opportunityId: string;
  steps: CampaignStep[];
}) {
  const [steps, setSteps] = useState(initial);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function act(i: number, action: StepAction, draft?: string) {
    setBusy(i);
    const { ok, demo } = await sendStepAction({
      opportunityId,
      stepKind: steps[i].kind,
      action,
      draft,
    }).catch(() => ({ ok: false, demo: false }));
    setBusy(null);

    if (!ok) {
      setNotice("Couldn't reach n8n. Nothing was sent.");
      return;
    }
    setNotice(
      demo
        ? "Demo mode: no n8n webhook configured, so this change only shows here."
        : "Sent to n8n. The campaign runner will take it from here.",
    );
    // Show the human's choice right away; n8n decides the real next state.
    setSteps((prev) =>
      prev.map((s, j) =>
        j === i
          ? {
              ...s,
              status: action === "skip" ? "skipped" : "done",
              at: action === "skip" ? "Skipped by you" : "Approved just now",
              draft: draft ?? s.draft,
            }
          : s,
      ),
    );
    setEditing(null);
  }

  return (
    <div>
      {notice && (
        <p
          role="status"
          className="mb-6 rounded-sm border border-ink bg-card px-4 py-2.5 font-mono text-xs"
        >
          {notice}
        </p>
      )}
      <ol className="relative">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.kind} className="relative grid grid-cols-[2rem_1fr] gap-4 pb-10">
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-[0.95rem] top-6 bottom-0 w-px ${s.status === "done" ? "bg-ink" : "border-l border-dashed border-rule"}`}
                />
              )}
              <span
                aria-hidden
                className={`relative z-10 mt-1.5 h-4 w-4 justify-self-center rounded-full border-2 ${dot[s.status]}`}
              />
              <div className={s.status === "upcoming" || s.status === "skipped" ? "opacity-60" : ""}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3
                    className={`text-lg font-medium ${s.status === "skipped" ? "line-through" : ""}`}
                  >
                    {s.title}
                  </h3>
                  <span
                    className={`font-mono text-[0.7rem] uppercase tracking-wider ${s.status === "pending" ? "text-signal" : "text-ink-soft"}`}
                  >
                    {statusLabel[s.status]} · {s.at}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  {s.detail}
                </p>

                {s.status === "pending" && (
                  <PendingCard
                    step={s}
                    editing={editing === i}
                    busy={busy === i}
                    onApprove={() => act(i, "approve")}
                    onEdit={() => setEditing(i)}
                    onCancel={() => setEditing(null)}
                    onSave={(text) => act(i, "edit", text)}
                    onSkip={() => act(i, "skip")}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PendingCard({
  step,
  editing,
  busy,
  onApprove,
  onEdit,
  onCancel,
  onSave,
  onSkip,
}: {
  step: CampaignStep;
  editing: boolean;
  busy: boolean;
  onApprove: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (text: string) => void;
  onSkip: () => void;
}) {
  const [text, setText] = useState(step.draft ?? "");

  return (
    <div className="mt-4 max-w-2xl rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      {step.draft !== undefined && (
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
            <p className="whitespace-pre-line font-mono text-[0.8rem] leading-relaxed">
              {text}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 p-3">
        {editing ? (
          <>
            <Btn primary disabled={busy} onClick={() => onSave(text)}>
              Save &amp; approve
            </Btn>
            <Btn disabled={busy} onClick={onCancel}>
              Cancel
            </Btn>
          </>
        ) : (
          <>
            <Btn primary disabled={busy} onClick={onApprove}>
              Approve
            </Btn>
            {step.draft !== undefined && (
              <Btn disabled={busy} onClick={onEdit}>
                Edit
              </Btn>
            )}
            <Btn disabled={busy} onClick={onSkip}>
              Skip
            </Btn>
          </>
        )}
        {busy && <span className="font-mono text-xs text-ink-soft">sending…</span>}
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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        primary
          ? "border-ink bg-ink text-card hover:border-signal hover:bg-signal"
          : "border-ink hover:bg-paper-deep"
      }`}
    >
      {children}
    </button>
  );
}
