"use client";

import { setTheme } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

/**
 * Light/dark switch for the header. It shows a moon in light mode and a sun in
 * dark mode, i.e. the theme you'd switch to.
 *
 * CSS decides which icon is visible (the `dark:` variant), not React state. The
 * inline head script has already set the theme before first paint, so the icon
 * is correct even before hydration. React state only drives `aria-pressed`.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useTheme() === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative flex h-[22px] w-[22px] items-center justify-center ${className}`}
    >
      {/* Moon — visible in light mode. */}
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="theme-anim absolute transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:-rotate-90 dark:scale-50 dark:opacity-0"
      >
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
      </svg>
      {/* Sun — visible in dark mode. */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
        className="theme-anim absolute rotate-90 scale-50 opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:rotate-0 dark:scale-100 dark:opacity-100"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
