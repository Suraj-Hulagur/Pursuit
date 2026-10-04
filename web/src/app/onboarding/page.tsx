import { redirect } from "next/navigation";
import { getData } from "@/lib/data";
import { OnboardingFlow } from "./OnboardingFlow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const db = await getData();
  const profile = await db.getProfile();
  if (profile.onboarded) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl py-2 sm:py-6">
      <p className="eyebrow mb-3">Welcome to Pursuit</p>
      <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
        Tell your agent about you.
      </h1>
      <p className="mt-3 text-ink-soft">
        Pursuit checks every eligibility clause against this. You can change it any time in your profile.
      </p>
      <OnboardingFlow profile={profile} />
    </div>
  );
}
