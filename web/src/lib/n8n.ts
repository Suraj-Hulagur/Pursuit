// The UI never decides anything itself. It forwards the human's choice to the
// n8n campaign runner, which owns what happens next.
export type StepAction = "approve" | "edit" | "skip";

export interface StepActionPayload {
  opportunityId: string;
  stepKind: string;
  action: StepAction;
  draft?: string;
}

export async function sendStepAction(
  payload: StepActionPayload,
): Promise<{ ok: boolean; demo: boolean }> {
  const url = process.env.NEXT_PUBLIC_N8N_APPROVAL_WEBHOOK;
  if (!url) return { ok: true, demo: true };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, demo: false };
}
