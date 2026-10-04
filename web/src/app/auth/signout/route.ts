import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DATA_MODE, MOCK_USER_COOKIE } from "@/lib/data/mode";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  if (DATA_MODE === "mock") {
    response.cookies.delete(MOCK_USER_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return response;
}
