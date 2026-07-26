"use client";

import { usePathname } from "next/navigation";

// Routes that render their own full-screen, focused layout and should NOT show
// the global sticky header / footer (e.g. the split-screen auth experience).
const BARE_ROUTES = ["/login", "/signup", "/checkout"];

// Whole sections that are bare, including everything nested under them. The
// Studio is an internal tool with its own chrome — storefront nav on it would
// be actively confusing.
const BARE_SECTIONS = ["/studio"];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) return null;
  if (BARE_SECTIONS.some((s) => pathname === s || pathname.startsWith(`${s}/`)))
    return null;
  return <>{children}</>;
}
