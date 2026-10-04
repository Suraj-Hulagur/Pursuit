import type { OpportunityType, Verdict } from "@/lib/types";

export function formatDeadline(iso: string) {
  const d = new Date(iso + "T23:59:00+05:30");
  const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  const left =
    days < 0 ? "closed" : days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`;
  return { label, left, urgent: days >= 0 && days <= 5 };
}

export const verdictMeta: Record<Verdict, { label: string; cls: string }> = {
  eligible: { label: "Eligible", cls: "bg-go-tint text-go border-go/30" },
  unclear: { label: "Unclear", cls: "bg-maybe-tint text-maybe border-maybe/30" },
  not_eligible: { label: "Not eligible", cls: "bg-no-tint text-no border-no/30" },
};

export const typeLabel: Record<OpportunityType, string> = {
  scholarship: "Scholarship",
  internship: "Internship",
  hackathon: "Hackathon",
  grant: "Grant",
};
