import { getUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getUser();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-ink pb-4">
        <p className="eyebrow mb-2">What Pursuit checks clauses against</p>
        <h1 className="font-display text-5xl tracking-tight">Profile</h1>
      </div>
      <ProfileForm name={user?.name ?? ""} email={user?.email ?? ""} />
    </div>
  );
}
