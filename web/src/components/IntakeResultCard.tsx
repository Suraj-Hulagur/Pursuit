"use client";

import type { IntakeResult } from "@/lib/n8n";
import type { Category } from "@/lib/types";
import { CategoryBadge } from "./Badges";
import { formatDeadline } from "./format";

const CATEGORY: Partial<Record<string, Category>> = {
  scholarship: "scholarship",
  grant: "scholarship",
  hackathon: "hackathon",
  internship: "internship",
  event: "event",
};

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-0.5 text-sm">{value || <span className="text-ink-soft">Not stated</span>}</dd>
    </div>
  );
}

export function IntakeResultCard({ result, onDismiss }: { result: IntakeResult; onDismiss: () => void }) {
  const execution = result.executionId ? (
    <span className="font-mono text-[0.72rem] text-ink-soft">n8n execution #{result.executionId}</span>
  ) : null;

  if (!result.ok) {
    return (
      <section role="alert" className="rounded-sm border border-urgent bg-urgent-tint p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-urgent">{result.error}</p>
            {result.detail && <p className="mt-1 text-sm text-ink-soft">{result.detail}</p>}
            <div className="mt-2">{execution}</div>
          </div>
          <button onClick={onDismiss} className="h-8 shrink-0 rounded-full border border-ink px-3 text-sm hover:bg-card">
            Dismiss
          </button>
        </div>
      </section>
    );
  }

  const x = result.extracted;
  const category = CATEGORY[x.type];
  const dl = x.deadline ? formatDeadline(x.deadline) : null;
  const verified = x.eligibility.filter((c) => c.verbatim).length;

  return (
    <section aria-labelledby="intake-title" className="rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-wider text-go">
          <span aria-hidden className="h-2 w-2 rounded-full bg-go" />
          Extracted by n8n · Gemini
        </span>
        <span className="flex items-center gap-3">
          {execution}
          <button onClick={onDismiss} className="h-8 rounded-full border border-ink px-3 text-sm hover:bg-paper-deep">
            Dismiss
          </button>
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {!x.isOpportunity && (
          <p className="rounded-sm bg-maybe-tint px-3 py-2 text-sm text-maybe">
            This doesn&apos;t look like a scholarship, hackathon, internship or event.
          </p>
        )}

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {category ? (
              <CategoryBadge category={category} />
            ) : (
              <span className="rounded-full border border-rule px-2.5 py-0.5 font-mono text-[0.72rem] uppercase tracking-wider text-ink-soft">
                {x.type}
              </span>
            )}
            {dl && (
              <span className={`font-mono text-[0.78rem] ${dl.urgent ? "font-semibold text-urgent" : "text-ink-soft"}`}>
                {dl.left}
              </span>
            )}
          </div>
          <h2 id="intake-title" className="mt-2 font-display text-2xl leading-tight">
            {x.title || "Untitled opportunity"}
          </h2>
          {result.sourceUrl && (
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block max-w-full truncate font-mono text-[0.75rem] text-ink-soft underline decoration-rule underline-offset-4 hover:text-ink"
            >
              {result.sourceUrl} ↗
            </a>
          )}
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <Meta label="Organisation" value={x.org} />
          <Meta label="Deadline" value={dl ? `${dl.label} ${x.deadline.slice(0, 4)}` : x.deadlineText} />
          <Meta label="Reward" value={x.reward} />
        </dl>

        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="eyebrow">Eligibility, quoted</h3>
            {x.eligibility.length > 0 && (
              <span className="font-mono text-[0.72rem] text-ink-soft">
                {verified}/{x.eligibility.length} quotes verified against the page
              </span>
            )}
          </div>
          {x.eligibility.length === 0 ? (
            <p className="text-sm text-ink-soft">No eligibility rules stated on this page.</p>
          ) : (
            <ul className="space-y-2">
              {x.eligibility.map((c, i) => (
                <li key={i} className="rounded-sm border-l-4 border-signal bg-paper-deep/60 px-3 py-2">
                  <q className="font-display text-[1.05rem] leading-snug">{c.clause}</q>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
                    <span>{c.summary}</span>
                    <span className={`font-mono text-[0.72rem] ${c.verbatim ? "text-go" : "text-urgent"}`}>
                      {c.verbatim ? "✓ verbatim" : "⚠ not found word-for-word"}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="eyebrow mb-1.5">Documents needed</h3>
          {x.documents.length === 0 ? (
            <p className="text-sm text-ink-soft">None listed.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {x.documents.map((d) => (
                <li key={d} className="rounded-full border border-rule bg-paper px-2.5 py-1 text-sm">
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
