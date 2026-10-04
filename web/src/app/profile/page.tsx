import { getData } from "@/lib/data";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const db = await getData();
  const profile = await db.getProfile();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-ink pb-4">
        <p className="eyebrow mb-2">What Pursuit checks clauses against</p>
        <h1 className="font-display text-5xl tracking-tight">Profile</h1>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
