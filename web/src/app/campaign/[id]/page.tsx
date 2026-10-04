import Link from "next/link";
import { notFound } from "next/navigation";
import { getData } from "@/lib/data";
import { Timeline } from "@/components/Timeline";
import { VerdictBadge } from "@/components/VerdictBadge";
import { CategoryBadge, ConfidenceDot } from "@/components/Badges";
import { categoryMeta, formatDeadline } from "@/components/format";

// Deadlines count down from today, so render per request.
export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getData();
  const [opp, campaign] = await Promise.all([db.getOpportunity(id), db.getCampaign(id)]);
  if (!opp || !campaign) notFound();

  const dl = formatDeadline(opp.deadline);
  const done = campaign.steps.filter((s) => s.status === "done").length;
  const pending = campaign.steps.filter((s) => s.status === "pending").length;

  return (
    <div className="grid gap-12 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <Link href="/campaigns" className="font-mono text-[0.75rem] text-ink-soft hover:text-signal-ink">
          ← All campaigns
        </Link>
        <div>
          <p className="eyebrow mb-2">
            Campaign · {categoryMeta[opp.category].label}
            {opp.rank && <span className="text-signal-ink"> · Pick #{opp.rank}</span>}
          </p>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight">
            {opp.title}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{opp.org}</p>
        </div>
        <dl className="divide-y divide-rule border-y border-ink text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="eyebrow self-center">Verdict</dt>
            <dd>
              <VerdictBadge verdict={opp.verdict} />
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="eyebrow self-center">Deadline</dt>
            <dd className="font-mono">
              {dl.label}{" "}
              <span className={dl.urgent ? "font-semibold text-urgent" : "text-ink-soft"}>
                ({dl.left})
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="eyebrow self-center">Reward</dt>
            <dd className="text-right">{opp.reward}</dd>
          </div>
          <div className="py-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={opp.category} />
              <ConfidenceDot value={opp.confidence} showValue />
              <span className="font-mono text-[0.75rem] text-ink-soft">~{opp.effortHours}h effort</span>
            </div>
          </div>
        </dl>
        <figure className="border-l-2 border-ink pl-4">
          <blockquote className="font-display text-lg leading-snug">
            “{opp.clause}”
          </blockquote>
          <figcaption className="mt-1.5 font-mono text-[0.72rem] text-ink-soft">
            {opp.clauseSource}
          </figcaption>
        </figure>
      </aside>

      <section>
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-3">
          <h2 className="font-display text-3xl">The run</h2>
          <p className="font-mono text-xs text-ink-soft">
            {done}/{campaign.steps.length} done
            {pending > 0 && <span className="text-signal-ink"> · {pending} waiting on you</span>}
          </p>
        </div>
        <Timeline opportunityId={opp.id} steps={campaign.steps} />
      </section>
    </div>
  );
}
