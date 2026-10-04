import Link from "next/link";
import type { Activity, ActivityKind } from "@/lib/types";

const icon: Record<ActivityKind, { glyph: string; label: string }> = {
  scan: { glyph: "◎", label: "Scanned" },
  found: { glyph: "＋", label: "Found" },
  repair: { glyph: "⚙", label: "Repair" },
  draft: { glyph: "✎", label: "Drafted" },
  sent: { glyph: "↗", label: "Sent" },
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <section aria-labelledby="activity" className="rounded-sm border border-ink bg-card">
      <div className="flex items-center justify-between border-b border-ink px-4 py-3">
        <h2 id="activity" className="font-display text-xl">
          Pursuit is working
        </h2>
        <span className="flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-wider text-go">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-go opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-go" />
          </span>
          Live
        </span>
      </div>
      {items.length === 0 ? (
        <p className="p-4 text-sm text-ink-soft">No activity yet.</p>
      ) : (
        <ol className="divide-y divide-rule">
          {items.map((a) => {
            const body = (
              <>
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule bg-paper text-[0.8rem]"
                >
                  {icon[a.kind].glyph}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm leading-snug">{a.text}</span>
                  <span className="mt-0.5 block font-mono text-[0.72rem] text-ink-soft">
                    <span className="sr-only">{icon[a.kind].label}, </span>
                    {a.at}
                  </span>
                </span>
              </>
            );
            return (
              <li key={a.id}>
                {a.href ? (
                  <Link href={a.href} className="flex gap-3 px-4 py-3 transition-colors hover:bg-paper-deep/60">
                    {body}
                  </Link>
                ) : (
                  <div className="flex gap-3 px-4 py-3">{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
