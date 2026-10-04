import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";

export interface AppUser {
  name: string;
  firstName: string;
  email: string;
}

export async function getUser(): Promise<AppUser | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const name: string = meta.name || meta.full_name || email.split("@")[0];
  return { name, firstName: name.split(" ")[0], email };
}
