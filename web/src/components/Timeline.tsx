import type { CampaignStep, StepStatus } from "@/lib/types";
import { PendingAction } from "./PendingAction";

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
  steps,
}: {
  opportunityId: string;
  steps: CampaignStep[];
}) {
  return (
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
              className="min-w-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3
                  className={`text-lg font-medium ${s.status === "skipped" ? "text-ink-soft line-through" : s.status === "upcoming" ? "text-ink-soft" : ""}`}
                >
                  {s.title}
                </h3>
                <span
                  className={`font-mono text-[0.7rem] uppercase tracking-wider ${s.status === "pending" ? "font-semibold text-signal-ink" : "text-ink-soft"}`}
                >
                  {statusLabel[s.status]} · {s.at}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">{s.detail}</p>
              {s.status === "pending" && <PendingAction opportunityId={opportunityId} step={s} />}
              {s.status === "done" && s.draft && (
                <details className="mt-2 max-w-2xl text-sm">
                  <summary className="cursor-pointer font-mono text-xs text-ink-soft hover:text-ink">
                    View text
                  </summary>
                  <p className="mt-2 whitespace-pre-line break-words rounded-sm border border-rule bg-card p-3 font-mono text-[0.8rem] leading-relaxed">
                    {s.draft}
                  </p>
                </details>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
