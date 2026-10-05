"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { SEED_OPPORTUNITIES } from "@/lib/data/seed";
import {
  SEED_APPOINTMENTS,
  appointmentTypeMeta,
  type CalendarAppointment,
} from "@/lib/data/appointments";
import { CATEGORIES, categoryMeta, istDateKey } from "./format";

const WEEKS = 5;
const DAY = 86_400_000;

export function DeadlineCalendar({ opportunities }: { opportunities: Opportunity[] }) {
  const [tab, setTab] = useState<"deadlines" | "appointments">("deadlines");

  const todayKey = istDateKey(new Date());
  const today = new Date(todayKey + "T12:00:00+05:30");
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const start = new Date(today.getTime() - mondayOffset * DAY);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => new Date(start.getTime() + i * DAY));

  // Deadlines data (fallback to seed so it is never empty)
  const itemsList =
    opportunities && opportunities.length > 0
      ? opportunities
      : (SEED_OPPORTUNITIES as unknown as Opportunity[]);

  const deadlinesByDay = new Map<string, Opportunity[]>();
  for (const o of itemsList) {
    deadlinesByDay.set(o.deadline, [...(deadlinesByDay.get(o.deadline) ?? []), o]);
  }

  // Appointments data (for accepted / saved opportunities)
  const appointments = SEED_APPOINTMENTS;
  const appointmentsByDay = new Map<string, CalendarAppointment[]>();
  for (const a of appointments) {
    appointmentsByDay.set(a.date, [...(appointmentsByDay.get(a.date) ?? []), a]);
  }

  const monthLabel = (d: Date) =>
    d.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" });

  const deadlineCount = itemsList.filter((o) => o.deadline >= todayKey).length;
  const appointmentCount = appointments.filter((a) => a.date >= todayKey).length;

  return (
    <section aria-labelledby="calendar-heading" className="rounded-sm border border-ink bg-card p-4">
      {/* Header with Title and Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="calendar-heading" className="font-display text-2xl tracking-tight">
            Calendar
          </h2>
          <div className="flex items-center rounded-full border border-rule bg-paper-deep p-0.5">
            <button
              type="button"
              onClick={() => setTab("deadlines")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                tab === "deadlines"
                  ? "bg-ink text-card shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <span>Deadlines</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.68rem] ${
                  tab === "deadlines" ? "bg-card/20 text-card" : "bg-card text-ink-soft"
                }`}
              >
                {deadlineCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("appointments")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                tab === "appointments"
                  ? "bg-ink text-card shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <span>Appointments (Accepted)</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.68rem] ${
                  tab === "appointments" ? "bg-card/20 text-card" : "bg-card text-ink-soft"
                }`}
              >
                {appointmentCount}
              </span>
            </button>
          </div>
        </div>

        {/* Legend */}
        {tab === "deadlines" ? (
          <ul className="flex flex-wrap items-center gap-3 text-[0.76rem]" aria-label="Deadlines legend">
            {CATEGORIES.map((c) => (
              <li key={c} className="flex items-center gap-1.5">
                <span aria-hidden className={`h-2.5 w-2.5 rounded-sm ${categoryMeta[c].fill}`} />
                <span className="text-ink-soft">{categoryMeta[c].plural}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-wrap items-center gap-3 text-[0.76rem]" aria-label="Appointments legend">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-go" />
              <span className="text-ink-soft">Accepted / Sync</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-ink-soft">Interview</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-ink-soft">Mentor Sync</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-ink-soft">Milestone</span>
            </li>
          </ul>
        )}
      </div>

      {/* 5-Week Grid */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-sm border border-rule bg-rule text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-paper-deep py-1 font-mono text-[0.7rem] uppercase text-ink-soft">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const key = istDateKey(d);
          const past = key < todayKey;
          const isToday = key === todayKey;
          const dayNum = d.toLocaleDateString("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" });

          const dayDeadlines = deadlinesByDay.get(key) ?? [];
          const dayAppointments = appointmentsByDay.get(key) ?? [];

          return (
            <div
              key={key}
              className={`min-h-16 p-1 text-left sm:min-h-20 ${
                past ? "bg-paper/80" : isToday ? "bg-paper-deep/40" : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[0.72rem] ${
                    isToday
                      ? "bg-ink font-semibold text-card"
                      : past
                        ? "text-ink-soft/70"
                        : "text-ink font-medium"
                  }`}
                >
                  {dayNum === "1" ? `${monthLabel(d)} 1` : dayNum}
                </span>
                {isToday && (
                  <span className="hidden font-mono text-[0.65rem] uppercase tracking-wide text-signal-ink sm:inline">
                    Today
                  </span>
                )}
              </div>

              {/* Items in Day Cell */}
              <div className="mt-1 flex flex-col gap-1">
                {tab === "deadlines"
                  ? dayDeadlines.map((o) => (
                      <Link
                        key={o.id}
                        href={`/opportunity/${o.id}`}
                        title={`${categoryMeta[o.category]?.label || "Opportunity"}: ${o.title}`}
                        className={`block truncate rounded px-1.5 py-0.5 text-[0.7rem] font-medium leading-4 text-card shadow-xs transition-opacity hover:opacity-85 ${
                          categoryMeta[o.category]?.fill || "bg-signal-ink"
                        }`}
                      >
                        <span className="hidden sm:inline">{o.title}</span>
                        <span className="sm:hidden" aria-hidden>
                          ●
                        </span>
                        <span className="sr-only sm:hidden">{o.title}</span>
                      </Link>
                    ))
                  : dayAppointments.map((a) => (
                      <Link
                        key={a.id}
                        href={a.campaignUrl || `/opportunity/${a.opportunityId}`}
                        title={`${a.time} - ${a.typeLabel} (${a.opportunityTitle})`}
                        className={`block truncate rounded px-1.5 py-0.5 text-[0.7rem] font-medium leading-4 text-card shadow-xs transition-opacity hover:opacity-85 ${
                          appointmentTypeMeta[a.type]?.fill || "bg-go"
                        }`}
                      >
                        <span className="hidden font-mono text-[0.65rem] opacity-90 sm:inline">
                          {a.time} ·{" "}
                        </span>
                        <span className="hidden sm:inline">{a.opportunityTitle}</span>
                        <span className="sm:hidden font-bold" aria-hidden>
                          ✓
                        </span>
                        <span className="sr-only sm:hidden">{a.typeLabel}</span>
                      </Link>
                    ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointments List View below the Calendar */}
      {tab === "appointments" && (
        <div className="mt-5 rounded-sm border border-rule bg-paper-deep/30 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg">Upcoming Appointments & Milestones</h3>
            <span className="font-mono text-xs text-ink-soft">
              {appointmentCount} scheduled for accepted opportunities
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {appointments.map((a) => {
              const appDate = new Date(a.date + "T12:00:00+05:30");
              const formattedDate = appDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                timeZone: "Asia/Kolkata",
              });
              const isPast = a.date < todayKey;
              const meta = appointmentTypeMeta[a.type];

              return (
                <div
                  key={a.id}
                  className={`flex flex-col justify-between rounded border p-3 transition-colors ${
                    isPast
                      ? "border-rule/60 bg-paper/50 opacity-60"
                      : "border-rule bg-card hover:border-ink"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-mono text-xs font-semibold text-ink">
                        {formattedDate} · {a.time}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-ink">{a.typeLabel}</h4>
                    <p className="text-xs text-ink-soft">
                      {a.opportunityTitle} · <span className="italic">{a.org}</span>
                    </p>
                    {a.notes && <p className="text-[0.75rem] text-ink-soft">{a.notes}</p>}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-rule/60 pt-2 text-xs">
                    <span className="truncate font-mono text-[0.72rem] text-ink-soft">
                      📍 {a.location}
                    </span>
                    <Link
                      href={a.campaignUrl || `/opportunity/${a.opportunityId}`}
                      className="font-medium text-signal-ink underline underline-offset-2 hover:text-ink"
                    >
                      View Campaign →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
