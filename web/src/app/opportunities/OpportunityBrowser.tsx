"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Opportunity, Verdict } from "@/lib/types";
import { VerdictBadge } from "@/components/VerdictBadge";
import { CategoryBadge, ConfidenceDot } from "@/components/Badges";
import { CardActions } from "@/components/CardActions";
import { Questions } from "@/components/Questions";
import { CATEGORIES, categoryMeta, formatDeadline, proofLead } from "@/components/format";

export type Filter = "questions" | "new" | null;

const verdictOrder: Record<Verdict, number> = { eligible: 0, unclear: 1, not_eligible: 2 };

// Filtering here is display only (search text, category, flags from n8n).
export function OpportunityBrowser({
  opportunities,
  initialQuery,
  initialCategory,
  initialFilter,
}: {
  opportunities: Opportunity[];
  initialQuery: string;
  initialCategory: string;
  initialFilter: Filter;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category | "all">(
    (CATEGORIES as string[]).includes(initialCategory) ? (initialCategory as Category) : "all",
  );
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [showSkipped, setShowSkipped] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const o of opportunities) {
      if (o.status === "skipped") continue;
      c.all++;
      c[o.category] = (c[o.category] ?? 0) + 1;
    }
    return c;
  }, [opportunities]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities
      .filter((o) => (showSkipped ? true : o.status !== "skipped"))
      .filter((o) => category === "all" || o.category === category)
      .filter((o) =>
        filter === "questions"
          ? o.questions.some((x) => x.answer === null)
          : filter === "new"
            ? o.isNew
            : true,
      )
      .filter(
        (o) =>
          !q ||
          [o.title, o.org, o.clause, o.reward, categoryMeta[o.category].label]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .sort(
        (a, b) =>
          verdictOrder[a.verdict] - verdictOrder[b.verdict] || a.deadline.localeCompare(b.deadline),
      );
  }, [opportunities, query, category, filter, showSkipped]);

  const skippedCount = opportunities.filter((o) => o.status === "skipped").length;
  const pill = (active: boolean) =>
    `flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm transition-colors ${
      active ? "border-ink bg-ink text-card" : "border-rule bg-card hover:border-ink"
    }`;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Search opportunities</span>
          <svg aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, organisation or clause…"
            className="h-12 w-full rounded-full border border-ink bg-card pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-signal/40"
          />
        </label>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
          <button onClick={() => setCategory("all")} aria-pressed={category === "all"} className={pill(category === "all")}>
            All <span className="font-mono text-[0.72rem]">{counts.all}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={pill(category === c)}>
              <span aria-hidden className={`h-2 w-2 rounded-full ${categoryMeta[c].fill}`} />
              {categoryMeta[c].plural} <span className="font-mono text-[0.72rem]">{counts[c] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {filter && (
            <button onClick={() => setFilter(null)} className="flex h-8 items-center gap-1.5 rounded-full bg-maybe-tint px-3 text-maybe">
              {filter === "questions" ? "Needs your answer" : "New since yesterday"} <span aria-hidden>×</span>
              <span className="sr-only">Clear filter</span>
            </button>
          )}
          {skippedCount > 0 && (
            <label className="flex cursor-pointer items-center gap-2 text-ink-soft">
              <input type="checkbox" checked={showSkipped} onChange={(e) => setShowSkipped(e.target.checked)} className="h-4 w-4 accent-[var(--ink)]" />
              Show skipped ({skippedCount})
            </label>
          )}
          <span className="ml-auto font-mono text-[0.75rem] text-ink-soft" aria-live="polite">
            {visible.length} shown
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-sm border border-dashed border-ink-soft p-10 text-center text-ink-soft">
          Nothing matches. Try another search or category.
        </p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {visible.map((o) => (
            <li key={o.id}>
              <ListCard opp={o} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListCard({ opp }: { opp: Opportunity }) {
  const dl = formatDeadline(opp.deadline);
  const muted = opp.status === "skipped";
  return (
    <article className={`flex h-full flex-col rounded-sm border bg-card p-4 sm:p-5 ${muted ? "border-rule" : "border-ink"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={opp.category} />
        <VerdictBadge verdict={opp.verdict} />
        <ConfidenceDot value={opp.confidence} />
        {opp.isNew && (
          <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-card">New</span>
        )}
        <span className={`ml-auto font-mono text-[0.75rem] ${dl.urgent ? "font-semibold text-urgent" : "text-ink-soft"}`}>
          {dl.left} · {dl.label}
        </span>
      </div>

      <Link href={`/opportunity/${opp.id}`} className="mt-3 text-lg font-medium leading-snug hover:text-signal-ink hover:underline">
        {opp.title}
      </Link>
      <p className="text-sm text-ink-soft">
        {opp.org} · {opp.reward}
      </p>

      <p className="mt-3 border-l-2 border-ink pl-3 text-sm leading-relaxed">
        <span className="font-medium">{proofLead[opp.verdict]}</span>{" "}
        <q className="font-display text-[1.05rem]">{opp.clause}</q>
      </p>

      <Questions opportunityId={opp.id} questions={opp.questions} />

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        <a
          href={opp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[0.75rem] text-ink-soft underline decoration-rule underline-offset-4 hover:text-ink"
        >
          Source: {opp.source.name} ↗
        </a>
        <CardActions id={opp.id} status={opp.status} />
      </div>
    </article>
  );
}
