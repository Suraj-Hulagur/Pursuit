import { getPendingSteps } from "@/lib/data";
import { SampleChip } from "@/components/SampleChip";
import { ApprovalQueue } from "./ApprovalQueue";

export default function ApprovalsPage() {
  const items = getPendingSteps().map(({ opportunity, step }) => ({
    opportunityId: opportunity.id,
    opportunityTitle: opportunity.title,
    step,
  }));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
        <div>
          <p className="eyebrow mb-2">Nothing goes out without you</p>
          <h1 className="font-display text-5xl tracking-tight">Approvals</h1>
        </div>
        <SampleChip />
      </div>
      <ApprovalQueue items={items} />
    </div>
  );
}
