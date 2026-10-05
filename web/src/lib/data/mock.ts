import "server-only";
import type { Activity, Campaign, Opportunity, Profile, Source } from "@/lib/types";
import type { DataStore } from "./types";
import {
  SEED_ACTIVITY,
  SEED_CAMPAIGNS,
  SEED_OPPORTUNITIES,
  SEED_RECENTLY_VIEWED,
  SEED_SOURCES,
  type SeedOpportunity,
} from "./seed";

// In-memory, per-user state on the server. It resets when the dev server
// restarts. It stands in for what n8n + Supabase will hold, so mutations only
// record the user's choice; they never re-run eligibility or ranking.
interface UserState {
  profile: Profile;
  sources: Source[];
  opportunities: SeedOpportunity[];
  campaigns: Campaign[];
  activity: Activity[];
  recentlyViewed: string[];
}

const globalStore = globalThis as unknown as {
  __pursuitMockV2?: Map<string, UserState>;
};
const users = (globalStore.__pursuitMockV2 ??= new Map());

function stateFor(user: { name: string; email: string }): UserState {
  const key = user.email.toLowerCase();
  let state = users.get(key);
  if (!state) {
    state = {
      profile: {
        name: user.name,
        email: user.email,
        location: "",
        citizenship: "",
        level: "",
        field: "",
        college: "",
        gpa: "",
        skills: [],
        interests: [],
        documents: [],
        notifyDigest: true,
        notifyReminders: true,
        onboarded: false,
      },
      sources: structuredClone(SEED_SOURCES),
      opportunities: structuredClone(SEED_OPPORTUNITIES),
      campaigns: structuredClone(SEED_CAMPAIGNS),
      activity: structuredClone(SEED_ACTIVITY),
      recentlyViewed: [...SEED_RECENTLY_VIEWED],
    };
    users.set(key, state);
  }
  return state;
}

const defined = <T extends object>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;

const nowLabel = () =>
  "Today " +
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

export function createMockStore(user: { name: string; email: string }): DataStore {
  const s = stateFor(user);
  const findOpp = (id: string) => s.opportunities.find((o) => o.id === id);
  const findCampaign = (id: string) => s.campaigns.find((c) => c.opportunityId === id);

  function view(o: SeedOpportunity): Opportunity {
    const { sourceId, requiredDocuments, ...rest } = o;
    const source = s.sources.find((x) => x.id === sourceId) ??
      SEED_SOURCES.find((x) => x.id === sourceId) ?? {
        id: sourceId,
        name: "Removed source",
        kind: "manual" as const,
        url: null,
        status: "broken" as const,
        lastChecked: "—",
        isPublic: false,
        enabled: false,
      };
    return structuredClone({
      ...rest,
      source,
      documents: requiredDocuments.map((name) => ({
        name,
        onHand: s.profile.documents.includes(name),
      })),
    });
  }

  function log(kind: Activity["kind"], text: string, href: string | null) {
    s.activity.unshift({ id: crypto.randomUUID(), kind, at: nowLabel(), text, href });
  }

  return {
    async getProfile() {
      return structuredClone(s.profile);
    },
    async updateProfile(input) {
      s.profile = { ...s.profile, ...defined(input) };
    },
    async completeOnboarding(input) {
      s.profile = { ...s.profile, ...defined(input), onboarded: true };
    },

    async listSources() {
      return structuredClone(s.sources);
    },
    async setSourceEnabled(id, enabled) {
      const src = s.sources.find((x) => x.id === id);
      if (src?.isPublic) src.enabled = enabled;
    },
    async addSource(url) {
      let validUrl = url.trim();
      if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
        validUrl = "https://" + validUrl;
      }
      const u = new URL(validUrl);
      const host = u.host.replace(/^www\./, "");
      const path = u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "";
      s.sources.push({
        id: `src-${crypto.randomUUID().slice(0, 8)}`,
        name: host + path,
        kind: "web",
        url: validUrl,
        status: "healthy",
        lastChecked: "Just now",
        isPublic: false,
        enabled: true,
      });
      log("scan", `Added ${host} as a source · scanned and healthy`, "/sources");
    },
    async deleteSource(id) {
      s.sources = s.sources.filter((x) => x.id !== id);
    },
    async retestSource(id) {
      const src = s.sources.find((x) => x.id === id);
      if (!src) return;
      src.status = "healthy";
      src.lastChecked = "Just now";
      log("scan", `Retested ${src.name} · connection healthy`, "/sources");
    },

    async listOpportunities() {
      return s.opportunities.map(view);
    },
    async getOpportunity(id) {
      const o = findOpp(id);
      return o ? view(o) : null;
    },
    async setOpportunityStatus(id, status) {
      const o = findOpp(id);
      if (o) o.status = status;
    },
    async answerQuestion(opportunityId, questionId, answer) {
      const q = findOpp(opportunityId)?.questions.find((q) => q.id === questionId);
      if (q) q.answer = answer;
    },
    async recordView(opportunityId) {
      if (!findOpp(opportunityId)) return;
      s.recentlyViewed = [opportunityId, ...s.recentlyViewed.filter((x) => x !== opportunityId)].slice(0, 20);
    },
    async listRecentlyViewed(limit) {
      return s.recentlyViewed
        .slice(0, limit)
        .flatMap((id) => {
          const o = findOpp(id);
          return o ? [view(o)] : [];
        });
    },

    async listCampaigns() {
      return s.campaigns.flatMap((campaign) => {
        const o = findOpp(campaign.opportunityId);
        return o ? [{ opportunity: view(o), campaign: structuredClone(campaign) }] : [];
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
          .map((step) => ({ opportunity: view(o), step: structuredClone(step) }));
      });
    },
    async resolveStep(opportunityId, stepKind, action, draft) {
      const c = findCampaign(opportunityId);
      const step = c?.steps.find((st) => st.kind === stepKind);
      const o = findOpp(opportunityId);
      if (!c || !step || !o || step.status !== "pending") return;

      step.status = action === "skip" ? "skipped" : "done";
      step.at =
        action === "skip"
          ? "Skipped by you"
          : action === "edit"
            ? "Edited & approved by you"
            : "Approved by you";
      if (draft !== undefined) step.draft = draft;

      if (action !== "skip") {
        log("sent", `Queued “${step.title}” for ${o.title} after your approval`, `/campaign/${o.id}`);
      }
      // Mimic the label n8n would write once nothing is waiting on the user.
      if (!c.steps.some((st) => st.status === "pending")) {
        o.campaignState = "With Pursuit · next step scheduled";
      }
    },

    async listActivity(limit) {
      return structuredClone(s.activity.slice(0, limit));
    },
  };
}
