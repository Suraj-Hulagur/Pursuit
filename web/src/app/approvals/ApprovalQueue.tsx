"use client";

import { useState } from "react";
import Link from "next/link";
import type { CampaignStep } from "@/lib/types";
import { PendingAction, demoNotice, sentNotice } from "@/components/PendingAction";

interface Item {
  opportunityId: string;
  opportunityTitle: string;
  step: CampaignStep;
}

const key = (i: Item) => `${i.opportunityId}:${i.step.kind}`;

export function ApprovalQueue({ items }: { items: Item[] }) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const open = items.filter((i) => !resolved.has(key(i)));

  return (
    <div>
      {notice && (
        <p
          role="status"
          className="mb-6 rounded-sm border border-ink bg-card px-4 py-2.5 font-mono text-xs"
        >
          {notice}
        </p>
      )}

      {open.length === 0 ? (
        <div className="rounded-sm border border-dashed border-ink-soft p-10 text-center">
          <p className="font-display text-3xl">Nothing waiting on you.</p>
          <p className="mt-2 text-sm text-ink-soft">
            New drafts and requests will show up here.
          </p>
        </div>
      ) : (
        <ol className="space-y-10">
          {open.map((item, n) => (
            <li key={key(item)} className="grid gap-3 sm:grid-cols-[3rem_1fr]">
              <span className="font-display text-4xl leading-none text-signal">
                {String(n + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/campaign/${item.opportunityId}`}
                  className="eyebrow hover:!text-signal"
                >
                  {item.opportunityTitle} →
                </Link>
                <h2 className="mt-1 text-xl font-medium">{item.step.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-ink-soft">{item.step.detail}</p>
                <PendingAction
                  opportunityId={item.opportunityId}
                  step={item.step}
                  onResolved={({ demo }) => {
                    setNotice(demo ? demoNotice : sentNotice);
                    setResolved((prev) => new Set(prev).add(key(item)));
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
