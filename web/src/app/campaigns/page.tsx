import Link from "next/link";
import { getData } from "@/lib/data";
import { VerdictBadge } from "@/components/VerdictBadge";
import { SampleChip } from "@/components/SampleChip";
import { formatDeadline, typeLabel } from "@/components/format";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const db = await getData();
  const campaigns = (await db.listCampaigns()).map(({ opportunity, campaign }) => ({
    opp: opportunity,
    campaign,
  }));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
        <div>
          <p className="eyebrow mb-2">Running for you</p>
          <h1 className="font-display text-5xl tracking-tight">Campaigns</h1>
        </div>
        <SampleChip />
      </div>

      {campaigns.length === 0 ? (
        <p className="text-ink-soft">No campaigns yet. Approve an opportunity to start one.</p>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(({ opp, campaign }) => {
            const total = campaign.steps.length;
            const done = campaign.steps.filter((s) => s.status === "done").length;
            const dl = formatDeadline(opp.deadline);
            return (
              <li key={opp.id}>
                <Link
                  href={`/campaign/${opp.id}`}
                  className="group flex h-full flex-col rounded-sm border border-ink bg-card p-5 transition-shadow hover:shadow-[4px_4px_0_0_var(--ink)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <VerdictBadge verdict={opp.verdict} />
                    <span className="font-mono text-xs">
                      {dl.label} ·{" "}
                      <span className={dl.urgent ? "text-signal" : "text-ink-soft"}>
                        {dl.left}
                      </span>
                    </span>
                  </div>
                  <p className="eyebrow mt-5">{typeLabel[opp.type]}</p>
                  <h2 className="mt-1 text-lg font-medium leading-snug group-hover:text-signal">
                    {opp.title}
                  </h2>
                  {opp.campaignState && (
                    <p className="mt-3 flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
                      {opp.campaignState}
                    </p>
                  )}
                  <div className="mt-auto pt-6">
                    <div className="flex justify-between font-mono text-[0.7rem] text-ink-soft">
                      <span>Progress</span>
                      <span>
                        {done}/{total} steps
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rule">
                      <div
                        className="h-full bg-ink"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
