export type Verdict = "eligible" | "not_eligible" | "unclear";
export type Category = "scholarship" | "hackathon" | "internship" | "event";
export type MatchStatus = "new" | "saved" | "skipped";
export type SourceKind = "gmail" | "web" | "upload" | "manual";
export type SourceStatus = "healthy" | "repairing" | "broken";
// Met / Borderline / Unverified per the doc; not_met is needed so a
// "not eligible" verdict can point at the criterion that fails.
export type CriterionStatus = "met" | "borderline" | "unverified" | "not_met";

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  url: string | null;
  status: SourceStatus;
  lastChecked: string;
  isPublic: boolean;
  enabled: boolean;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  answer: string | null;
}

export interface Criterion {
  text: string;
  status: CriterionStatus;
  clause: string;
}

export interface ConfidenceFactor {
  label: string;
  score: number;
}

export interface RequiredDocument {
  name: string;
  onHand: boolean;
}

// An opportunity as one user sees it: the catalogue entry joined with that
// user's match. Verdict, criteria, confidence and rank all come from n8n.
export interface Opportunity {
  id: string;
  title: string;
  org: string;
  category: Category;
  deadline: string;
  url: string;
  reward: string;
  terms: string[];
  effortHours: number;
  source: Source;
  foundAt: string;
  isNew: boolean;
  verdict: Verdict;
  confidence: number;
  confidenceBreakdown: ConfidenceFactor[];
  clause: string;
  clauseSource: string;
  criteria: Criterion[];
  documents: RequiredDocument[];
  reasoning: string;
  rank: number | null;
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

export type ActivityKind = "scan" | "found" | "repair" | "draft" | "sent";

export interface Activity {
  id: string;
  kind: ActivityKind;
  at: string;
  text: string;
  href: string | null;
}

export interface Profile {
  name: string;
  email: string;
  location: string;
  citizenship: string;
  level: string;
  field: string;
  college: string;
  gpa: string;
  skills: string[];
  interests: string[];
  documents: string[];
  notifyDigest: boolean;
  notifyReminders: boolean;
  onboarded: boolean;
}

export type ProfileInput = Partial<Omit<Profile, "email" | "onboarded">>;
