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
      className="flex items-center gap-2 sm:gap-3"
    >
      <Link
        href="/studio"
        aria-current={onProducts ? "page" : undefined}
        className="relative px-1.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] no-underline transition-colors sm:px-2"
        style={{ color: onProducts ? "#0c0c0d" : "#8a8a8e" }}
      >
        Products
        {onProducts && (
          <span
            className="absolute inset-x-1.5 -bottom-[13px] h-[2px] bg-[#eec449] sm:inset-x-2"
            aria-hidden
          />
        )}
      </Link>

      <form action={studioLogout}>
        <button
          type="submit"
          className="cursor-pointer border border-[#0c0c0d] bg-white px-3.5 py-[9px] text-[12px] font-bold uppercase tracking-[0.12em] text-[#0c0c0d] transition-colors hover:bg-[#0c0c0d] hover:text-white sm:px-4"
        >
          Sign out
        </button>
      </form>

      {/* Solid ink → gold on hover, like every storefront CTA. */}
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        title="Open the website in a new tab"
        className="bg-[#0c0c0d] px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white no-underline transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d] sm:px-4"
      >
        View store
      </a>
    </nav>
  );
}
