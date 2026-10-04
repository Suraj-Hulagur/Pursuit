import type { Verdict } from "@/lib/types";
import { verdictMeta } from "./format";

const glyph: Record<Verdict, string> = {
  eligible: "✓",
  unclear: "?",
  not_eligible: "✕",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, cls } = verdictMeta[verdict];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.72rem] uppercase tracking-wider ${cls}`}
    >
      <span aria-hidden>{glyph[verdict]}</span>
      {label}
    </span>
  );
}
