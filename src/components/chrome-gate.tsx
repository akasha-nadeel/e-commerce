"use client";

import { usePathname } from "next/navigation";

// Routes that render their own full-screen, focused layout and should NOT show
// the global sticky header / footer (e.g. the split-screen auth experience).
const BARE_ROUTES = ["/login", "/signup", "/checkout"];

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) return null;
  return <>{children}</>;
}
