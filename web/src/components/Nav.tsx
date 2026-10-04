"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/approvals", label: "Approvals" },
  { href: "/profile", label: "Profile" },
];

export function Nav({
  user,
  pendingCount,
}: {
  user: { name: string; email: string } | null;
  pendingCount: number;
}) {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href.replace(/s$/, ""));

  return (
    <>
      <nav
        aria-label="Main"
        className="order-last -mx-4 w-[calc(100%+2rem)] overflow-x-auto border-t border-rule px-4 md:order-none md:mx-0 md:w-auto md:border-0 md:px-0"
      >
        <ul className="flex gap-1 py-2 md:py-0">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm transition-colors ${
                    active ? "bg-ink text-card" : "hover:bg-paper-deep"
                  }`}
                >
                  {l.label}
                  {l.href === "/approvals" && pendingCount > 0 && (
                    <span className="rounded-full bg-signal px-1.5 font-mono text-[0.65rem] text-card">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="font-mono text-[0.65rem] text-ink-soft">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="h-10 rounded-full border border-ink px-3.5 text-sm transition-colors hover:bg-paper-deep">
              Sign out
            </button>
          </form>
        </div>
      )}
    </>
  );
}
