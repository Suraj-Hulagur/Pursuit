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

// Called from the browser: files go straight to the n8n intake workflow.
export async function submitIntake(input: {
  link?: string;
  file?: File;
}): Promise<WebhookResult> {
  const url = process.env.NEXT_PUBLIC_N8N_INTAKE_WEBHOOK;
  if (!url) return { ok: true, demo: true };

  const body = new FormData();
  if (input.link) body.append("link", input.link);
  if (input.file) body.append("file", input.file);
  const res = await fetch(url, { method: "POST", body });
  return { ok: res.ok, demo: false };
}
