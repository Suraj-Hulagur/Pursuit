import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { getStudent } from "@/lib/data";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  const student = getStudent();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-ink">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-5 py-4">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="font-display text-3xl leading-none tracking-tight">
                Pursuit
              </span>
              <span className="h-2 w-2 rounded-full bg-signal transition-transform group-hover:scale-150" />
            </Link>
            <div className="text-right">
              <p className="eyebrow">Representing</p>
              <p className="text-sm font-medium">
                {student.name}
                <span className="hidden text-ink-soft sm:inline">
                  {" "}
                  · {student.course}
                </span>
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
          {children}
        </main>
        <footer className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-5 eyebrow">
            Nothing is sent without your approval
          </div>
        </footer>
      </body>
    </html>
  );
}
