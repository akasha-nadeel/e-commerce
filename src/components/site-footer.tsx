import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

type FooterLink = { label: string; href: string };

// Three-column information architecture mirroring the apparel-footer convention:
// site/info, shop-by-department, and a curated product shortlist. Every href
// resolves to a real route (collections, products, account anchors, mailto).
const MAIN_MENU: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/collections/all" },
  { label: "About", href: "/about" },
  { label: "Track Order", href: "/account#track" },
  { label: "Contact", href: "mailto:hello@goldenegal.com" },
];

const QUICK_MENU: FooterLink[] = [
  { label: "New In", href: "/collections/new" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Search", href: "/search" },
];

const TOP_COLLECTION: FooterLink[] = [
  { label: "Oversized Tees", href: "/products/essential-oversized-tee" },
  { label: "Varsity Jerseys", href: "/products/varsity-box-fit-jersey" },
  { label: "Crew Tees", href: "/products/heavyweight-crew-tee" },
  { label: "Logo Caps", href: "/products/logo-cap" },
  { label: "Tote Bags", href: "/products/essence-tote-bag" },
];

// Placeholder contact + social handles — swap for the brand's real details.
const PHONES: FooterLink[] = [
  { label: "+94 11 234 5678 (Online Orders)", href: "tel:+94112345678" },
  { label: "+94 77 123 4567 (Flagship Store)", href: "tel:+94771234567" },
];

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Facebook", href: "https://facebook.com/goldenegal", icon: <FacebookIcon /> },
  { label: "Instagram", href: "https://instagram.com/goldenegal", icon: <InstagramIcon /> },
  { label: "YouTube", href: "https://youtube.com/@goldenegal", icon: <YouTubeIcon /> },
  { label: "TikTok", href: "https://tiktok.com/@goldenegal", icon: <TikTokIcon /> },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0c0d] text-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.35fr_1px_1.9fr] lg:gap-0">
          {/* Brand block */}
          <div className="lg:pr-16">
            <Logo variant="onDark" showText markHeight={44} size={16} />

            <div className="mt-7">
              <NewsletterForm />
            </div>

            <p className="mt-7 max-w-[440px] text-[14px] leading-[1.7] text-white/55">
              Explore the craft and strength of Golden Egal. Our premium tees,
              jerseys and athleisure blend elegance with performance — engineered
              for world-class movement and built from the ground up. Be better
              everyday.
            </p>

            <div className="mt-8">
              <p className="text-[14px] font-semibold text-white">Contact Us :</p>
              <ul className="mt-4 flex flex-col gap-3">
                {PHONES.map((p) => (
                  <li key={p.href} className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-white/45"
                    />
                    <a
                      href={p.href}
                      className="text-[14px] text-white/60 no-underline transition-colors hover:text-[#c79a4b]"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-9 flex items-center gap-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="text-white/80 transition-colors hover:text-[#c79a4b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c79a4b]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Vertical divider (desktop) */}
          <div className="hidden bg-white/10 lg:block" aria-hidden />

          {/* Menu columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:pl-16">
            <FooterCol title="Main Menu" links={MAIN_MENU} />
            <FooterCol title="Quick Menu" links={QUICK_MENU} />
            <FooterCol title="Top Collection" links={TOP_COLLECTION} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.12] pt-6 text-[13px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Golden Egal.{" "}
            <span className="underline decoration-white/30 underline-offset-2">
              All Rights Reserved
            </span>
          </p>
          <p className="tracking-[0.06em]">Made in Sri Lanka · Prices in LKR</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[15px] font-bold uppercase tracking-[0.08em] text-white">
        {title}
      </h3>
      <ul className="mt-6 flex flex-col gap-[14px]">
        {links.map((l) => {
          const external = /^(https?:|mailto:|tel:)/.test(l.href);
          const cls =
            "text-[13.5px] uppercase tracking-[0.05em] text-white/60 no-underline transition-colors hover:text-[#c79a4b]";
          return (
            <li key={l.label}>
              {external ? (
                <a href={l.href} className={cls}>
                  {l.label}
                </a>
              ) : (
                <Link href={l.href} className={cls}>
                  {l.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* --------------------------------- Icons --------------------------------- */

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.2-.41-4.74a2.51 2.51 0 0 0-1.77-1.78C19.27 5.07 12 5.07 12 5.07s-7.27 0-8.82.41a2.51 2.51 0 0 0-1.77 1.78C1 8.8 1 12 1 12s0 3.2.41 4.74a2.51 2.51 0 0 0 1.77 1.78c1.55.41 8.82.41 8.82.41s7.27 0 8.82-.41a2.51 2.51 0 0 0 1.77-1.78C23 15.2 23 12 23 12zM9.75 14.85v-5.7L15 12l-5.25 2.85z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.6 5.6 0 0 0 4.5 4.34v3.07a8.6 8.6 0 0 1-4.46-1.27v6.13a6.27 6.27 0 1 1-6.27-6.27c.27 0 .53.02.79.06v3.2a3.1 3.1 0 1 0 2.18 2.96V3h3.27z" />
    </svg>
  );
}
