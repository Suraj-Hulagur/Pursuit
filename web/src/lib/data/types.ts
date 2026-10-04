import type {
  Campaign,
  MatchStatus,
  Opportunity,
  Profile,
  ProfileInput,
  Source,
  StepAction,
  StepKind,
  CampaignStep,
  Week,
} from "@/lib/types";

export interface CampaignSummary {
  opportunity: Opportunity;
  campaign: Campaign;
}

export interface PendingItem {
  opportunity: Opportunity;
  step: CampaignStep;
}

// The only way pages read or write data. Both implementations (mock and
// supabase) are scoped to the signed-in user.
export interface DataStore {
  getProfile(): Promise<Profile>;
  updateProfile(input: ProfileInput): Promise<void>;

  listSources(): Promise<Source[]>;
  listOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | null>;
  setOpportunityStatus(id: string, status: MatchStatus): Promise<void>;
  answerQuestion(opportunityId: string, questionId: string, answer: string): Promise<void>;

  listCampaigns(): Promise<CampaignSummary[]>;
  getCampaign(opportunityId: string): Promise<Campaign | null>;
  listPendingApprovals(): Promise<PendingItem[]>;
  resolveStep(
    opportunityId: string,
    stepKind: StepKind,
    action: StepAction,
    draft?: string,
  ): Promise<void>;

  getWeek(): Promise<Week>;
}
