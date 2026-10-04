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
  const pendingCount = user ? (await (await getData()).listPendingApprovals()).length : 0;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <header className="border-b border-ink">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-4 md:py-4 sm:px-5">
            <Link href="/" className="group flex items-baseline gap-2 py-1">
              <span className="font-display text-3xl leading-none tracking-tight">
                Pursuit
              </span>
              <span className="h-2 w-2 rounded-full bg-signal transition-transform group-hover:scale-150" />
            </Link>
            <Nav
              user={user && { name: user.name, email: user.email }}
              pendingCount={pendingCount}
            />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-5">
          {children}
        </main>
        <footer className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-4 py-5 eyebrow sm:px-5">
            Nothing is sent without your approval
          </div>
        </footer>
      </body>
    </html>
  );
}
