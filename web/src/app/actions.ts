"use server";

import { revalidatePath } from "next/cache";
import { getData } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { forwardDecision } from "@/lib/n8n";
import type { MatchStatus, ProfileInput, StepAction, StepKind } from "@/lib/types";

// Thin wrappers: store the user's decision through the data layer, tell n8n,
// refresh the UI. No eligibility or campaign logic lives here.

export interface ActionResult {
  ok: boolean;
  message: string;
}

const refresh = () => revalidatePath("/", "layout");

const noteFor = (r: { ok: boolean; demo: boolean }) =>
  !r.ok
    ? "Saved here, but n8n couldn't be reached."
    : r.demo
      ? "Saved. Demo mode: no n8n webhook configured."
      : "Saved and sent to n8n.";

export async function resolveStepAction(
  opportunityId: string,
  stepKind: StepKind,
  action: StepAction,
  draft?: string,
): Promise<ActionResult> {
  const db = await getData();
  await db.resolveStep(opportunityId, stepKind, action, draft);
  const user = await getUser();
  const r = await forwardDecision({
    type: "step",
    opportunityId,
    stepKind,
    action,
    draft,
    userEmail: user?.email ?? "",
  });
  refresh();
  return { ok: true, message: noteFor(r) };
}

export async function answerQuestionAction(
  opportunityId: string,
  questionId: string,
  answer: string,
): Promise<ActionResult> {
  const trimmed = answer.trim();
  if (!trimmed) return { ok: false, message: "Type an answer first." };
  const db = await getData();
  await db.answerQuestion(opportunityId, questionId, trimmed);
  const user = await getUser();
  const r = await forwardDecision({
    type: "answer",
    opportunityId,
    questionId,
    answer: trimmed,
    userEmail: user?.email ?? "",
  });
  refresh();
  return { ok: true, message: noteFor(r) };
}

export async function setStatusAction(opportunityId: string, status: MatchStatus) {
  const db = await getData();
  await db.setOpportunityStatus(opportunityId, status);
  refresh();
}

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const clean: ProfileInput = {
    year: input.year.trim(),
    branch: input.branch.trim(),
    location: input.location.trim(),
    skills: [...new Set(input.skills.map((s) => s.trim()).filter(Boolean))],
    documents: [...new Set(input.documents)],
  };
  const db = await getData();
  await db.updateProfile(clean);
  refresh();
  return { ok: true, message: "Profile saved." };
}
