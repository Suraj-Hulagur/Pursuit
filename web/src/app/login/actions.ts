"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encodeMockUser } from "@/lib/auth";
import { DATA_MODE, MOCK_USER_COOKIE } from "@/lib/data/mode";

export async function mockSignIn(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  if (DATA_MODE !== "mock") return "Mock sign-in is only available in mock mode.";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!name) return "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";

  (await cookies()).set(MOCK_USER_COOKIE, encodeMockUser(name, email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
