import "server-only";
import { cookies } from "next/headers";
import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";
import { DATA_MODE, MOCK_USER_COOKIE } from "./data/mode";

export interface AppUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
}

function toUser(id: string, name: string, email: string): AppUser {
  const n = name.trim() || email.split("@")[0];
  return { id, name: n, firstName: n.split(" ")[0], email };
}

export function encodeMockUser(name: string, email: string) {
  return encodeURIComponent(JSON.stringify({ name, email }));
}

async function getMockUser(): Promise<AppUser | null> {
  const raw = (await cookies()).get(MOCK_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const { name, email } = JSON.parse(decodeURIComponent(raw));
    if (typeof email !== "string" || !email) return null;
    return toUser(`mock:${email.toLowerCase()}`, String(name ?? ""), email);
  } catch {
    return null;
  }
}

async function getSupabaseUser(): Promise<AppUser | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return toUser(user.id, meta.name || meta.full_name || "", user.email ?? "");
}

export function getUser(): Promise<AppUser | null> {
  return DATA_MODE === "mock" ? getMockUser() : getSupabaseUser();
}
