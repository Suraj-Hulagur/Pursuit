import Link from "next/link";
import {
  getCampaignIds,
  getOpportunities,
  getStudent,
  getWeek,
} from "@/lib/data";
import type { Verdict } from "@/lib/types";
import { OpportunityRow } from "@/components/OpportunityRow";
import { VerdictBadge } from "@/components/VerdictBadge";
import { formatDeadline, typeLabel } from "@/components/format";

// Deadlines count down from today, so render per request.
export const dynamic = "force-dynamic";

const verdictOrder: Record<Verdict, number> = {
  eligible: 0,
  unclear: 1,
  not_eligible: 2,
};

export default function Dashboard() {
  const student = getStudent();
  const week = getWeek();
  const opportunities = getOpportunities();
  const campaignIds = new Set(getCampaignIds());

  // Ranking happens in n8n; we only sort by the rank it assigned.
  const top = opportunities
    .filter((o) => o.rank !== null)
    .sort((a, b) => a.rank! - b.rank!);
  const all = [...opportunities].sort(
    (a, b) =>
      verdictOrder[a.verdict] - verdictOrder[b.verdict] ||
      a.deadline.localeCompare(b.deadline),
  );
  const counts = opportunities.reduce(
    (acc, o) => ({ ...acc, [o.verdict]: (acc[o.verdict] ?? 0) + 1 }),
    {} as Record<Verdict, number>,
  );
  const maxFree = Math.max(...week.days.map((d) => d.freeHours));

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
        <div>
          <p className="eyebrow mb-4">Week of {week.label}</p>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            Three worth your week,{" "}
            <em className="text-signal">{student.name.split(" ")[0]}.</em>
          </h1>
          <p className="mt-5 max-w-xl text-ink-soft">
            Checked {opportunities.length} opportunities against your profile.
            These three fit your free hours and close soonest.
          </p>
        </div>

        <div aria-label="Free hours this week">
          <p className="eyebrow mb-3">Your calendar · free hours</p>
          <div className="flex h-28 items-end gap-2">
            {week.days.map((d) => (
              <div
                key={d.day}
                className="group flex flex-1 flex-col items-center gap-1.5"
                title={d.busy.length ? d.busy.join(", ") : "Free"}
              >
                <span className="font-mono text-[0.65rem] text-ink-soft">
                  {d.freeHours}h
                </span>
                <div
                  className={`w-full rounded-t-sm ${d.freeHours === maxFree ? "bg-signal" : "bg-ink"}`}
                  style={{ height: `${(d.freeHours / maxFree) * 72}px` }}
                />
                <span className="font-mono text-[0.65rem] uppercase">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="top3">
        <h2 id="top3" className="sr-only">
          Top 3 this week
        </h2>
        <ol className="grid gap-px overflow-hidden rounded-sm border border-ink bg-ink md:grid-cols-3">
          {top.map((o) => {
            const dl = formatDeadline(o.deadline);
            return (
              <li key={o.id} className="flex flex-col bg-card p-6">
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl leading-none text-signal">
                    {String(o.rank).padStart(2, "0")}
                  </span>
                  <span className="text-right font-mono text-xs">
                    {dl.label}
                    <span
                      className={`block text-[0.7rem] ${dl.urgent ? "text-signal" : "text-ink-soft"}`}
                    >
                      {dl.left} left
                    </span>
                  </span>
                </div>
                <p className="eyebrow mt-6">{typeLabel[o.type]}</p>
                <h3 className="mt-1 text-xl font-medium leading-snug">{o.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{o.reward}</p>
                <p className="mt-5 border-t border-dashed border-rule pt-4 text-sm leading-relaxed">
                  <span className="eyebrow mr-1.5 !text-ink">Fit</span>
                  {o.fit}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <VerdictBadge verdict={o.verdict} />
                  {campaignIds.has(o.id) && (
                    <Link
                      href={`/campaign/${o.id}`}
                      className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-card transition-colors hover:bg-signal"
                    >
                      Campaign →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="all">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-3">
          <h2 id="all" className="font-display text-3xl">
            Everything we found
          </h2>
          <p className="font-mono text-xs text-ink-soft">
            {counts.eligible ?? 0} eligible · {counts.unclear ?? 0} unclear ·{" "}
            {counts.not_eligible ?? 0} not eligible
          </p>
        </div>
        <ul>
          {all.map((o) => (
            <OpportunityRow key={o.id} opp={o} hasCampaign={campaignIds.has(o.id)} />
          ))}
        </ul>
      </section>
    </div>
  );
}
