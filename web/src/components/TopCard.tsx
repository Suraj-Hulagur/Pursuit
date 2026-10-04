import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { VerdictBadge } from "./VerdictBadge";
import { CategoryBadge, ConfidenceDot } from "./Badges";
import { formatDeadline } from "./format";

// Dashboard Top 3 card: the proof leads (verdict + quoted clause), then the
// facts you act on (deadline, category, confidence, campaign state).
export function TopCard({ opp }: { opp: Opportunity }) {
  const dl = formatDeadline(opp.deadline);
  return (
    <article className="flex h-full flex-col rounded-sm border border-ink bg-card">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <VerdictBadge verdict={opp.verdict} />
          <span className="font-display text-2xl leading-none text-signal" aria-label={`Pick ${opp.rank}`}>
            #{opp.rank}
          </span>
        </div>

        <blockquote className="mt-3 rounded-sm border-l-4 border-signal bg-paper-deep/70 px-3 py-2.5 font-display text-[1.15rem] leading-snug">
          “{opp.clause}”
        </blockquote>

        <Link
          href={`/opportunity/${opp.id}`}
          className="mt-3 text-base font-medium leading-snug hover:text-signal-ink hover:underline"
        >
          {opp.title}
        </Link>
        <p className="text-sm text-ink-soft">{opp.org}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-3">
          <span className={`font-mono text-[0.78rem] font-medium ${dl.urgent ? "text-urgent" : "text-ink-soft"}`}>
            {dl.left} · {dl.label}
          </span>
          <CategoryBadge category={opp.category} />
          <ConfidenceDot value={opp.confidence} showValue />
        </div>
      </div>

      {opp.campaignState && (
        <Link
          href={`/campaign/${opp.id}`}
          className="flex min-h-10 items-center justify-between gap-2 border-t border-ink bg-ink px-4 py-2 text-sm text-card transition-colors hover:bg-signal-ink"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
            {opp.campaignState}
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}
    </article>
  );
}
