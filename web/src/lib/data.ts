// Read-only data access. Verdicts, ranks and campaign steps are produced by
// n8n; this file only reads them. Swap the JSON import for Supabase later.
import raw from "@/data/opportunities.json";
import type { Campaign, Opportunity, Student, WeekDay } from "./types";

const data = raw as unknown as {
  student: Student;
  week: { label: string; days: WeekDay[] };
  opportunities: Opportunity[];
  campaigns: Record<string, Campaign>;
};

export const getStudent = () => data.student;
export const getWeek = () => data.week;
export const getOpportunities = () => data.opportunities;
export const getOpportunity = (id: string) =>
  data.opportunities.find((o) => o.id === id);
export const getCampaign = (id: string): Campaign | undefined =>
  data.campaigns[id];
export const getCampaignIds = () => Object.keys(data.campaigns);
