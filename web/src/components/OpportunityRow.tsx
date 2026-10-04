"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { VerdictBadge } from "./VerdictBadge";
import { EffortReward } from "./EffortReward";
import { formatDeadline, typeLabel } from "./format";

export function OpportunityRow({
  opp,
  hasCampaign,
}: {
  opp: Opportunity;
  hasCampaign: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deadline = formatDeadline(opp.deadline);
  const muted = opp.verdict === "not_eligible";

  return (
    <li className="border-b border-rule last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-1 items-center gap-3 px-1 py-5 text-left transition-colors hover:bg-paper-deep/50 md:grid-cols-[1fr_auto_auto_auto] md:gap-8 md:px-3"
      >
        <div className="min-w-0">
          <p className="eyebrow mb-1">
            {typeLabel[opp.type]} · {opp.org}
          </p>
          <p
            className={`text-lg font-medium leading-snug ${muted ? "text-ink-soft" : ""}`}
          >
            {opp.title}
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">{opp.reward}</p>
        </div>
        <EffortReward {...opp} />
        <div className="font-mono text-sm md:w-28 md:text-right">
          <span>{deadline.label}</span>
          <span
            className={`ml-2 md:ml-0 md:block text-[0.7rem] ${deadline.urgent ? "text-signal" : "text-ink-soft"}`}
          >
            {deadline.left}
          </span>
        </div>
        <div className="flex items-center gap-3 md:w-40 md:justify-end">
          <VerdictBadge verdict={opp.verdict} />
          <span
            className={`font-mono text-ink-soft transition-transform ${open ? "rotate-45" : ""}`}
            aria-hidden
          >
            +
          </span>
        </div>
      </button>

      {open && (
        <div className="grid gap-6 px-1 pb-7 md:grid-cols-[1fr_16rem] md:px-3">
          <figure className="border-l-2 border-ink pl-5">
            <p className="eyebrow mb-2">The clause</p>
            <blockquote className="font-display text-2xl leading-snug">
              “{opp.clause}”
            </blockquote>
            <figcaption className="mt-2 font-mono text-[0.7rem] text-ink-soft">
              {opp.clauseSource}
            </figcaption>
          </figure>
          <div className="space-y-4 text-sm">
            <div>
              <p className="eyebrow mb-1">Why this verdict</p>
              <p className="leading-relaxed">{opp.reasoning}</p>
            </div>
            <p className="font-mono text-[0.7rem] text-ink-soft">{opp.source}</p>
            {hasCampaign && (
              <Link
                href={`/campaign/${opp.id}`}
                className="inline-block border-b border-ink pb-0.5 font-medium hover:border-signal hover:text-signal"
              >
                Open campaign →
              </Link>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
