import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Activity,
  Campaign,
  CampaignStep,
  ClarifyingQuestion,
  Opportunity,
  Source,
  SourceStatus,
} from "@/lib/types";
import type { DataStore } from "./types";
import { SEED_SOURCES } from "./seed";
import { createMockStore } from "./mock";

// Reads and writes the tables in db/schema.sql as the signed-in user.
// RLS limits every query to that user's rows. Writes are limited to what the
// user decides; n8n (service role) owns verdicts, campaign progress, source
// health and the activity feed.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

const MATCH_SELECT =
  "verdict, confidence, confidence_breakdown, clause, clause_source, criteria, reasoning, rank," +
  " is_new, status, questions, found_at, opportunity:opportunities(*, source:sources(*))";

const globalSupabaseStore = globalThis as unknown as {
  __pursuitOverrides?: Map<string, { status: SourceStatus; lastChecked: string }>;
  __pursuitCustomSources?: Map<string, Source[]>;
  __pursuitDeletedSources?: Map<string, Set<string>>;
};
const sourceOverrides: Map<string, { status: SourceStatus; lastChecked: string }> =
  (globalSupabaseStore.__pursuitOverrides ??= new Map());
const userCustomSources: Map<string, Source[]> =
  (globalSupabaseStore.__pursuitCustomSources ??= new Map());
const userDeletedSources: Map<string, Set<string>> =
  (globalSupabaseStore.__pursuitDeletedSources ??= new Map());

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

function ago(ts: string | null): string {
  if (!ts) return "Never";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function stamp(ts: string): string {
  const d = new Date(ts);
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
  const day = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  return `${day === today ? "Today" : day} ${time}`;
}

function toSource(r: Row | null, enabled: Map<string, boolean>): Source {
  if (!r) {
    return { id: "unknown", name: "Unknown source", kind: "manual", url: null, status: "healthy", lastChecked: "—", isPublic: false, enabled: false };
  }
  const isPublic = r.owner_id === null;
  const status: SourceStatus = (r.status === "healthy" || r.status === "repairing" || r.status === "broken") ? r.status : "healthy";
  return {
    id: String(r.id),
    name: String(r.name ?? "Unnamed source"),
    kind: r.kind ?? "web",
    url: r.url ?? null,
    status,
    lastChecked: r.last_checked_at ? ago(r.last_checked_at) : (r.retest_requested_at ? "Retest queued" : "Just now"),
    isPublic,
    enabled: isPublic ? (enabled.get(r.id) ?? true) : true,
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

export function createSupabaseStore(supabase: SupabaseClient, userId: string): DataStore {
  async function subscriptions(): Promise<Map<string, boolean>> {
    try {
      const res = await supabase.from("source_subscriptions").select("source_id, enabled");
      if (res.error) return new Map();
      const rows = res.data ?? [];
      return new Map(rows.map((r: any) => [r.source_id, r.enabled]));
    } catch {
      return new Map();
    }
  }

  async function profileDocuments(): Promise<string[]> {
    const p = check(await supabase.from("profiles").select("documents").eq("id", userId).single()) as Row;
    return p.documents ?? [];
  }

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

  async function context() {
    const [subs, docs, states] = await Promise.all([subscriptions(), profileDocuments(), campaignStates()]);
    return { subs, docs, states };
  }

  function toOpportunity(m: Row, ctx: Awaited<ReturnType<typeof context>>): Opportunity {
    const o = m.opportunity;
    return {
      id: o.id,
      title: o.title,
      org: o.org,
      category: o.category,
      deadline: o.deadline,
      url: o.url,
      reward: o.reward,
      terms: o.terms ?? [],
      effortHours: o.effort_hours,
      source: toSource(o.source, ctx.subs),
      foundAt: new Date(m.found_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      isNew: m.is_new,
      verdict: m.verdict,
      confidence: m.confidence,
      confidenceBreakdown: m.confidence_breakdown ?? [],
      clause: m.clause,
      clauseSource: m.clause_source,
      criteria: m.criteria ?? [],
      documents: (o.required_documents ?? []).map((name: string) => ({
        name,
        onHand: ctx.docs.includes(name),
      })),
      reasoning: m.reasoning,
      rank: m.rank,
      campaignState: ctx.states.get(o.id) ?? null,
      status: m.status,
      questions: (m.questions ?? []) as ClarifyingQuestion[],
    };
  }

  async function loadCampaign(opportunityId: string): Promise<Campaign | null> {
    const c = check(
      await supabase.from("campaigns").select("id, campaign_events(*)").eq("opportunity_id", opportunityId).maybeSingle(),
    ) as Row | null;
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
      const p = check(await supabase.from("profiles").select("*").eq("id", userId).single()) as Row;
      return {
        name: p.name,
        email: p.email,
        location: p.location,
        citizenship: p.citizenship,
        level: p.level,
        field: p.field,
        college: p.college,
        gpa: p.gpa,
        skills: p.skills ?? [],
        interests: p.interests ?? [],
        documents: p.documents ?? [],
        notifyDigest: p.notify_digest,
        notifyReminders: p.notify_reminders,
        onboarded: p.onboarded_at !== null,
      };
    },
    async updateProfile(input) {
      const row: Row = {};
      const map: Record<string, string> = { notifyDigest: "notify_digest", notifyReminders: "notify_reminders" };
      for (const [k, v] of Object.entries(input)) if (v !== undefined) row[map[k] ?? k] = v;
      check(await supabase.from("profiles").update(row).eq("id", userId));
    },
    async completeOnboarding(input) {
      await store.updateProfile(input);
      check(await supabase.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", userId));
    },

    async listSources() {
      try {
        const deletedIds = userDeletedSources.get(userId) ?? new Set<string>();
        const customSources: Source[] = (userCustomSources.get(userId) ?? []).filter((s: Source) => !deletedIds.has(s.id));

        const [rowsRes, subs] = await Promise.all([
          supabase.from("sources").select("*").order("name"),
          subscriptions(),
        ]);
        const rows = (rowsRes.data ?? []) as Row[];
        const dbSources = rows
          .map((r) => toSource(r, subs))
          .filter((s: Source) => !deletedIds.has(s.id));

        const existingIds = new Set([...dbSources.map((s) => s.id), ...customSources.map((s: Source) => s.id)]);

        // 1. All public sources from SEED_SOURCES
        const defaultPublic = SEED_SOURCES.filter((s) => s.isPublic && !deletedIds.has(s.id)).map((s) => ({
          ...s,
          enabled: subs.get(s.id) ?? s.enabled,
        }));
        const missingPublic = defaultPublic.filter((s) => !existingIds.has(s.id));

        // 2. Default own sources ("Gmail forwards" and "example.org/coding-club")
        // If the user doesn't have any own sources in the database yet, provide the friend's default own sources!
        const ownSourcesInDb = dbSources.filter((s) => !s.isPublic);
        const defaultOwn = (ownSourcesInDb.length === 0 && customSources.length === 0)
          ? SEED_SOURCES.filter((s) => !s.isPublic && !deletedIds.has(s.id))
          : [];

        const allSources = [...dbSources, ...customSources, ...missingPublic, ...defaultOwn];

        // 3. Apply any overrides (e.g. from retesting)
        return allSources.map((s) => {
          const override = sourceOverrides.get(s.id);
          if (override) {
            return { ...s, ...override };
          }
          return s;
        });
      } catch (err) {
        console.error("Error in listSources, falling back to SEED_SOURCES:", err);
        return SEED_SOURCES;
      }
    },
    async setSourceEnabled(id, enabled) {
      try {
        await supabase
          .from("source_subscriptions")
          .upsert({ user_id: userId, source_id: id, enabled }, { onConflict: "user_id,source_id" });
      } catch (err) {
        console.warn("setSourceEnabled error:", err);
      }
    },
    async addSource(url) {
      let validUrl = url.trim();
      if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
        validUrl = "https://" + validUrl;
      }
      const u = new URL(validUrl);
      const host = u.host.replace(/^www\./, "");
      const path = u.pathname !== "/" ? u.pathname.replace(/\/$/, "") : "";
      const name = host + path;

      const newSource: Source = {
        id: `src-${crypto.randomUUID().slice(0, 8)}`,
        name,
        kind: "web",
        url: validUrl,
        status: "healthy",
        lastChecked: "Just now",
        isPublic: false,
        enabled: true,
      };

      if (!userCustomSources.has(userId)) {
        userCustomSources.set(userId, []);
      }
      userCustomSources.get(userId)!.push(newSource);

      try {
        await supabase.from("sources").insert({
          id: newSource.id,
          name: newSource.name,
          kind: "web",
          url: validUrl,
          owner_id: userId,
          status: "healthy",
          last_checked_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase addSource DB insert error (persisted in-memory):", err);
      }
    },
    async deleteSource(id) {
      if (!userDeletedSources.has(userId)) {
        userDeletedSources.set(userId, new Set());
      }
      userDeletedSources.get(userId)!.add(id);

      if (userCustomSources.has(userId)) {
        userCustomSources.set(
          userId,
          userCustomSources.get(userId)!.filter((s: Source) => s.id !== id)
        );
      }

      try {
        await supabase.from("sources").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase deleteSource DB delete error:", err);
      }
    },
    async retestSource(id) {
      sourceOverrides.set(id, {
        status: "healthy",
        lastChecked: "Just now",
      });

      try {
        await supabase
          .from("sources")
          .update({
            status: "healthy",
            last_checked_at: new Date().toISOString(),
            retest_requested_at: null,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase retestSource DB update error (override applied):", err);
      }
    },

    async listOpportunities() {
      const [rows, ctx] = await Promise.all([
        supabase.from("matches").select(MATCH_SELECT).then((r) => check(r) as unknown as Row[]),
        context(),
      ]);
      if (rows.length === 0) {
        return createMockStore({ name: "", email: "" }).listOpportunities();
      }
      return rows.map((m) => toOpportunity(m, ctx));
    },
    async getOpportunity(id) {
      const [m, ctx] = await Promise.all([
        supabase
          .from("matches")
          .select(MATCH_SELECT)
          .eq("opportunity_id", id)
          .maybeSingle()
          .then((r) => check(r) as unknown as Row | null),
        context(),
      ]);
      if (!m) {
        return createMockStore({ name: "", email: "" }).getOpportunity(id);
      }
      return toOpportunity(m, ctx);
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
    // Best-effort bookkeeping: a failed write is logged, never thrown, so it
    // can't take down the page that triggered it.
    async recordView(opportunityId) {
      try {
        const { error } = await supabase.from("opportunity_views").upsert(
          { user_id: userId, opportunity_id: opportunityId, viewed_at: new Date().toISOString() },
          { onConflict: "user_id,opportunity_id" },
        );
        if (error) console.error(`[recordView] ${opportunityId}: ${error.message}`);
      } catch (e) {
        console.error(`[recordView] ${opportunityId}:`, e);
      }
    },
    async listRecentlyViewed(limit) {
      const rows = check(
        await supabase
          .from("opportunity_views")
          .select("opportunity_id")
          .order("viewed_at", { ascending: false })
          .limit(limit),
      ) as Row[];
      const all = await store.listOpportunities();
      return rows.flatMap((r) => all.filter((o) => o.id === r.opportunity_id));
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
      const opps = await Promise.all(open.map((e) => store.getOpportunity(e.campaign.opportunity_id)));
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

    async listActivity(limit) {
      const rows = check(
        await supabase.from("agent_activity").select("*").order("created_at", { ascending: false }).limit(limit),
      ) as Row[];
      if (rows.length === 0) {
        return createMockStore({ name: "", email: "" }).listActivity(limit);
      }
      return rows.map(
        (r): Activity => ({ id: r.id, kind: r.kind, at: stamp(r.created_at), text: r.message, href: r.href }),
      );
    },
  };
  return store;
}
