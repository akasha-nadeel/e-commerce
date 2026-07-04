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
  { label: "Shop All", href: "/collections/all" },
];

const INFORMATION: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Track Order", href: "/account#track" },
  { label: "Returns & Exchanges", href: "/account#returns" },
  { label: "Size Guide", href: "/account#size-guide" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact Us", href: "mailto:hello@goldeneagleclothing.com" },
];

// Trust band that opens the footer.
const BENEFITS: { title: string; sub: string; icon: React.ReactNode }[] = [
  {
    title: "Free Shipping",
    sub: "On orders over LKR 20,000",
    icon: (
      <>
        <path d="M3 7h11v8H3z" />
        <path d="M14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </>
    ),
  },
  {
    title: "Easy Returns",
    sub: "14-day return policy",
    icon: (
      <>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </>
    ),
  },
  {
    title: "Secure Payment",
    sub: "100% secure checkout",
    icon: (
      <>
        <path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Island-wide Delivery",
    sub: "Across Sri Lanka",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </>
    ),
  },
];

const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/golden_eagle1976?utm_source=qr&igsh=cDh4bHFtYWU1NXE=",
    icon: <InstagramIcon />,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18dvMtfy7H/",
    icon: <FacebookIcon />,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@golden.eagle381?_r=1&_t=ZS-96U5QzRklNZ",
    icon: <TikTokIcon />,
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0c0d] text-white">
      {/* Trust band */}
      <div className="border-b border-white/[0.12]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-4 gap-x-3 px-4 py-8 sm:gap-x-6 sm:px-8 lg:py-12">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-4 sm:text-left"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#eec449"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px] shrink-0 sm:h-[30px] sm:w-[30px]"
              >
                {b.icon}
              </svg>
              <div>
                <div className="text-[9px] font-semibold leading-tight text-white sm:text-[14px]">
                  {b.title}
                </div>
                <div className="mt-0.5 text-[8px] leading-tight text-white/50 sm:text-[12px]">
                  {b.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            OWN THE DAY
          </p>

          <p className="text-center text-[13px] text-white/45 sm:text-right">
            © 2026 Golden Eagle — Made in Sri Lanka
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


function TikTokIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3a5.6 5.6 0 0 0 4.5 4.34v3.07a8.6 8.6 0 0 1-4.46-1.27v6.13a6.27 6.27 0 1 1-6.27-6.27c.27 0 .53.02.79.06v3.2a3.1 3.1 0 1 0 2.18 2.96V3h3.27z" />
    </svg>
  );
}
