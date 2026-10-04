"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { ClarifyingQuestion } from "@/lib/types";
import { answerQuestionAction } from "@/app/actions";

// Clarifying questions n8n asked to settle an "unclear" verdict. Answers are
// sent back for n8n to re-check; the UI never changes the verdict itself.
export function Questions({
  opportunityId,
  questions,
}: {
  opportunityId: string;
  questions: ClarifyingQuestion[];
}) {
  if (questions.length === 0) return null;
  return (
    <div className="mt-4 rounded-sm bg-maybe-tint/60 p-3">
      <p className="eyebrow mb-2 !text-maybe">Pursuit needs to know</p>
      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id}>
            <QuestionRow opportunityId={opportunityId} q={q} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionRow({ opportunityId, q }: { opportunityId: string; q: ClarifyingQuestion }) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (q.answer !== null) {
    return (
      <div className="text-sm">
        <p className="text-ink-soft">{q.question}</p>
        <p className="mt-0.5 font-medium">
          <span className="text-go">✓</span> {q.answer}
        </p>
        <p className="mt-0.5 font-mono text-[0.72rem] text-ink-soft">
          {note ?? "Answered. Pursuit will re-check this verdict."}
        </p>
      </div>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await answerQuestionAction(opportunityId, q.id, value);
      setNote(r.message);
    });
  }

  return (
    <form onSubmit={onSubmit} className="text-sm">
      <label htmlFor={`${opportunityId}-${q.id}`} className="block">
        {q.question}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${opportunityId}-${q.id}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 min-w-0 flex-1 rounded-sm border border-rule bg-card px-3 text-base outline-none focus:border-ink"
        />
        <button
          disabled={pending || !value.trim()}
          className="h-10 shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-card transition-colors hover:bg-signal-ink disabled:opacity-40"
        >
          {pending ? "…" : "Answer"}
        </button>
      </div>
      {note && <p className="mt-1 font-mono text-[0.72rem] text-signal-ink">{note}</p>}
    </form>
  );
}
