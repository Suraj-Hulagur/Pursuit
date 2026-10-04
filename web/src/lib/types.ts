export type Verdict = "eligible" | "not_eligible" | "unclear";
export type OpportunityType = "scholarship" | "internship" | "hackathon" | "grant";
export type MatchStatus = "new" | "saved" | "skipped";
export type SourceKind = "gmail" | "web" | "upload" | "manual";

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  url: string | null;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  answer: string | null;
}

// An opportunity as one user sees it: the catalog entry joined with that
// user's match (verdict, proof, rank, status). All match fields come from n8n.
export interface Opportunity {
  id: string;
  title: string;
  org: string;
  type: OpportunityType;
  deadline: string;
  reward: string;
  rewardScore: number;
  effortHours: number;
  effortScore: number;
  source: Source;
  foundAt: string;
  verdict: Verdict;
  clause: string;
  clauseSource: string;
  missing: string[];
  reasoning: string;
  rank: number | null;
  fit: string | null;
  campaignState: string | null;
  status: MatchStatus;
  questions: ClarifyingQuestion[];
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
export type StepAction = "approve" | "edit" | "skip";

export interface CampaignStep {
  kind: StepKind;
  status: StepStatus;
  at: string;
  title: string;
  detail: string;
  draft?: string;
}

export interface Campaign {
  opportunityId: string;
  steps: CampaignStep[];
}

export interface Profile {
  name: string;
  email: string;
  year: string;
  branch: string;
  location: string;
  skills: string[];
  documents: string[];
}

export type ProfileInput = Omit<Profile, "name" | "email">;

export interface WeekDay {
  day: string;
  date: number;
  busy: string[];
  freeHours: number;
}

export interface Week {
  label: string;
  days: WeekDay[];
}
