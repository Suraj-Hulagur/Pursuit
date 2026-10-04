import "server-only";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DATA_MODE } from "./mode";
import { createMockStore } from "./mock";
import { createSupabaseStore } from "./supabase";
import type { DataStore } from "./types";

export type { DataStore, CampaignSummary, PendingItem } from "./types";
export { DATA_MODE } from "./mode";

// Every page and server action gets data through here. The backend is picked
// by NEXT_PUBLIC_DATA_MODE (mock by default), always scoped to the signed-in user.
export async function getData(): Promise<DataStore> {
  const user = await getUser();
  if (!user) redirect("/login");

  if (DATA_MODE === "supabase") {
    return createSupabaseStore(await createClient(), user.id);
  }
  return createMockStore(user);
}
