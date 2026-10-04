import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Campaign,
  CampaignStep,
  ClarifyingQuestion,
  Opportunity,
  Source,
} from "@/lib/types";
import type { DataStore } from "./types";
import { SEED_WEEK } from "./seed";

// Reads and writes the tables in db/schema.sql as the signed-in user.
// RLS limits every query to that user's rows. Writes are limited to what the
// user decides; n8n (service role) owns verdicts and campaign progress.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const MATCH_SELECT =
  "verdict, clause, clause_source, missing, reasoning, rank, fit, status, questions, found_at," +
  " opportunity:opportunities(*, source:sources(*))";

function toSource(r: Row | null): Source {
  return r
    ? { id: r.id, name: r.name, kind: r.kind, url: r.url }
    : { id: "unknown", name: "Unknown source", kind: "manual", url: null };
}

function toOpportunity(m: Row, campaignState: string | null): Opportunity {
  const o = m.opportunity;
  return {
    id: o.id,
    title: o.title,
    org: o.org,
    type: o.type,
    deadline: o.deadline,
    reward: o.reward,
    rewardScore: o.reward_score,
    effortHours: o.effort_hours,
    effortScore: o.effort_score,
    source: toSource(o.source),
    foundAt: new Date(m.found_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    verdict: m.verdict,
    clause: m.clause,
    clauseSource: m.clause_source,
    missing: m.missing ?? [],
    reasoning: m.reasoning,
    rank: m.rank,
    fit: m.fit,
    campaignState,
    status: m.status,
    questions: (m.questions ?? []) as ClarifyingQuestion[],
  };
}

function toStep(e: Row, awaitingN8n: boolean): CampaignStep {
  return {
    kind: e.kind,
    // Once the user has decided, show it as handed off until n8n updates it.
    status: awaitingN8n ? "done" : e.status,
    at: awaitingN8n ? "Sent to Pursuit" : e.at_label,
    title: e.title,
    detail: e.detail,
    draft: e.draft ?? undefined,
  };
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

export function createSupabaseStore(supabase: SupabaseClient, userId: string): DataStore {
  async function campaignStates(): Promise<Map<string, string | null>> {
    const rows = check(await supabase.from("campaigns").select("opportunity_id, state_label")) as Row[];
    return new Map(rows.map((r) => [r.opportunity_id, r.state_label]));
  }

  async function decidedEventIds(): Promise<Set<string>> {
    const rows = check(
      await supabase.from("approvals").select("campaign_event_id").is("processed_at", null),
    ) as Row[];
    return new Set(rows.map((r) => r.campaign_event_id));
  }

  async function loadCampaign(opportunityId: string): Promise<Campaign | null> {
    const res = await supabase
      .from("campaigns")
      .select("id, campaign_events(*)")
      .eq("opportunity_id", opportunityId)
      .maybeSingle();
    const c = check(res) as Row | null;
    if (!c) return null;
    const decided = await decidedEventIds();
    const events = [...(c.campaign_events as Row[])].sort((a, b) => a.position - b.position);
    return {
      opportunityId,
      steps: events.map((e) => toStep(e, e.status === "pending" && decided.has(e.id))),
    };
  }

  const store: DataStore = {
    async getProfile() {
      const p = check(
        await supabase.from("profiles").select("*").eq("id", userId).single(),
      ) as Row;
      return {
        name: p.name,
        email: p.email,
        year: p.year,
        branch: p.branch,
        location: p.location,
        skills: p.skills ?? [],
        documents: p.documents ?? [],
      };
    },
    async updateProfile(input) {
      check(await supabase.from("profiles").update(input).eq("id", userId));
    },

    async listSources() {
      const rows = check(await supabase.from("sources").select("*").order("name")) as Row[];
      return rows.map(toSource);
    },
    async listOpportunities() {
      const [rows, states] = await Promise.all([
        supabase.from("matches").select(MATCH_SELECT).then((r) => check(r) as unknown as Row[]),
        campaignStates(),
      ]);
      return rows.map((m) => toOpportunity(m, states.get(m.opportunity.id) ?? null));
    },
    async getOpportunity(id) {
      const m = check(
        await supabase.from("matches").select(MATCH_SELECT).eq("opportunity_id", id).maybeSingle(),
      ) as unknown as Row | null;
      if (!m) return null;
      const states = await campaignStates();
      return toOpportunity(m, states.get(id) ?? null);
    },
    async setOpportunityStatus(id, status) {
      check(await supabase.from("matches").update({ status }).eq("opportunity_id", id));
    },
    async answerQuestion(opportunityId, questionId, answer) {
      const m = check(
        await supabase.from("matches").select("questions").eq("opportunity_id", opportunityId).single(),
      ) as Row;
      const questions = (m.questions as ClarifyingQuestion[]).map((q) =>
        q.id === questionId ? { ...q, answer } : q,
      );
      check(await supabase.from("matches").update({ questions }).eq("opportunity_id", opportunityId));
    },

    async listCampaigns() {
      const rows = check(await supabase.from("campaigns").select("opportunity_id")) as Row[];
      const out = await Promise.all(
        rows.map(async (r) => {
          const [opportunity, campaign] = await Promise.all([
            store.getOpportunity(r.opportunity_id),
            loadCampaign(r.opportunity_id),
          ]);
          return opportunity && campaign ? [{ opportunity, campaign }] : [];
        }),
      );
      return out.flat();
    },
    getCampaign: loadCampaign,
    async listPendingApprovals() {
      const [events, decided] = await Promise.all([
        supabase
          .from("campaign_events")
          .select("*, campaign:campaigns(opportunity_id)")
          .eq("status", "pending")
          .then((r) => check(r) as Row[]),
        decidedEventIds(),
      ]);
      const open = events.filter((e) => !decided.has(e.id));
      const opps = await Promise.all(
        open.map((e) => store.getOpportunity(e.campaign.opportunity_id)),
      );
      return open.flatMap((e, i) => {
        const opportunity = opps[i];
        return opportunity ? [{ opportunity, step: toStep(e, false) }] : [];
      });
    },
    async resolveStep(opportunityId, stepKind, action, draft) {
      const c = check(
        await supabase
          .from("campaigns")
          .select("id, campaign_events(id, kind)")
          .eq("opportunity_id", opportunityId)
          .single(),
      ) as Row;
      const event = (c.campaign_events as Row[]).find((e) => e.kind === stepKind);
      if (!event) throw new Error(`No ${stepKind} step for ${opportunityId}`);
      check(
        await supabase.from("approvals").insert({
          user_id: userId,
          campaign_event_id: event.id,
          action,
          draft: draft ?? null,
        }),
      );
    },

    async getWeek() {
      // Calendar isn't connected yet; the UI labels this as sample.
      return SEED_WEEK;
    },
  };
  return store;
}
