"use client";

import { useSyncExternalStore } from "react";

// The inline script in layout.tsx applies the stored/system theme to <html>
// before hydration, so the `dark` class on <html> is the source of truth.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const readTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

export function ThemeToggle({ className = "" }: { className?: string }) {
  // null on the server, so the placeholder renders until the client knows the theme.
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("pursuit-theme", next);
    } catch {}
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  if (theme === null) {
    return (
      <div className={`h-9 w-9 rounded-full border border-rule ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-card text-ink transition-all hover:border-ink hover:scale-105 active:scale-95 ${className}`}
    >
      {theme === "light" ? (
        // Moon icon for switching to dark mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        // Sun icon for switching to light mode
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
