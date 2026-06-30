import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

type FooterLink = { label: string; href: string };

// Shop-by-department + site information, the two link columns in the footer.
// Every href resolves to a real route (collections, account anchors, mailto).
const SHOP: FooterLink[] = [
  { label: "New In", href: "/collections/new" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Shop All", href: "/collections/all" },
];

const INFORMATION: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Track Order", href: "/account#track" },
  { label: "Returns & Exchanges", href: "/account#returns" },
  { label: "Size Guide", href: "/account#size-guide" },
  { label: "Search", href: "/search" },
  { label: "Contact Us", href: "mailto:hello@goldenegal.com" },
];

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Instagram", href: "https://instagram.com/goldenegal", icon: <InstagramIcon /> },
  { label: "YouTube", href: "https://youtube.com/@goldenegal", icon: <YouTubeIcon /> },
  { label: "Facebook", href: "https://facebook.com/goldenegal", icon: <FacebookIcon /> },
  { label: "TikTok", href: "https://tiktok.com/@goldenegal", icon: <TikTokIcon /> },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0c0d] text-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
        {/* Oversized brand logo */}
        <Image
          src="/golden-eagle-logo-hd.png"
          alt="Golden Eagle"
          width={2806}
          height={947}
          quality={100}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="h-auto w-full select-none"
        />

        {/* Sign up · Shop · Information */}
        <div className="mt-12 flex flex-col gap-12 lg:mt-16 lg:flex-row lg:gap-20 xl:gap-28">
          <div className="lg:w-[36%]">
            <h2 className="text-[22px] font-bold italic">Sign up now</h2>
            <p className="mt-2 text-[15px] text-white/55">
              Notifications you won&apos;t want to ignore.
            </p>
            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>

          <div className="flex gap-16 sm:gap-24 lg:gap-28">
            <FooterCol title="Shop" links={SHOP} />
            <FooterCol title="Information" links={INFORMATION} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 grid grid-cols-1 items-center gap-6 border-t border-white/[0.12] pt-7 sm:grid-cols-3 lg:mt-24">
          <div className="flex justify-center gap-5 sm:justify-start">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                className="text-white/70 transition-colors hover:text-[#eec449] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#eec449]"
              >
                {s.icon}
              </a>
            ))}
          </div>

          <p className="text-center text-[15px] font-bold italic tracking-[0.04em] text-white">
            BE BETTER EVERYDAY
          </p>

          <p className="text-center text-[13px] text-white/45 sm:text-right">
            © 2026 Golden Egal — Made in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[15px] font-semibold text-white/45">{title}</h3>
      <ul className="mt-6 flex flex-col gap-[14px]">
        {links.map((l) => {
          const external = /^(https?:|mailto:|tel:)/.test(l.href);
          const cls =
            "text-[15px] text-white/85 no-underline transition-colors hover:text-[#eec449]";
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
