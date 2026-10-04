// Picks the data + auth backend. Defaults to mock so the app runs without
// Supabase. Switch with NEXT_PUBLIC_DATA_MODE=supabase.
export type DataMode = "mock" | "supabase";

export const DATA_MODE: DataMode =
  process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "mock";

export const MOCK_USER_COOKIE = "pursuit_mock_user";
