"use client";

import { useState } from "react";
import type { CampaignStep, StepStatus } from "@/lib/types";
import { PendingAction, demoNotice, sentNotice } from "./PendingAction";

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
  const [notice, setNotice] = useState<string | null>(null);

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
            <li key={s.kind} className="relative grid grid-cols-[2rem_1fr] gap-3 pb-10 sm:gap-4">
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
              <div
                className={`min-w-0 ${s.status === "upcoming" || s.status === "skipped" ? "opacity-60" : ""}`}
              >
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
                  <PendingAction
                    opportunityId={opportunityId}
                    step={s}
                    onResolved={({ action, draft, demo }) => {
                      setNotice(demo ? demoNotice : sentNotice);
                      // Show the human's choice right away; n8n decides the real next state.
                      setSteps((prev) =>
                        prev.map((p, j) =>
                          j === i
                            ? {
                                ...p,
                                status: action === "skip" ? "skipped" : "done",
                                at: action === "skip" ? "Skipped by you" : "Approved just now",
                                draft: draft ?? p.draft,
                              }
                            : p,
                        ),
                      );
                    }}
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
