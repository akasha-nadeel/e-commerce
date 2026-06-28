"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { useCart } from "./cart-provider";

const NAV = [
  { label: "HOME", href: "/", mega: false },
  { label: "NEW IN", href: "/collections/new", mega: false },
  { label: "MEN", href: "/collections/men", mega: true },
  { label: "WOMEN", href: "/collections/women", mega: true },
  { label: "ACCESSORIES", href: "/collections/accessories", mega: false },
  { label: "ABOUT", href: "/about", mega: false },
];

const FEATURED: { label: string; href: string }[] = [
  { label: "New Arrivals", href: "/collections/new" },
  { label: "Best Sellers", href: "/collections/all" },
  { label: "Essentials", href: "/collections/all" },
  { label: "Premium Collection", href: "/collections/all" },
  { label: "Oversize Collection", href: "/collections/all" },
];

const EXPLORE: { label: string; href: string }[] = [
  { label: "T-Shirts", href: "/collections/men" },
  { label: "Oversized Tees", href: "/products/essential-oversized-tee" },
  { label: "Jerseys", href: "/products/varsity-box-fit-jersey" },
  { label: "Tanks", href: "/products/athlex-cross-back-tank" },
  { label: "Shorts", href: "/collections/all" },
  { label: "Hoodies & Jackets", href: "/collections/all" },
  { label: "Joggers & Pants", href: "/collections/all" },
];

export function SiteHeader() {
  const { count, open } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the homepage the nav overlays the hero transparently at the very top;
  // as soon as the user starts scrolling it gains a solid white background.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // The homepage hero is a light studio image, so the nav text/logo stay dark
  // throughout; only the background switches from transparent (over the hero) to
  // solid white once scrolled or when a menu is open.
  const transparent = isHome && !scrolled && !megaOpen && !mobileOpen;

  const navLinkCls =
    "font-medium text-[13px] tracking-[0.03em] py-1 border-b-2 border-transparent transition-colors no-underline text-[#0c0c0d] hover:text-[#c79a4b] hover:border-[#c79a4b]";
  const iconCls =
    "cursor-pointer transition-colors text-[#0c0c0d] hover:text-[#c79a4b]";

  return (
    <header
      onMouseLeave={() => setMegaOpen(false)}
      className={`sticky top-0 z-50 text-[#0c0c0d] transition-colors duration-300 ${
        transparent ? "bg-transparent" : "border-b border-[#e7e6e9] bg-white"
      }`}
    >
      <div className="relative mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-[10px] sm:px-8">
        {/* Left: mobile hamburger + logo (logo centres on mobile, sits left on desktop) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={`-ml-1 flex h-9 w-9 items-center justify-center md:hidden ${iconCls}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="7" x2="21" y2="7" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="17" x2="21" y2="17" />
                </>
              )}
            </svg>
          </button>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0">
            <Logo variant="onLight" showText={false} markHeight={54} />
          </span>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-7 md:flex lg:gap-9">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={navLinkCls}
              onMouseEnter={() => setMegaOpen(item.mega)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: utility icons */}
        <div className="flex items-center gap-5 sm:gap-[22px]">
          <Link href="/search" aria-label="Search products" className={iconCls}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>
          <Link href="/login" aria-label="Account" className={`hidden sm:block ${iconCls}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={open}
            aria-label={`Open bag, ${count} items`}
            className={`relative ${iconCls}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="absolute -right-[9px] -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-[9px] bg-[#c79a4b] px-1 text-[10px] font-semibold text-[#0c0c0d]">
              {count}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop mega-menu */}
      {megaOpen && (
        <div className="absolute left-0 top-full hidden w-full bg-white text-[#0c0c0d] shadow-[0_28px_50px_rgba(0,0,0,0.22)] md:block">
          <div className="mx-auto grid max-w-[1400px] grid-cols-[0.9fr_0.9fr_1.4fr_1.4fr] gap-[34px] px-8 pb-12 pt-10">
            <div>
              <div className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.14em]">
                Featured
              </div>
              <div className="flex flex-col gap-3.5">
                {FEATURED.map((f) => (
                  <Link key={f.label} href={f.href} className="text-[15px] text-[#0c0c0d] no-underline transition-colors hover:text-[#c79a4b]">
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.14em]">
                Explore
              </div>
              <div className="flex flex-col gap-3.5">
                {EXPLORE.map((e) => (
                  <Link key={e.label} href={e.href} className="text-[15px] text-[#0c0c0d] no-underline transition-colors hover:text-[#c79a4b]">
                    {e.label}
                  </Link>
                ))}
              </div>
            </div>
            <PromoTile caption="PROMO · CAMPAIGN" title="Recommended For You" href="/collections/new" />
            <PromoTile caption="PROMO · ACCESSORIES" title="Bags" href="/collections/accessories" />
          </div>
        </div>
      )}

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="border-t border-[#e7e6e9] bg-white md:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col px-5 py-2">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-[#f0eff1] py-4 text-[15px] font-medium tracking-[0.02em] text-[#0c0c0d] no-underline"
              >
                {item.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-5">
              {EXPLORE.map((e) => (
                <Link
                  key={e.label}
                  href={e.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[14px] text-[#6a6a6e] no-underline"
                >
                  {e.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function PromoTile({
  caption,
  title,
  href,
}: {
  caption: string;
  title: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="tile-texture-dark relative aspect-[16/10] overflow-hidden no-underline"
      style={{ background: "radial-gradient(120% 120% at 60% 30%,#2c2c30,#0d0d0f)" }}
    >
      <span className="absolute left-[18px] top-[14px] font-mono text-[9.5px] tracking-[0.12em] text-white/30">
        {caption}
      </span>
      <span className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold uppercase tracking-[0.12em] text-white">
        {title}
      </span>
    </Link>
  );
}
