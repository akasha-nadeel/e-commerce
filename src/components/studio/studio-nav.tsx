"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studioLogout } from "@/lib/actions/studio";

/**
 * Studio navigation.
 *
 * Order is **Products · Sign out · View store**, set this way at the owner's
 * explicit request — leave it alone rather than "correcting" it toward the usual
 * nav-left / utilities-right split.
 *
 * "Add product" deliberately isn't here — it duplicated the primary CTA already
 * on the Products page, and two buttons competing for one job means neither reads
 * as the obvious next step.
 */
export function StudioNav() {
  const pathname = usePathname();
  // The edit route (/studio/<id>) is still "Products" as far as the nav goes.
  const onProducts = pathname === "/studio" || /^\/studio\/\d+$/.test(pathname);

  return (
    <nav
      aria-label="Studio"
      className="flex shrink-0 items-center gap-1.5 sm:gap-3"
    >
      <Link
        href="/studio"
        aria-current={onProducts ? "page" : undefined}
        className="relative px-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] no-underline transition-colors sm:px-2 sm:text-[12px] sm:tracking-[0.12em]"
        style={{ color: onProducts ? "#0c0c0d" : "#8a8a8e" }}
      >
        Products
        {onProducts && (
          <span
            className="absolute inset-x-1 -bottom-[13px] h-[2px] bg-[#eec449] sm:inset-x-2"
            aria-hidden
          />
        )}
      </Link>

      <form action={studioLogout}>
        <button
          type="submit"
          className="cursor-pointer whitespace-nowrap border border-[#0c0c0d] bg-white px-2.5 py-[8px] text-[11px] font-bold uppercase tracking-[0.08em] text-[#0c0c0d] transition-colors hover:bg-[#0c0c0d] hover:text-white sm:px-4 sm:py-[9px] sm:text-[12px] sm:tracking-[0.12em]"
        >
          Sign out
        </button>
      </form>

      {/* Solid ink → gold on hover, like every storefront CTA. Shortened to
          "Store" on phones — the full label is what pushed this row past 390px. */}
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        title="Open the website in a new tab"
        className="whitespace-nowrap bg-[#0c0c0d] px-2.5 py-[9px] text-[11px] font-bold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d] sm:px-4 sm:py-2.5 sm:text-[12px] sm:tracking-[0.12em]"
      >
        <span className="sm:hidden">Store</span>
        <span className="hidden sm:inline">View store</span>
      </a>
    </nav>
  );
}
