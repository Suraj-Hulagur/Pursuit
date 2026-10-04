export type Verdict = "eligible" | "not_eligible" | "unclear";
export type OpportunityType = "scholarship" | "internship" | "hackathon" | "grant";

export interface Opportunity {
  id: string;
  title: string;
  org: string;
  type: OpportunityType;
  verdict: Verdict;
  deadline: string;
  reward: string;
  rewardScore: number;
  effortHours: number;
  effortScore: number;
  clause: string;
  clauseSource: string;
  reasoning: string;
  source: string;
  rank: number | null;
  fit: string | null;
}

export type StepKind =
  | "found"
  | "verified"
  | "drafted"
  | "approved"
  | "sent"
  | "follow_up"
  | "recommendation";

export type StepStatus = "done" | "pending" | "upcoming" | "skipped";

export interface CampaignStep {
  kind: StepKind;
  status: StepStatus;
  at: string;
  title: string;
  detail: string;
  draft?: string;
}

export interface Campaign {
  steps: CampaignStep[];
}

export interface Student {
  name: string;
  course: string;
  college: string;
  cgpa: number;
  familyIncome: string;
  state: string;
}

export interface WeekDay {
  day: string;
  date: number;
  busy: string[];
  freeHours: number;
}
