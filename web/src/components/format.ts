import type { Category, CriterionStatus, SourceStatus, Verdict } from "@/lib/types";

const DAY = 86_400_000;
const IST = "Asia/Kolkata";

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso + "T23:59:00+05:30").getTime() - Date.now()) / DAY);
}

export function formatDeadline(iso: string) {
  const days = daysUntil(iso);
  const label = new Date(iso + "T12:00:00+05:30").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: IST,
  });
  const left =
    days < 0 ? "closed" : days === 0 ? "today" : days === 1 ? "1 day left" : `${days} days left`;
  // Red urgency at 7 days or fewer.
  return { label, left, days, urgent: days >= 0 && days <= 7 };
}

// YYYY-MM-DD for a date in India time.
export function istDateKey(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: IST });
}

export const verdictMeta: Record<Verdict, { label: string; cls: string }> = {
  eligible: { label: "Eligible", cls: "bg-go-tint text-go border-go/30" },
  unclear: { label: "Unclear", cls: "bg-maybe-tint text-maybe border-maybe/30" },
  not_eligible: { label: "Not eligible", cls: "bg-no-tint text-no border-no/30" },
};

export const proofLead: Record<Verdict, string> = {
  eligible: "You qualify because:",
  unclear: "Unclear because:",
  not_eligible: "You don't qualify because:",
};

export const categoryMeta: Record<
  Category,
  { label: string; plural: string; badge: string; fill: string }
> = {
  scholarship: {
    label: "Scholarship",
    plural: "Scholarships",
    badge: "bg-cat-scholarship-tint text-cat-scholarship border-cat-scholarship/30",
    fill: "bg-cat-scholarship",
  },
  hackathon: {
    label: "Hackathon",
    plural: "Hackathons",
    badge: "bg-cat-hackathon-tint text-cat-hackathon border-cat-hackathon/30",
    fill: "bg-cat-hackathon",
  },
  internship: {
    label: "Internship",
    plural: "Internships",
    badge: "bg-cat-internship-tint text-cat-internship border-cat-internship/30",
    fill: "bg-cat-internship",
  },
  event: {
    label: "Event",
    plural: "Events",
    badge: "bg-cat-event-tint text-cat-event border-cat-event/30",
    fill: "bg-cat-event",
  },
};

export const CATEGORIES: Category[] = ["scholarship", "hackathon", "internship", "event"];

export const sourceStatusMeta: Record<SourceStatus, { label: string; dot: string; text: string }> = {
  healthy: { label: "Healthy", dot: "bg-go", text: "text-go" },
  repairing: { label: "Repairing", dot: "bg-maybe-dot", text: "text-maybe" },
  broken: { label: "Broken", dot: "bg-urgent", text: "text-urgent" },
};

export const criterionMeta: Record<CriterionStatus, { label: string; glyph: string; cls: string }> = {
  met: { label: "Met", glyph: "✓", cls: "bg-go-tint text-go" },
  borderline: { label: "Borderline", glyph: "~", cls: "bg-maybe-tint text-maybe" },
  unverified: { label: "Unverified", glyph: "?", cls: "bg-no-tint text-no" },
  not_met: { label: "Not met", glyph: "✕", cls: "bg-urgent-tint text-urgent" },
};

export function confidenceTone(pct: number) {
  if (pct >= 80) return { dot: "bg-go", label: "High" };
  if (pct >= 50) return { dot: "bg-maybe-dot", label: "Medium" };
  return { dot: "bg-urgent", label: "Low" };
}
