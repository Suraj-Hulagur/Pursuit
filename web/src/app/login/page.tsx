import { googleAuthEnabled, supabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto grid max-w-5xl gap-12 py-4 md:grid-cols-[1fr_24rem] md:items-center md:py-12">
      <div>
        <p className="eyebrow mb-4">Your talent agent</p>
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
          Opportunities you qualify for,{" "}
          <em className="text-signal">with proof.</em>
        </h1>
        <p className="mt-5 max-w-md text-ink-soft">
          Pursuit finds scholarships, internships, hackathons and grants, quotes
          the exact clause that makes you eligible, and runs each application
          with your approval.
        </p>
      </div>

      {supabaseConfigured ? (
        <LoginForm
          googleEnabled={googleAuthEnabled}
          initialError={error === "auth" ? "That link didn't work. Try signing in again." : null}
        />
      ) : (
        <div className="rounded-sm border border-ink bg-card p-6 shadow-[4px_4px_0_0_var(--ink)]">
          <p className="eyebrow mb-2 !text-signal">Setup needed</p>
          <h2 className="font-display text-2xl">Supabase isn&apos;t connected yet</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
            <li>
              Copy <code className="font-mono text-ink">web/.env.example</code> to{" "}
              <code className="font-mono text-ink">web/.env.local</code>.
            </li>
            <li>Paste your Supabase Project URL and anon key.</li>
            <li>Restart <code className="font-mono text-ink">npm run dev</code>.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
