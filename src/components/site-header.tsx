"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
import { Logo } from "./logo";
import { useCart } from "./cart-provider";
import { SearchPanel } from "./search/search-panel";
import { SlidingNumber } from "./ui/sliding-number";
import { useSheetDrag } from "@/lib/use-sheet-drag";

const NAV = [
  { label: "HOME", href: "/", mega: false },
  { label: "MEN", href: "/collections/men", mega: true },
  { label: "WOMEN", href: "/collections/women", mega: true },
  { label: "ACCESSORIES", href: "/collections/accessories", mega: false },
  { label: "SHOP ALL", href: "/collections/all", mega: false },
  { label: "ABOUT", href: "/about", mega: false },
];

// Bold category grid shown in the MEN / WOMEN mega-menu (SPD-style).
const MEGA_CATS: { label: string; href: string }[] = [
  { label: "T-Shirts", href: "/collections/t-shirts" },
  { label: "Polo", href: "/collections/polo" },
  { label: "Hoodies", href: "/collections/hoody" },
  { label: "Tanks", href: "/collections/tanks" },
  { label: "New In", href: "/collections/new" },
  { label: "Best Sellers", href: "/collections/all" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Shop All", href: "/collections/all" },
];

// Per-department "all products" link + lifestyle image on the mega-menu's right.
const MEGA_DEPT: Record<
  string,
  { label: string; allHref: string; image: string; alt: string }
> = {
  MEN: {
    label: "Men",
    allHref: "/collections/men",
    image: "/dept-men-wide.png",
    alt: "Shop the men's collection",
  },
  WOMEN: {
    label: "Women",
    allHref: "/collections/women",
    image: "/dept-women-wide-v2.jpg",
    alt: "Shop the women's collection",
  },
};

// Stable no-op subscribe for the hydration flag below.
const emptySubscribe = () => () => {};

export function SiteHeader() {
  const { count, open } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [megaItem, setMegaItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Mobile only: hide the top bar and reveal the bottom tab bar on scroll-down;
  // reverse on scroll-up. Always show the top bar near the very top of the page.
  const [hideTop, setHideTop] = useState(false);
  const [auth, setAuth] = useState<{ loggedIn: boolean; firstName?: string }>({
    loggedIn: false,
  });
  const [accountOpen, setAccountOpen] = useState(false);
  // False during SSR/prerender + first hydration render, true afterwards — so
  // the hero-overlay styling is applied only client-side (see below).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const reduce = useReducedMotion();

  const {
    style: menuDragStyle,
    handlers: menuHandlers,
    scrollRef: menuScrollRef,
  } = useSheetDrag(() => setMobileOpen(false));

  // On the homepage the nav overlays the hero transparently at the very top;
  // as soon as the user starts scrolling it gains a solid white background.
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Directional scroll drives the mobile top/bottom nav swap (all routes):
  // scrolling down past a small threshold hides the top bar (and shows the
  // bottom tab bar); scrolling up — or being near the top — brings it back.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 6) {
        setHideTop(y > 80 && y > lastY);
        lastY = y;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auth state for the header (logged-in avatar vs sign-in icon).
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => active && setAuth(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Lock scroll + Esc-to-close while the mobile menu sheet is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // The homepage hero is a dark studio image, so while the nav overlays it
  // (transparent) the text/logo/icons render light; once scrolled or a menu
  // opens the nav gains a solid white background and switches back to dark.
  const atTopHero = isHome && !scrolled && !megaItem && !mobileOpen;
  // The home page is statically prerendered with usePathname === null (isHome
  // is false at build time), so the SSR HTML can't know the route. Default
  // pre-mount to the dark-hero overlay look — transparent bg + light text/logo
  // — so the home nav never flashes black over the hero on load. The bg stays
  // transparent pre-mount (no white-nav flash); once mounted, the scroll/route
  // logic takes over and content pages switch to the solid nav.
  const lightText = mounted ? atTopHero : true;
  const solidBg = mounted ? !atTopHero : false;

  // Nav links highlight with a solid ink box on hover; the active route keeps it.
  const navLinkBase =
    "whitespace-nowrap rounded-none px-3 py-2 text-[13px] font-medium tracking-[0.03em] no-underline transition-colors hover:bg-[#0c0c0d] hover:text-white";
  const iconCls = `cursor-pointer transition-colors hover:text-[#eec449] ${
    lightText ? "text-white" : "text-[#0c0c0d]"
  }`;

  return (
    <header
      onMouseLeave={() => setMegaItem(null)}
      className="sticky top-0 z-50 text-[#0c0c0d]"
    >
      {/* Top bar — full-width so its background spans the viewport. On mobile it
          rolls up out of view on scroll-down (revealing the bottom tab bar) and
          drops back in on scroll-up; desktop (lg+) always stays put. */}
      <div
        className={`transition-[transform,background-color] duration-300 ${
          solidBg ? "bg-white" : "bg-transparent"
        } ${hideTop ? "-translate-y-full lg:translate-y-0" : "translate-y-0"}`}
      >
        <div className="relative mx-auto flex h-[var(--nav-h)] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* Left: mobile hamburger + search; logo centres on mobile, sits left on
            desktop (where search moves to the right utility cluster). */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={`-ml-1 flex h-9 w-9 items-center justify-center lg:hidden ${iconCls}`}
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
          {/* Search — sits next to the hamburger on mobile (left cluster);
              hidden here at lg where it lives in the right cluster instead. */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className={`flex h-9 w-9 items-center justify-center lg:hidden ${iconCls}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0">
            <Logo variant={lightText ? "gold" : "onLight"} showText={false} markHeight={40} />
          </span>
        </div>

        {/* Center: desktop nav — horizontal only at lg+; the md/tablet band
            uses the hamburger drawer so 6 links never cram or wrap. */}
        <nav className="hidden items-center gap-2 lg:flex lg:gap-3">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setMegaItem(item.mega ? item.label : null)}
                className={`${navLinkBase} ${
                  active && !lightText
                    ? "bg-[#0c0c0d] text-white"
                    : lightText
                      ? "text-white"
                      : "text-[#0c0c0d]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: utility icons (search only shows here at lg+; on mobile it
            sits in the left cluster next to the hamburger). */}
        <div className="flex items-center gap-5 sm:gap-[22px]">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className={`hidden lg:block ${iconCls}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
          <div className="relative">
            {auth.loggedIn ? (
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                className={`flex h-8 w-8 items-center justify-center rounded-full border border-current text-[12px] font-bold ${iconCls}`}
              >
                {auth.firstName ? (
                  auth.firstName[0].toUpperCase()
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
                  </svg>
                )}
              </button>
            ) : (
              <Link href="/login" aria-label="Sign in" className={iconCls}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
                </svg>
              </Link>
            )}

            {accountOpen && auth.loggedIn && (
              <>
                <div
                  className="fixed inset-0 z-[55]"
                  aria-hidden
                  onClick={() => setAccountOpen(false)}
                />
                <div className="absolute right-0 top-full z-[60] mt-3 w-52 border border-[#e7e6e9] bg-white py-2 text-[#0c0c0d] shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                  {auth.firstName && (
                    <div className="border-b border-[#f0eff1] px-4 py-2.5 text-[13px] text-[#8a8a8e]">
                      Hi,{" "}
                      <span className="font-semibold text-[#0c0c0d]">
                        {auth.firstName}
                      </span>
                    </div>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-[14px] no-underline transition-colors hover:bg-[#f7f7f8]"
                  >
                    My Account
                  </Link>
                  <a
                    href="/api/auth/logout"
                    className="block px-4 py-2.5 text-[14px] no-underline transition-colors hover:bg-[#f7f7f8]"
                  >
                    Log out
                  </a>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={open}
            aria-label={`Open bag, ${count} items`}
            className={`relative ${iconCls}`}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20.5" r="1.6" />
              <circle cx="18" cy="20.5" r="1.6" />
              <path d="M2.5 3.5h2.3l2.5 12.2a1.8 1.8 0 0 0 1.77 1.45h8a1.8 1.8 0 0 0 1.76-1.42L20.6 7H5.4" />
            </svg>
            <span className="absolute -right-[9px] -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-[9px] bg-[#eec449] px-1 text-[10px] font-semibold text-[#0c0c0d]">
              <SlidingNumber value={count} />
            </span>
          </button>
        </div>
      </div>
      </div>

      {/* Desktop mega-menu — SPD-style, revealed in sequence. AnimatePresence
          rolls the panel smoothly up only on true close (moving to a non-mega
          link / off the nav). The panel container has a STABLE key so switching
          MEN <-> WOMEN keeps it open (same height); the inner content is keyed
          by department so ITS elements remount and replay their entrance while
          the panel stays put. */}
      <AnimatePresence>
      {megaItem && MEGA_DEPT[megaItem] && (
        <motion.div
          key="mega"
          initial={reduce ? false : { height: 0 }}
          animate={{ height: "auto" }}
          exit={reduce ? {} : { height: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="absolute left-0 top-full hidden w-full overflow-hidden border-t border-[#efeff0] bg-white text-[#0c0c0d] shadow-[0_28px_50px_rgba(0,0,0,0.22)] lg:block"
        >
          <div
            key={megaItem}
            className="mx-auto flex min-h-[440px] max-w-[1400px] items-stretch gap-10 px-8 pb-12 pt-12"
          >
            <div className="flex flex-1 flex-col">
              {/* 4. Category links — cascade top-left → bottom-right (last) */}
              <div className="grid grid-cols-4 gap-x-6 gap-y-12">
                {MEGA_CATS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={reduce ? false : { opacity: 0, x: -32 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.38,
                      delay: reduce ? 0 : 0.2 + i * 0.05,
                      ease: EASE,
                    }}
                  >
                    <Link
                      href={c.href}
                      onClick={() => setMegaItem(null)}
                      className="justify-self-start text-[19px] font-bold tracking-[-0.01em] text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
                    >
                      {c.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-auto">
                {/* 2. The line above the title — grows in from the left */}
                <motion.div
                  className="h-px w-full origin-left bg-[#0c0c0d]/15"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.32, delay: reduce ? 0 : 0.86, ease: EASE }}
                />
                {/* 1. The "All Product" title — slides in from the left first */}
                <motion.div
                  className="pt-6"
                  initial={reduce ? false : { opacity: 0, x: -44 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.92, ease: EASE }}
                >
                  <Link
                    href={MEGA_DEPT[megaItem].allHref}
                    onClick={() => setMegaItem(null)}
                    className="group/all flex items-center justify-between text-[21px] font-bold text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
                  >
                    {MEGA_DEPT[megaItem].label} All Product
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover/all:translate-x-1.5"
                    >
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <path d="M14 6l6 6-6 6" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </div>
            {/* 3. Department image — slides in from the right */}
            <motion.div
              className="hidden w-[420px] shrink-0 overflow-hidden lg:block"
              initial={reduce ? false : { opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.62, ease: EASE }}
            >
              <Link
                href={MEGA_DEPT[megaItem].allHref}
                onClick={() => setMegaItem(null)}
                className="relative block h-full w-full"
              >
                <Image
                  src={MEGA_DEPT[megaItem].image}
                  alt={MEGA_DEPT[megaItem].alt}
                  fill
                  sizes="420px"
                  className="object-cover object-center"
                />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Mobile menu — bottom sheet */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-label="Menu"
        aria-hidden={!mobileOpen}
        style={menuDragStyle}
        {...menuHandlers}
        className={`fixed inset-x-0 bottom-0 z-[70] flex h-[72vh] flex-col rounded-t-[22px] bg-white text-[#0c0c0d] shadow-[0_-10px_40px_rgba(0,0,0,0.22)] transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="shrink-0 pb-1 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-[#d7d6d9]" />
        </div>
        <div ref={menuScrollRef} className="flex-1 overflow-y-auto overscroll-contain px-6 pb-2 pt-3">
          <nav className="flex flex-col">
            {NAV.map((item, i) => (
              <motion.div
                key={item.label}
                initial={false}
                animate={
                  mobileOpen
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: reduce ? 0 : -30 }
                }
                transition={{
                  duration: reduce ? 0 : 0.35,
                  delay: mobileOpen && !reduce ? 0.18 + i * 0.06 : 0,
                  ease: EASE,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-[#f0eff1] py-[15px] text-[17px] font-semibold tracking-[0.02em] text-[#0c0c0d] no-underline"
                >
                  {item.label}
                  {item.mega && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c0c0d" strokeWidth={2}>
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between border-t border-[#e7e6e9] px-6 py-4">
          {auth.loggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-[14px] font-semibold text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
                </svg>
                {auth.firstName ? `Hi, ${auth.firstName}` : "My Account"}
              </Link>
              <a
                href="/api/auth/logout"
                className="text-[13px] font-semibold text-[#8a8a8e] no-underline transition-colors hover:text-[#0c0c0d]"
              >
                Log out
              </a>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-[14px] font-semibold text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
              </svg>
              Login
            </Link>
          )}
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Facebook" className="text-[#0c0c0d] transition-colors hover:text-[#eec449]">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 22v-8h2.7l.4-3H13V9c0-.86.24-1.45 1.5-1.45H16V4.86A20 20 0 0 0 13.7 4.7c-2.3 0-3.87 1.4-3.87 3.98V11H7.2v3h2.63v8H13Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-[#0c0c0d] transition-colors hover:text-[#eec449]">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar — mirrors the top nav's directional behaviour:
          it slides up into view as the top bar rolls away on scroll-down, and
          slides back down as the top bar returns on scroll-up. Mobile only. */}
      <nav
        aria-label="Quick navigation"
        className={`fixed inset-x-0 bottom-0 z-40 text-[#0c0c0d] transition-transform duration-300 lg:hidden ${
          hideTop ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-stretch justify-around gap-1 rounded-t-[18px] border-t border-[#ededed] bg-white px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_28px_rgba(0,0,0,0.12)]">
          <BottomTab
            label="Home"
            href="/"
            active={pathname === "/"}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11.5 12 5l8 6.5" />
                <path d="M6 10.5V19h4v-5h4v5h4v-8.5" />
              </svg>
            }
          />
          <BottomTab
            label="Menu"
            onClick={() => setMobileOpen(true)}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            }
          />
          <BottomTab
            label="Cart"
            onClick={open}
            badge={count}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20.5" r="1.5" />
                <circle cx="18" cy="20.5" r="1.5" />
                <path d="M2.5 3.5h2.3l2.5 12.2a1.8 1.8 0 0 0 1.77 1.45h8a1.8 1.8 0 0 0 1.76-1.42L20.6 7H5.4" />
              </svg>
            }
          />
          <BottomTab
            label="Account"
            href={auth.loggedIn ? "/account" : "/login"}
            active={pathname.startsWith("/account") || pathname.startsWith("/login")}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21c0-4 3.5-6 7-6s7 2 7 6" />
              </svg>
            }
          />
        </div>
      </nav>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

/** A single item in the mobile bottom tab bar — icon + label, rendered as a
    link (href) or an action button (onClick). Optional cart-style badge. */
function BottomTab({
  label,
  icon,
  href,
  onClick,
  active = false,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
}) {
  const cls =
    "relative flex flex-1 flex-col items-center gap-1 py-1 no-underline";
  const body = (
    <>
      {/* Active tab gets a filled gold pill behind the icon (dark icon on
          gold); inactive tabs are plain grey icons. */}
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          active ? "bg-[#eec449] text-[#0c0c0d]" : "text-[#8a8a8e]"
        }`}
      >
        <span className="relative flex h-[22px] w-[22px] items-center justify-center">
          {icon}
          {badge != null && badge > 0 && (
            <span className="absolute -right-2.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#eec449] px-[3px] text-[9px] font-semibold leading-none text-[#0c0c0d]">
              {badge}
            </span>
          )}
        </span>
      </span>
      <span
        className={`text-[10.5px] font-medium tracking-[0.01em] transition-colors ${
          active ? "text-[#0c0c0d]" : "text-[#8a8a8e]"
        }`}
      >
        {label}
      </span>
    </>
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

