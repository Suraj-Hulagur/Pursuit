import "server-only";
import type { Campaign, Opportunity, Profile } from "@/lib/types";
import type { DataStore } from "./types";
import {
  SEED_CAMPAIGNS,
  SEED_OPPORTUNITIES,
  SEED_SOURCES,
  SEED_WEEK,
  type SeedOpportunity,
} from "./seed";

// In-memory, per-user state on the server. It resets when the dev server
// restarts. It stands in for what n8n + Supabase will hold, so the mutations
// below only record the user's choice; they don't re-run eligibility.
interface UserState {
  profile: Profile;
  opportunities: SeedOpportunity[];
  campaigns: Campaign[];
}

const globalStore = globalThis as unknown as {
  __pursuitMock?: Map<string, UserState>;
};
const users = (globalStore.__pursuitMock ??= new Map());

function stateFor(user: { name: string; email: string }): UserState {
  const key = user.email.toLowerCase();
  let state = users.get(key);
  if (!state) {
    state = {
      profile: {
        name: user.name,
        email: user.email,
        year: "",
        branch: "",
        location: "",
        skills: [],
        documents: [],
      },
      opportunities: structuredClone(SEED_OPPORTUNITIES),
      campaigns: structuredClone(SEED_CAMPAIGNS),
    };
    users.set(key, state);
  }
  return state;
}

function withSource(o: SeedOpportunity): Opportunity {
  const { sourceId, ...rest } = o;
  const source = SEED_SOURCES.find((s) => s.id === sourceId) ?? {
    id: sourceId,
    name: "Unknown source",
    kind: "manual" as const,
    url: null,
  };
  return structuredClone({ ...rest, source });
}

export function createMockStore(user: { name: string; email: string }): DataStore {
  const s = stateFor(user);
  const findOpp = (id: string) => s.opportunities.find((o) => o.id === id);
  const findCampaign = (id: string) => s.campaigns.find((c) => c.opportunityId === id);

  return {
    async getProfile() {
      return structuredClone(s.profile);
    },
    async updateProfile(input) {
      s.profile = { ...s.profile, ...input };
    },

    async listSources() {
      return structuredClone(SEED_SOURCES);
    },
    async listOpportunities() {
      return s.opportunities.map(withSource);
    },
    async getOpportunity(id) {
      const o = findOpp(id);
      return o ? withSource(o) : null;
    },
    async setOpportunityStatus(id, status) {
      const o = findOpp(id);
      if (o) o.status = status;
    },
    async answerQuestion(opportunityId, questionId, answer) {
      const q = findOpp(opportunityId)?.questions.find((q) => q.id === questionId);
      if (q) q.answer = answer;
    },

    async listCampaigns() {
      return s.campaigns.flatMap((campaign) => {
        const o = findOpp(campaign.opportunityId);
        return o ? [{ opportunity: withSource(o), campaign: structuredClone(campaign) }] : [];
      });
    },
    async getCampaign(opportunityId) {
      const c = findCampaign(opportunityId);
      return c ? structuredClone(c) : null;
    },
    async listPendingApprovals() {
      return s.campaigns.flatMap((c) => {
        const o = findOpp(c.opportunityId);
        if (!o) return [];
        return c.steps
          .filter((step) => step.status === "pending")
          .map((step) => ({ opportunity: withSource(o), step: structuredClone(step) }));
      });
    },
    async resolveStep(opportunityId, stepKind, action, draft) {
      const c = findCampaign(opportunityId);
      const step = c?.steps.find((st) => st.kind === stepKind);
      if (!c || !step || step.status !== "pending") return;

      step.status = action === "skip" ? "skipped" : "done";
      step.at =
        action === "skip"
          ? "Skipped by you"
          : action === "edit"
            ? "Edited & approved by you"
            : "Approved by you";
      if (draft !== undefined) step.draft = draft;

      // Mimic the label n8n would write once nothing is waiting on the user.
      const o = findOpp(opportunityId);
      if (o && !c.steps.some((st) => st.status === "pending")) {
        o.campaignState = "With Pursuit · next step scheduled";
      }
    },

    async getWeek() {
      return structuredClone(SEED_WEEK);
    },
  };
}
