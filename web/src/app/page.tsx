import { redirect } from "next/navigation";
import { getData } from "@/lib/data";

// Entry point after sign-in: new users go through onboarding first.
export default async function Home() {
  const db = await getData();
  const profile = await db.getProfile();
  redirect(profile.onboarded ? "/dashboard" : "/onboarding");
}
