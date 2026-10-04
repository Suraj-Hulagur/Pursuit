// The UI never decides anything itself. It forwards the human's input to n8n,
// which owns what happens next. With no webhook set, calls are skipped and
// the result says so (demo mode).
import type { StepAction } from "./types";

export interface WebhookResult {
  ok: boolean;
  demo: boolean;
}

export type DecisionPayload =
  | {
      type: "step";
      opportunityId: string;
      stepKind: string;
      action: StepAction;
      draft?: string;
    }
  | { type: "answer"; opportunityId: string; questionId: string; answer: string };

// Called from server actions after the decision is stored.
export async function forwardDecision(
  payload: DecisionPayload & { userEmail: string },
): Promise<WebhookResult> {
  const url = process.env.NEXT_PUBLIC_N8N_APPROVAL_WEBHOOK;
  if (!url) return { ok: true, demo: true };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, demo: false };
  } catch {
    return { ok: false, demo: false };
  }
}

// ---------------------------------------------------------------- intake

// What the n8n "Pursuit · Intake" workflow returns. Extraction and quote
// verification happen in n8n; the app only displays this.
export interface IntakeClause {
  clause: string;
  summary: string;
  verbatim: boolean;
}

export interface IntakeExtraction {
  title: string;
  type: "scholarship" | "hackathon" | "internship" | "event" | "grant" | "other";
  org: string;
  deadline: string;
  deadlineText: string;
  reward: string;
  eligibility: IntakeClause[];
  documents: string[];
  isOpportunity: boolean;
}

export type IntakeResult =
  | { ok: true; executionId: string | null; sourceUrl: string | null; extracted: IntakeExtraction }
  | { ok: false; executionId: string | null; error: string; detail?: string | null };

// Server-only: reads a non-public env var so the webhook URL stays off the client.
export async function runIntake(input: { url?: string; text?: string }): Promise<IntakeResult> {
  const webhook = process.env.N8N_INTAKE_WEBHOOK;
  if (!webhook) {
    return { ok: false, executionId: null, error: "Intake isn't connected. Set N8N_INTAKE_WEBHOOK in web/.env.local." };
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(90_000),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as IntakeResult | null;
    if (body && typeof body === "object" && "ok" in body) return body;
    return { ok: false, executionId: null, error: `n8n returned HTTP ${res.status} without a result.` };
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    return {
      ok: false,
      executionId: null,
      error: timedOut ? "n8n took too long to respond (over 90s)." : "Couldn't reach n8n.",
    };
  }
}
