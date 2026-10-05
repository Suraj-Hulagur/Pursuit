import { getData } from "@/lib/data";
import type { Source } from "@/lib/types";
import { SourceStatusDot } from "@/components/Badges";
import { SampleChip } from "@/components/SampleChip";
import { AddSourceForm, OwnSourceActions, RetestButton, SourceToggle } from "./SourceControls";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const db = await getData();
  const sources = await db.listSources();
  const publicSources = sources.filter((s) => s.isPublic);
  const mine = sources.filter((s) => !s.isPublic);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
        <div>
          <p className="eyebrow mb-2">Where Pursuit looks</p>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Sources</h1>
        </div>
        <SampleChip />
      </div>

      <section aria-labelledby="add">
        <h2 id="add" className="mb-3 font-display text-2xl">
          Add a source
        </h2>
        <AddSourceForm />
      </section>

      <section aria-labelledby="mine">
        <h2 id="mine" className="mb-3 font-display text-2xl">
          My sources
        </h2>
        {mine.length === 0 ? (
          <p className="text-sm text-ink-soft">No sources of your own yet.</p>
        ) : (
          <ul className="divide-y divide-rule rounded-sm border border-ink bg-card">
            {mine.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <SourceInfo s={s} />
                <OwnSourceActions id={s.id} name={s.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="public">
        <h2 id="public" className="mb-1 font-display text-2xl">
          Public sources
        </h2>
        <p className="mb-3 text-sm text-ink-soft">Shared listings Pursuit scans for everyone. Turn off any you don&apos;t want.</p>
        <ul className="divide-y divide-rule rounded-sm border border-ink bg-card">
          {publicSources.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <SourceInfo s={s} />
              <div className="flex items-center gap-3">
                {s.status !== "healthy" && <RetestButton id={s.id} name={s.name} />}
                <SourceToggle id={s.id} name={s.name} enabled={s.enabled} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SourceInfo({ s }: { s: Source }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium">{s.name}</span>
        <SourceStatusDot status={s.status} withLabel />
      </div>
      <p className="mt-0.5 truncate font-mono text-[0.75rem] text-ink-soft">
        {s.kind === "gmail" ? "Forwarded emails" : s.url} · checked {s.lastChecked}
      </p>
    </div>
  );
}
