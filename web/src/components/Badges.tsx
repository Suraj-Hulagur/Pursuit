import type { Category, SourceStatus } from "@/lib/types";
import { categoryMeta, confidenceTone, sourceStatusMeta } from "./format";

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.72rem] uppercase tracking-wider";

export function CategoryBadge({ category }: { category: Category }) {
  const m = categoryMeta[category];
  return <span className={`${pill} ${m.badge}`}>{m.label}</span>;
}

export function ConfidenceDot({ value, showValue = false }: { value: number; showValue?: boolean }) {
  const tone = confidenceTone(value);
  return (
    <span
      className="group relative inline-flex items-center gap-1.5 font-mono text-[0.75rem] text-ink-soft"
      tabIndex={0}
      aria-label={`${tone.label} confidence: ${value}%`}
    >
      <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
      {showValue && <span aria-hidden>{value}%</span>}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-[0.72rem] text-card opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {value}% confidence
      </span>
    </span>
  );
}

export function SourceStatusDot({ status, withLabel = false }: { status: SourceStatus; withLabel?: boolean }) {
  const m = sourceStatusMeta[status] ?? sourceStatusMeta.healthy;
  return (
    <span className={`inline-flex items-center gap-1.5 ${withLabel ? m.text : ""}`}>
      <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} />
      {withLabel ? (
        <span className="font-mono text-[0.72rem] uppercase tracking-wider">{m.label}</span>
      ) : (
        <span className="sr-only">{m.label}</span>
      )}
    </span>
  );
}
