import Link from "next/link";

// Shown when /opportunity/[id] calls notFound(): the ID isn't in the data
// source (deleted, mistyped, or from an old link).
export default function OpportunityNotFound() {
  return (
    <div className="mx-auto max-w-xl py-12 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Opportunity not found</h1>
      <p className="mt-4 text-ink-soft">
        This opportunity doesn&apos;t exist or is no longer available to you. It may have been
        removed, or the link may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/opportunities"
          className="flex h-11 items-center rounded-full bg-ink px-6 font-medium text-card transition-colors hover:bg-signal-ink"
        >
          Browse opportunities
        </Link>
        <Link
          href="/dashboard"
          className="flex h-11 items-center rounded-full border border-ink px-6 transition-colors hover:bg-paper-deep"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
