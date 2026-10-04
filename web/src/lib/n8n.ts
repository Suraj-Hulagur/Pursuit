// The UI never decides anything itself. It forwards the human's input to n8n,
// which owns what happens next. With no webhook set, calls run in demo mode.
export type StepAction = "approve" | "edit" | "skip";

export interface StepActionPayload {
  opportunityId: string;
  stepKind: string;
  action: StepAction;
  draft?: string;
}

export interface WebhookResult {
  ok: boolean;
  demo: boolean;
}

export async function sendStepAction(
  payload: StepActionPayload,
): Promise<WebhookResult> {
  const url = process.env.NEXT_PUBLIC_N8N_APPROVAL_WEBHOOK;
  if (!url) return { ok: true, demo: true };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, demo: false };
}

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
