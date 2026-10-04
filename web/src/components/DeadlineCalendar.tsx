import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { CATEGORIES, categoryMeta, istDateKey } from "./format";

const WEEKS = 5;
const DAY = 86_400_000;

// Deadlines over the next five weeks, colour coded by category.
export function DeadlineCalendar({ opportunities }: { opportunities: Opportunity[] }) {
  const todayKey = istDateKey(new Date());
  const today = new Date(todayKey + "T12:00:00+05:30");
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const start = new Date(today.getTime() - mondayOffset * DAY);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => new Date(start.getTime() + i * DAY));

  const byDay = new Map<string, Opportunity[]>();
  for (const o of opportunities) {
    byDay.set(o.deadline, [...(byDay.get(o.deadline) ?? []), o]);
  }

  const monthLabel = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" });

  return (
    <section aria-labelledby="calendar" className="rounded-sm border border-ink bg-card p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="calendar" className="font-display text-xl">
          Deadlines
        </h2>
        <ul className="flex flex-wrap gap-3" aria-label="Legend">
          {CATEGORIES.map((c) => (
            <li key={c} className="flex items-center gap-1.5 text-[0.78rem]">
              <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${categoryMeta[c].fill}`} />
              {categoryMeta[c].plural}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-sm border border-rule bg-rule text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-paper-deep py-1 font-mono text-[0.7rem] uppercase text-ink-soft">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = istDateKey(d);
          const items = byDay.get(key) ?? [];
          const past = key < todayKey;
          const isToday = key === todayKey;
          const dayNum = d.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });
          return (
            <div
              key={key}
              className={`min-h-14 p-1 text-left sm:min-h-16 ${past ? "bg-paper" : "bg-card"}`}
            >
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[0.72rem] ${
                  isToday ? "bg-ink text-card" : past ? "text-ink-soft" : ""
                }`}
              >
                {dayNum === "1" ? `${monthLabel(d)} 1` : dayNum}
              </span>
              <div className="mt-0.5 flex flex-col gap-0.5">
                {items.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunity/${o.id}`}
                    title={`${categoryMeta[o.category].label}: ${o.title}`}
                    className={`block truncate rounded-[2px] px-1 text-[0.7rem] leading-4 text-card ${categoryMeta[o.category].fill} hover:opacity-85`}
                  >
                    <span className="hidden sm:inline">{o.title}</span>
                    <span className="sm:hidden" aria-hidden>
                      ●
                    </span>
                    <span className="sr-only sm:hidden">{o.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
