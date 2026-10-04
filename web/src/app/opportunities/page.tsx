import { getData } from "@/lib/data";
import { SampleChip } from "@/components/SampleChip";
import { OpportunityBrowser, type Filter } from "./OpportunityBrowser";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const db = await getData();
  const opportunities = await db.listOpportunities();
  const filter: Filter = sp.filter === "questions" || sp.filter === "new" ? sp.filter : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
        <div>
          <p className="eyebrow mb-2">Every verdict quotes its clause</p>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Opportunities</h1>
        </div>
        <SampleChip />
      </div>
      <OpportunityBrowser
        opportunities={opportunities}
        initialQuery={sp.q ?? ""}
        initialCategory={sp.cat ?? "all"}
        initialFilter={filter}
      />
    </div>
  );
}
