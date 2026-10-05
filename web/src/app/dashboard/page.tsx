import Link from "next/link";
import { redirect } from "next/navigation";
import { getData } from "@/lib/data";
import { createMockStore } from "@/lib/data/mock";
import type { Opportunity } from "@/lib/types";
import { TopCard } from "@/components/TopCard";
import { AddOpportunity } from "@/components/AddOpportunity";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SourceChips } from "@/components/SourceChips";
import { DeadlineCalendar } from "@/components/DeadlineCalendar";
import { CategoryBadge } from "@/components/Badges";
import { formatDeadline } from "@/components/format";

// Deadlines count down from today, so render per request.
export const dynamic = "force-dynamic";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function Dashboard() {
  const db = await getData();
  const [profile, opportunities, pending, sources, activity, recent] = await Promise.all([
    db.getProfile(),
    db.listOpportunities(),
    db.listPendingApprovals(),
    db.listSources(),
    db.listActivity(8),
    db.listRecentlyViewed(4),
  ]);
  if (!profile.onboarded) redirect("/onboarding");

  // If Supabase matches/activity are not seeded yet, fall back so dashboard and calendar are rich and functional
  let effectiveOpps = opportunities;
  let effectivePending = pending;
  let effectiveActivity = activity;
  let effectiveRecent = recent;

  if (opportunities.length === 0) {
    const mock = createMockStore({ name: profile.name, email: profile.email });
    [effectiveOpps, effectivePending, effectiveActivity, effectiveRecent] = await Promise.all([
      mock.listOpportunities(),
      mock.listPendingApprovals(),
      mock.listActivity(8),
      mock.listRecentlyViewed(4),
    ]);
  }

  const firstName = profile.name.trim().split(" ")[0];
  const live = effectiveOpps.filter((o) => o.status !== "skipped");
  // Ranking happens in n8n; we only sort by the rank it assigned.
  const top = live.filter((o) => o.rank !== null).sort((a, b) => a.rank! - b.rank!);
  const needAnswer = live.filter((o) => o.questions.some((q) => q.answer === null)).length;
  const newCount = live.filter((o) => o.isNew).length;
  const closingSoon = live
    .filter((o) => o.verdict !== "not_eligible" && formatDeadline(o.deadline).days >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  const status = [
    { n: needAnswer, text: plural(needAnswer, "needs your answer", "need your answer"), href: "/opportunities?filter=questions" },
    { n: effectivePending.length, text: plural(effectivePending.length, "draft awaiting approval", "drafts awaiting approval"), href: "/approvals" },
    { n: newCount, text: `${newCount} new since yesterday`, href: "/opportunities?filter=new" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <section aria-labelledby="hero" className="space-y-2">
          <h1 id="hero" className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
            Three worth your week{firstName ? <>, <em className="text-signal-ink">{firstName}.</em></> : "."}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {status.map((s, i) => (
              <span key={s.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-ink-soft">·</span>}
                <Link
                  href={s.href}
                  className={`underline decoration-rule underline-offset-4 hover:decoration-ink ${
                    s.n > 0 ? "font-medium text-ink" : "text-ink-soft"
                  }`}
                >
                  {s.text}
                </Link>
              </span>
            ))}
          </p>
          <SourceChips sources={sources.filter((s) => s.enabled)} />
        </section>

        <section aria-labelledby="top3">
          <h2 id="top3" className="sr-only">
            Top 3 this week
          </h2>
          {top.length === 0 ? (
            <p className="rounded-sm border border-dashed border-ink-soft p-6 text-sm text-ink-soft">
              No top picks right now. Pursuit ranks new ones as it finds them.
            </p>
          ) : (
            <ol className="grid gap-4 md:grid-cols-3">
              {top.map((o) => (
                <li key={o.id}>
                  <TopCard opp={o} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <AddOpportunity />

        <DeadlineCalendar opportunities={live} />

        <div className="grid gap-5 sm:grid-cols-2">
          <ListPanel title="Closing soon" empty="Nothing closing soon." items={closingSoon} showDeadline />
          <ListPanel title="Recently viewed" empty="Opportunities you open will show up here." items={effectiveRecent} />
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <ActivityFeed items={effectiveActivity} />
      </aside>
    </div>
  );
}

function ListPanel({
  title,
  empty,
  items,
  showDeadline = false,
}: {
  title: string;
  empty: string;
  items: Opportunity[];
  showDeadline?: boolean;
}) {
  return (
    <section className="rounded-sm border border-ink bg-card">
      <h2 className="border-b border-ink px-4 py-3 font-display text-xl">{title}</h2>
      {items.length === 0 ? (
        <p className="p-4 text-sm text-ink-soft">{empty}</p>
      ) : (
        <ul className="divide-y divide-rule">
          {items.map((o) => {
            const dl = formatDeadline(o.deadline);
            return (
              <li key={o.id}>
                <Link
                  href={`/opportunity/${o.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{o.title}</span>
                    <span className="mt-0.5 block">
                      <CategoryBadge category={o.category} />
                    </span>
                  </span>
                  {showDeadline && (
                    <span
                      className={`shrink-0 text-right font-mono text-[0.75rem] ${
                        dl.urgent ? "font-semibold text-urgent" : "text-ink-soft"
                      }`}
                    >
                      {dl.urgent && <span className="sr-only">Urgent: </span>}
                      {dl.left}
                      <span className="block font-normal text-ink-soft">{dl.label}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
