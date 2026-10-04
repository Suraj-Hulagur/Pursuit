// Read-only data access. Verdicts, ranks, missing items and campaign steps
// are produced by n8n; this file only reads them. Swap the JSON import for
// Supabase later.
import raw from "@/data/opportunities.json";
import type { Campaign, CampaignStep, Opportunity, WeekDay } from "./types";

const data = raw as unknown as {
  week: { label: string; days: WeekDay[] };
  opportunities: Opportunity[];
  campaigns: Record<string, Campaign>;
};

export const getWeek = () => data.week;
export const getOpportunities = () => data.opportunities;
export const getOpportunity = (id: string) =>
  data.opportunities.find((o) => o.id === id);
export const getCampaign = (id: string): Campaign | undefined =>
  data.campaigns[id];
export const getCampaignIds = () => Object.keys(data.campaigns);

export interface PendingItem {
  opportunity: Opportunity;
  step: CampaignStep;
}

export function getPendingSteps(): PendingItem[] {
  return Object.entries(data.campaigns).flatMap(([id, c]) => {
    const opportunity = getOpportunity(id);
    if (!opportunity) return [];
    return c.steps
      .filter((s) => s.status === "pending")
      .map((step) => ({ opportunity, step }));
  });
}
