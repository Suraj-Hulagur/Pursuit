import { getUser } from "@/lib/auth";
import { getData } from "@/lib/data";
import type { Verdict } from "@/lib/types";
import { AddOpportunity } from "@/components/AddOpportunity";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SampleChip } from "@/components/SampleChip";

// Deadlines count down from today, so render per request.
export const dynamic = "force-dynamic";

const verdictOrder: Record<Verdict, number> = {
  eligible: 0,
  unclear: 1,
  not_eligible: 2,
};

export default async function Dashboard() {
  const db = await getData();
  const [user, week, opportunities, campaigns, sources] = await Promise.all([
    getUser(),
    db.getWeek(),
    db.listOpportunities(),
    db.listCampaigns(),
    db.listSources(),
  ]);
  const campaignIds = new Set(campaigns.map((c) => c.opportunity.id));

  // Ranking happens in n8n; we only sort by the rank it assigned.
  const visible = opportunities.filter((o) => o.status !== "skipped");
  const skipped = opportunities.filter((o) => o.status === "skipped");
  const top = visible
    .filter((o) => o.rank !== null)
    .sort((a, b) => a.rank! - b.rank!);
  const rest = visible
    .filter((o) => o.rank === null)
    .sort(
      (a, b) =>
        verdictOrder[a.verdict] - verdictOrder[b.verdict] ||
        a.deadline.localeCompare(b.deadline),
    );
  const counts = visible.reduce(
    (acc, o) => ({ ...acc, [o.verdict]: (acc[o.verdict] ?? 0) + 1 }),
    {} as Record<Verdict, number>,
  );
  const maxFree = Math.max(...week.days.map((d) => d.freeHours));

  return (
    <div className="space-y-14">
      <section className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-end">
        <div>
          <p className="eyebrow mb-4">Week of {week.label}</p>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            Three worth your week
            {user ? (
              <>
                , <em className="text-signal">{user.firstName}.</em>
              </>
            ) : (
              "."
            )}
          </h1>
          <p className="mt-5 max-w-xl text-ink-soft">
            Every verdict quotes the exact clause it relied on, so you can check it yourself.
          </p>
          <p className="mt-3 font-mono text-[0.7rem] text-ink-soft">
            Watching {sources.length} sources: {sources.map((s) => s.name).join(" · ")}
          </p>
        </div>

        <div aria-label="Free hours this week (sample)">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="eyebrow">Free hours</p>
            <SampleChip label="Sample" />
          </div>
          <div className="flex h-24 items-end gap-2">
            {week.days.map((d) => (
              <div
                key={d.day}
                className="flex flex-1 flex-col items-center gap-1.5"
                title={d.busy.length ? d.busy.join(", ") : "Free"}
              >
                <span className="font-mono text-[0.65rem] text-ink-soft">{d.freeHours}h</span>
                <div
                  className={`w-full rounded-t-sm ${d.freeHours === maxFree ? "bg-signal" : "bg-ink/80"}`}
                  style={{ height: `${(d.freeHours / maxFree) * 56}px` }}
                />
                <span className="font-mono text-[0.65rem] uppercase">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[0.65rem] text-ink-soft">
            Connect Google Calendar later to use your real schedule.
          </p>
        </div>
      </section>

      <AddOpportunity />

      <section aria-labelledby="top3">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-3">
          <h2 id="top3" className="font-display text-3xl">
            Top 3 this week
          </h2>
          <SampleChip />
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {top.map((o) => (
            <li key={o.id}>
              <OpportunityCard opp={o} hasCampaign={campaignIds.has(o.id)} />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="all">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-3">
          <h2 id="all" className="font-display text-3xl">
            Everything else we found
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs text-ink-soft">
              {counts.eligible ?? 0} eligible · {counts.unclear ?? 0} unclear ·{" "}
              {counts.not_eligible ?? 0} not eligible
            </p>
            <SampleChip />
          </div>
        </div>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((o) => (
            <li key={o.id}>
              <OpportunityCard opp={o} hasCampaign={campaignIds.has(o.id)} />
            </li>
          ))}
        </ul>
      </section>

      {skipped.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-baseline justify-between border-b border-rule pb-3">
            <h2 className="font-display text-2xl text-ink-soft">Skipped ({skipped.length})</h2>
            <span className="font-mono text-xs text-ink-soft group-open:hidden">Show</span>
            <span className="hidden font-mono text-xs text-ink-soft group-open:inline">Hide</span>
          </summary>
          <ul className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {skipped.map((o) => (
              <li key={o.id} className="opacity-70">
                <OpportunityCard opp={o} hasCampaign={campaignIds.has(o.id)} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
