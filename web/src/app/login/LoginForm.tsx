"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

const inputCls =
  "h-11 w-full rounded-sm border border-rule bg-paper px-3 text-base outline-none transition-colors focus:border-ink";

export function LoginForm({
  googleEnabled,
  initialError,
}: {
  googleEnabled: boolean;
  initialError: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.replace("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (data.session) {
      // Email confirmation is off in Supabase, so we're already signed in.
      router.replace("/");
      router.refresh();
    } else {
      setInfo(`Check ${email} for a confirmation link, then come back and sign in.`);
      setMode("signin");
    }
  }

  async function onGoogle() {
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="rounded-sm border border-ink bg-card shadow-[4px_4px_0_0_var(--ink)]">
      <div className="grid grid-cols-2 border-b border-ink" role="tablist">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`h-12 text-sm font-medium transition-colors ${
              mode === m ? "bg-ink text-card" : "hover:bg-paper-deep"
            }`}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-6">
        {mode === "signup" && (
          <label className="block">
            <span className="eyebrow mb-1.5 block">Full name</span>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>
        )}
        <label className="block">
          <span className="eyebrow mb-1.5 block">Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-1.5 block">Password</span>
          <input
            required
            type="password"
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-signal">
            {error}
          </p>
        )}
        {info && (
          <p role="status" className="text-sm text-go">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-full bg-ink font-medium text-card transition-colors hover:bg-signal disabled:opacity-50"
        >
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        {googleEnabled && (
          <>
            <div className="flex items-center gap-3 font-mono text-[0.7rem] text-ink-soft">
              <span className="h-px flex-1 bg-rule" />
              OR
              <span className="h-px flex-1 bg-rule" />
            </div>
            <button
              type="button"
              onClick={onGoogle}
              className="h-11 w-full rounded-full border border-ink font-medium transition-colors hover:bg-paper-deep"
            >
              Continue with Google
            </button>
          </>
        )}
      </form>
    </div>
  );
}
