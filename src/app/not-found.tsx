import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * 404. Next serves this with a real HTTP 404 status, so crawlers drop dead
 * URLs instead of indexing a soft-404 body under a 200 — the usual way retired
 * product handles linger in search results.
 */
export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has moved.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { label: "New In", href: "/collections/new" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Accessories", href: "/collections/accessories" },
];

export default function NotFound() {
  return (
    <div className="flex w-full items-center justify-center bg-white px-5 py-28 sm:px-8">
      <div className="w-full max-w-[560px] text-center">
        <div className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#c79a4b]">
          Error 404
        </div>
        <h1 className="display-tight mt-4 text-[clamp(38px,6vw,72px)] font-semibold leading-[0.95]">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-[1.7] text-[#8a8a8e]">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          Pick up where you left off below.
        </p>

        <div className="mt-8 flex justify-center">
          <Button href="/">Back to Home</Button>
        </div>

        {/* Internal links give crawlers (and shoppers) a path back into the
            catalog instead of a dead end. */}
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-[#4a4a4e] underline-offset-4 transition-colors hover:text-[#0c0c0d] hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
