import Link from "next/link";
import type { Source } from "@/lib/types";
import { SourceStatusDot } from "./Badges";
import { sourceStatusMeta } from "./format";

export function SourceChips({ sources }: { sources: Source[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Sources">
      {sources.map((s) => (
        <li key={s.id}>
          <Link
            href="/sources"
            title={`${s.name}: ${sourceStatusMeta[s.status].label}, checked ${s.lastChecked}`}
            className="flex h-7 items-center gap-1.5 rounded-full border border-rule bg-card px-2.5 text-[0.78rem] transition-colors hover:border-ink"
          >
            <SourceStatusDot status={s.status} />
            <span className="max-w-40 truncate">{s.name}</span>
            <span className="font-mono text-[0.7rem] text-ink-soft">{s.lastChecked}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
