import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { getUser } from "@/lib/auth";
import { getData } from "@/lib/data";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Pursuit — your talent agent",
  description:
    "Finds opportunities, proves eligibility, and runs your applications with your approval.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();
  let header: { name: string; email: string } | null = null;
  let pendingCount = 0;
  if (user) {
    const db = await getData();
    const [profile, pending] = await Promise.all([db.getProfile(), db.listPendingApprovals()]);
    header = { name: profile.name || user.name, email: user.email };
    pendingCount = pending.length;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <header className="border-b border-ink">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
            <Link href={user ? "/dashboard" : "/login"} className="group flex items-baseline gap-2 py-1">
              <span className="font-display text-3xl leading-none tracking-tight">Pursuit</span>
              <span className="h-2 w-2 rounded-full bg-signal transition-transform group-hover:scale-150" />
            </Link>
            <Nav user={header} pendingCount={pendingCount} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="border-t border-rule">
          <div className="mx-auto max-w-7xl px-4 py-5 eyebrow sm:px-6">
            Nothing is sent without your approval
          </div>
        </footer>
      </body>
    </html>
  );
}
