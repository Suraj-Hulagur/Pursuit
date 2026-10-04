import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { VerdictBadge } from "./VerdictBadge";
import { EffortReward } from "./EffortReward";
import { formatDeadline, typeLabel } from "./format";

// The eligibility proof is the hero: verdict, the quoted clause, and what's
// missing. Everything else is supporting detail.
export function OpportunityCard({
  opp,
  hasCampaign,
}: {
  opp: Opportunity;
  hasCampaign: boolean;
}) {
  const dl = formatDeadline(opp.deadline);
  const muted = opp.verdict === "not_eligible";

  return (
    <article
      className={`flex h-full flex-col rounded-sm border bg-card ${muted ? "border-rule" : "border-ink"}`}
    >
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <VerdictBadge verdict={opp.verdict} />
          {opp.rank && (
            <span className="font-display text-3xl leading-none text-signal">
              #{opp.rank}
            </span>
          )}
        </div>

        <figure className="mt-4 border-l-2 border-ink pl-4">
          <blockquote
            className={`font-display text-xl leading-snug sm:text-[1.4rem] ${muted ? "text-ink-soft" : ""}`}
          >
            “{opp.clause}”
          </blockquote>
          <figcaption className="mt-1.5 font-mono text-[0.65rem] text-ink-soft">
            {opp.clauseSource}
          </figcaption>
        </figure>

        <div className="mt-4">
          <p className="eyebrow mb-1.5">What&apos;s missing</p>
          {opp.missing.length === 0 ? (
            <p className="text-sm text-go">✓ Nothing. You meet every condition.</p>
          ) : (
            <ul className="space-y-1">
              {opp.missing.map((m) => (
                <li key={m} className="flex gap-2 text-sm">
                  <span
                    aria-hidden
                    className={opp.verdict === "not_eligible" ? "text-no" : "text-maybe"}
                  >
                    {opp.verdict === "not_eligible" ? "✕" : "○"}
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">Why: </span>
            {opp.reasoning}
          </p>
        </div>
      </div>

      <div className="border-t border-dashed border-rule p-5 sm:px-6">
        <p className="eyebrow">
          {typeLabel[opp.type]} · {opp.org}
        </p>
        <h3 className="mt-1 text-lg font-medium leading-snug">{opp.title}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">{opp.reward}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <EffortReward {...opp} />
          <span className="font-mono text-xs">
            {dl.label} ·{" "}
            <span className={dl.urgent ? "text-signal" : "text-ink-soft"}>{dl.left}</span>
          </span>
        </div>
        {opp.fit && (
          <p className="mt-3 text-sm">
            <span className="eyebrow mr-1.5 !text-ink">Fit</span>
            {opp.fit}
          </p>
        )}
        {opp.campaignState && hasCampaign && (
          <Link
            href={`/campaign/${opp.id}`}
            className="mt-4 flex min-h-10 items-center justify-between gap-2 rounded-full bg-ink px-4 py-2 text-sm text-card transition-colors hover:bg-signal"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
              {opp.campaignState}
            </span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
