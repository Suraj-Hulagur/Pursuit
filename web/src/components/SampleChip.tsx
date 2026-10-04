export function SampleChip({ label = "Sample data" }: { label?: string }) {
  return (
    <span
      title="Fictional data for UI development, not real opportunities"
      className="inline-flex items-center rounded-full border border-dashed border-ink-soft px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-soft"
    >
      {label}
    </span>
  );
}
