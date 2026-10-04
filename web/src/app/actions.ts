"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getData } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { forwardDecision, runIntake, type IntakeResult } from "@/lib/n8n";
import type { MatchStatus, ProfileInput, StepAction, StepKind } from "@/lib/types";

// Thin wrappers: store the user's decision through the data layer, tell n8n,
// refresh the UI. No eligibility, ranking or campaign logic lives here.

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

function cleanProfile(input: ProfileInput): ProfileInput {
  const tags = (xs?: string[]) =>
    xs === undefined ? undefined : [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
  const text = (v?: string) => (v === undefined ? undefined : v.trim());
  const out: ProfileInput = {
    name: text(input.name),
    location: text(input.location),
    citizenship: text(input.citizenship),
    level: text(input.level),
    field: text(input.field),
    college: text(input.college),
    gpa: text(input.gpa),
    skills: tags(input.skills),
    interests: tags(input.interests),
    documents: input.documents === undefined ? undefined : [...new Set(input.documents)],
    notifyDigest: input.notifyDigest,
    notifyReminders: input.notifyReminders,
  };
  // Only send fields the caller provided, so partial updates don't blank others.
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as ProfileInput;
}

// ---------------------------------------------------------------- campaigns

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

// ---------------------------------------------------------------- opportunities

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

// ---------------------------------------------------------------- profile

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const clean = cleanProfile(input);
  if (clean.name !== undefined && !clean.name) return { ok: false, message: "Name can't be empty." };
  const db = await getData();
  await db.updateProfile(clean);
  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function completeOnboardingAction(input: ProfileInput): Promise<ActionResult> {
  const clean = cleanProfile(input);
  if (!clean.name) return { ok: false, message: "Enter your name." };
  const db = await getData();
  await db.completeOnboarding(clean);
  refresh();
  redirect("/opportunities");
}

// ---------------------------------------------------------------- sources

export async function setSourceEnabledAction(id: string, enabled: boolean) {
  const db = await getData();
  await db.setSourceEnabled(id, enabled);
  refresh();
}

export async function addSourceAction(url: string): Promise<ActionResult> {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return { ok: false, message: "That doesn't look like a URL. Include https://" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, message: "Only http and https links can be added." };
  }
  const db = await getData();
  await db.addSource(parsed.toString());
  refresh();
  return { ok: true, message: "Added. Pursuit will run the first scan shortly." };
}

export async function deleteSourceAction(id: string) {
  const db = await getData();
  await db.deleteSource(id);
  refresh();
}

export async function retestSourceAction(id: string) {
  const db = await getData();
  await db.retestSource(id);
  refresh();
}

// ---------------------------------------------------------------- intake

// Sends a link or pasted text to the n8n Intake workflow and returns what it
// extracted. Nothing is saved yet; the dashboard just shows the result.
export async function checkOpportunityAction(input: string): Promise<IntakeResult> {
  await getData(); // signed-in users only
  const value = input.trim();
  if (!value) return { ok: false, executionId: null, error: "Paste a link or some text first." };
  if (value.length > 40_000) return { ok: false, executionId: null, error: "That's too long. Paste under 40,000 characters." };

  let url: URL | null = null;
  try {
    url = new URL(value);
  } catch {
    url = null;
  }
  if (url && url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, executionId: null, error: "Only http and https links can be checked." };
  }
  return runIntake(url ? { url: url.toString() } : { text: value });
}
