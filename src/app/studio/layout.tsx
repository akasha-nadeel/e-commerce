import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { StudioNav } from "@/components/studio/studio-nav";
import { hasStudioSession, isStudioConfigured } from "@/lib/studio/auth";

/**
 * Studio chrome.
 *
 * Deliberately not the storefront header (see `chrome-gate.tsx`) — a shopper's
 * mega-menu on an admin screen would be noise. It does borrow the storefront's
 * *language* though: the eagle mark, uppercase tracked nav labels, hairline
 * rules and ink→gold hovers, so it reads as Golden Eagle rather than a generic
 * dashboard.
 *
 * When signed out the chrome is dropped entirely, letting the login screen own
 * the full viewport with the same split-screen shell as `/login`.
 */

export const metadata: Metadata = {
  title: "Studio — Golden Eagle",
  // Belt and braces with the /studio disallow in robots.ts: this surface must
  // never be indexed, and a stray inbound link shouldn't be enough to do it.
  robots: { index: false, follow: false, nocache: true },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without STUDIO_PASSWORD (or an Admin token) the Studio doesn't exist at
  // all. Failing closed here means a missing env var can never expose it.
  if (!isStudioConfigured) notFound();

  const signedIn = await hasStudioSession();

  // Signed out: no chrome, so `/studio/login` can render the brand split-screen.
  if (!signedIn) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-white text-[#0c0c0d]">
      <header className="sticky top-0 z-50 border-b border-[#e7e6e9] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          {/* `Logo` renders its own <Link>, so it takes the href directly — do
              not wrap it, or you get an <a> inside an <a> and a hydration error
              with no visible symptom until you read the console. */}
          <div className="flex shrink-0 items-center gap-2.5">
            <Logo
              variant="onLight"
              showText={false}
              markHeight={30}
              href="/studio"
            />
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0c0c0d]">
              Studio
            </span>
          </div>

          <StudioNav />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
