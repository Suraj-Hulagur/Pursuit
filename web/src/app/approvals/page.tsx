import Link from "next/link";
import { getData } from "@/lib/data";
import { PendingAction } from "@/components/PendingAction";
import { SampleChip } from "@/components/SampleChip";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const db = await getData();
  const items = await db.listPendingApprovals();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
        <div>
          <p className="eyebrow mb-2">Nothing goes out without you</p>
          <h1 className="font-display text-5xl tracking-tight">Approvals</h1>
        </div>
        <SampleChip />
      </div>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-ink-soft p-10 text-center">
          <p className="font-display text-3xl">Nothing waiting on you.</p>
          <p className="mt-2 text-sm text-ink-soft">New drafts and requests will show up here.</p>
        </div>
      ) : (
        <ol className="space-y-10">
          {items.map(({ opportunity, step }, n) => (
            <li key={`${opportunity.id}:${step.kind}`} className="grid gap-3 sm:grid-cols-[3rem_1fr]">
              <span className="font-display text-4xl leading-none text-signal">
                {String(n + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <Link href={`/campaign/${opportunity.id}`} className="eyebrow hover:!text-signal-ink">
                  {opportunity.title} →
                </Link>
                <h2 className="mt-1 text-xl font-medium">{step.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-ink-soft">{step.detail}</p>
                <PendingAction opportunityId={opportunity.id} step={step} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
