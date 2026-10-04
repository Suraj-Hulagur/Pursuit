"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard", match: ["/dashboard"] },
  { href: "/opportunities", label: "Opportunities", match: ["/opportunities", "/opportunity/"] },
  { href: "/campaigns", label: "Campaigns", match: ["/campaigns", "/campaign/"] },
  { href: "/approvals", label: "Approvals", match: ["/approvals"] },
  { href: "/sources", label: "Sources", match: ["/sources"] },
  { href: "/profile", label: "Profile", match: ["/profile"] },
];

// Closes a popover on outside click or Escape.
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function Nav({
  user,
  pendingCount,
}: {
  user: { name: string; email: string } | null;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const menuRef = useDismiss(menuOpen, () => setMenuOpen(false));
  const avatarRef = useDismiss(avatarOpen, () => setAvatarOpen(false));

  // Close menus when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setAvatarOpen(false);
  }

  if (!user || pathname === "/login" || pathname === "/onboarding") return null;

  const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(m));
  const badge = (href: string) =>
    href === "/approvals" && pendingCount > 0 ? (
      <span className="rounded-full bg-signal-ink px-1.5 font-mono text-[0.7rem] text-card">
        {pendingCount}
      </span>
    ) : null;

  return (
    <div className="flex flex-1 items-center justify-end gap-2 lg:justify-between">
      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex gap-1">
          {links.map((l) => {
            const active = isActive(l.match);
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
                  {badge(l.href)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* avatar menu */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={avatarOpen}
            aria-label={`Account menu for ${user.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-xl text-card transition-colors hover:bg-signal-ink"
          >
            {user.name.trim().charAt(0).toUpperCase() || "?"}
          </button>
          {avatarOpen && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-2 w-56 rounded-sm border border-ink bg-card py-1 shadow-[4px_4px_0_0_var(--ink)]"
            >
              <div className="border-b border-rule px-3 py-2">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate font-mono text-[0.72rem] text-ink-soft">{user.email}</p>
              </div>
              <Link role="menuitem" href="/profile" className="block px-3 py-2.5 text-sm hover:bg-paper-deep">
                Profile
              </Link>
              <form action="/auth/signout" method="post">
                <button role="menuitem" className="block w-full px-3 py-2.5 text-left text-sm hover:bg-paper-deep">
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>

        {/* mobile menu */}
        <div ref={menuRef} className="relative lg:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="flex h-10 items-center gap-2 rounded-full border border-ink px-3.5 text-sm"
          >
            <span aria-hidden className="flex w-4 flex-col gap-[3px]">
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
            </span>
            Menu
            {pendingCount > 0 && <span className="h-2 w-2 rounded-full bg-signal" aria-hidden />}
          </button>
          {menuOpen && (
            <nav
              id="mobile-nav"
              aria-label="Main"
              className="absolute right-0 z-30 mt-2 w-60 rounded-sm border border-ink bg-card py-1 shadow-[4px_4px_0_0_var(--ink)]"
            >
              <ul>
                {links.map((l) => {
                  const active = isActive(l.match);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center justify-between px-4 text-sm ${
                          active ? "bg-ink text-card" : "hover:bg-paper-deep"
                        }`}
                      >
                        {l.label}
                        {badge(l.href)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
