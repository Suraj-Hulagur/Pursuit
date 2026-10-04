"use client";

import { useActionState } from "react";
import { mockSignIn } from "./actions";

const inputCls =
  "h-11 w-full rounded-sm border border-rule bg-paper px-3 text-base outline-none transition-colors focus:border-ink";

export function MockLoginForm() {
  const [error, formAction, pending] = useActionState(mockSignIn, null);

  return (
    <div className="rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      <div className="flex items-center justify-between border-b border-ink px-6 py-3">
        <span className="text-sm font-medium">Sign in</span>
        <span className="rounded-full border border-dashed border-ink-soft px-2 py-0.5 font-mono text-[0.72rem] uppercase tracking-wider text-ink-soft">
          Mock mode
        </span>
      </div>
      <form action={formAction} className="space-y-4 p-6">
        <label className="block">
          <span className="eyebrow mb-1.5 block">Full name</span>
          <input name="name" required autoComplete="name" className={inputCls} />
        </label>
        <label className="block">
          <span className="eyebrow mb-1.5 block">Email</span>
          <input name="email" type="email" required autoComplete="email" className={inputCls} />
        </label>
        {error && (
          <p role="alert" className="text-sm text-urgent">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-full bg-ink font-medium text-card transition-colors hover:bg-signal-ink disabled:opacity-50"
        >
          {pending ? "One moment…" : "Continue"}
        </button>
        <p className="text-xs leading-relaxed text-ink-soft">
          No password needed in mock mode. Your name and email are kept in a cookie on this
          browser, and your data lives in server memory until the dev server restarts.
        </p>
      </form>
    </div>
  );
}
