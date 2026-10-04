import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getData } from "@/lib/data";
import { VerdictBadge } from "@/components/VerdictBadge";
import { CategoryBadge, ConfidenceDot, SourceStatusDot } from "@/components/Badges";
import { CardActions } from "@/components/CardActions";
import { Questions } from "@/components/Questions";
import { confidenceTone, criterionMeta, formatDeadline, proofLead } from "@/components/format";

export const dynamic = "force-dynamic";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getData();
  const [opp, campaign] = await Promise.all([db.getOpportunity(id), db.getCampaign(id)]);
  if (!opp) notFound();
  await db.recordView(id);

  const dl = formatDeadline(opp.deadline);
  const docsOnHand = opp.documents.filter((d) => d.onHand).length;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/opportunities" className="font-mono text-[0.75rem] text-ink-soft hover:text-ink">
          ← All opportunities
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CategoryBadge category={opp.category} />
          <VerdictBadge verdict={opp.verdict} />
          <ConfidenceDot value={opp.confidence} showValue />
          {opp.isNew && (
            <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-card">New</span>
          )}
        </div>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{opp.title}</h1>
        <p className="mt-1 text-ink-soft">
          {opp.org} ·{" "}
          <span className={dl.urgent ? "font-semibold text-urgent" : ""}>
            {dl.left} ({dl.label})
          </span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CardActions id={opp.id} status={opp.status} />
          <a
            href={opp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center rounded-full border border-ink px-3.5 text-sm hover:bg-paper-deep"
          >
            Open original listing ↗
          </a>
          {campaign && (
            <Link
              href={`/campaign/${opp.id}`}
              className="flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm text-card hover:bg-signal-ink"
            >
              {opp.campaignState ?? "View campaign"} →
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-8">
          <figure className="rounded-sm border-l-4 border-signal bg-card p-5">
            <p className="eyebrow mb-2">{proofLead[opp.verdict]}</p>
            <blockquote className="font-display text-2xl leading-snug">“{opp.clause}”</blockquote>
            <figcaption className="mt-2 font-mono text-[0.75rem] text-ink-soft">{opp.clauseSource}</figcaption>
            <p className="mt-3 text-sm leading-relaxed">{opp.reasoning}</p>
          </figure>

          <section aria-labelledby="criteria">
            <h2 id="criteria" className="mb-3 border-b border-ink pb-2 font-display text-2xl">
              Criteria
            </h2>
            <ul className="space-y-3">
              {opp.criteria.map((c) => {
                const m = criterionMeta[c.status];
                return (
                  <li key={c.text} className="flex gap-3 rounded-sm border border-rule bg-card p-3">
                    <span
                      className={`flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 font-mono text-[0.72rem] uppercase tracking-wider ${m.cls}`}
                    >
                      <span aria-hidden>{m.glyph}</span>
                      {m.label}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{c.text}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        <q>{c.clause}</q>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Questions opportunityId={opp.id} questions={opp.questions} />
          </section>

          <section aria-labelledby="docs">
            <div className="mb-3 flex items-baseline justify-between border-b border-ink pb-2">
              <h2 id="docs" className="font-display text-2xl">
                Documents
              </h2>
              <span className="font-mono text-[0.75rem] text-ink-soft">
                {docsOnHand}/{opp.documents.length} on hand
              </span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {opp.documents.map((d) => (
                <li
                  key={d.name}
                  className={`flex min-h-11 items-center gap-3 rounded-sm border px-3 ${d.onHand ? "border-go/40 bg-go-tint" : "border-rule bg-card"}`}
                >
                  <span aria-hidden className={d.onHand ? "text-go" : "text-ink-soft"}>
                    {d.onHand ? "✓" : "○"}
                  </span>
                  <span className="text-sm">{d.name}</span>
                  <span className="sr-only">{d.onHand ? "on hand" : "needed"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-ink-soft">
              Mark documents you have in your{" "}
              <Link href="/profile" className="underline underline-offset-4 hover:text-ink">
                profile
              </Link>
              .
            </p>
          </section>
        </div>

        <aside className="space-y-5">
          <Panel title="Reward & terms">
            <p className="font-medium">{opp.reward}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {opp.terms.map((t) => (
                <li key={t}>{t}</li>
              ))}
              <li>About {opp.effortHours} hours of effort</li>
            </ul>
          </Panel>

          <Panel title="Source">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{opp.source.name}</span>
              <SourceStatusDot status={opp.source.status} withLabel />
            </div>
            <p className="mt-1 font-mono text-[0.75rem] text-ink-soft">
              Checked {opp.source.lastChecked} · found {opp.foundAt}
            </p>
            <Link href="/sources" className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-signal-ink">
              Manage sources
            </Link>
          </Panel>

          <Panel title={`Confidence · ${opp.confidence}%`}>
            <ul className="space-y-3">
              {opp.confidenceBreakdown.map((f) => (
                <li key={f.label}>
                  <div className="flex justify-between text-sm">
                    <span>{f.label}</span>
                    <span className="font-mono text-[0.75rem]">{f.score}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rule" aria-hidden>
                    <div className={`h-full ${confidenceTone(f.score).dot}`} style={{ width: `${f.score}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-sm border border-ink bg-card p-4">
      <h2 className="eyebrow mb-2">{title}</h2>
      {children}
    </section>
  );
}
