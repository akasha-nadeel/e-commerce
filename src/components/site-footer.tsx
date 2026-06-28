import Link from "next/link";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

type FooterLink = { label: string; href: string };

const SHOP: FooterLink[] = [
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "New In", href: "/collections/new" },
];
const HELP: FooterLink[] = [
  { label: "Track Order", href: "/account#track" },
  { label: "Returns", href: "/account#returns" },
  { label: "Size Guide", href: "/account#size-guide" },
  { label: "Contact", href: "mailto:hello@goldenegal.com" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0c0d] px-5 pb-9 pt-16 text-white sm:px-8">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
        <div>
          <div className="mb-4">
            <Logo variant="onDark" size={20} />
          </div>
          <p className="max-w-[300px] text-[14px] leading-[1.6] text-white/60">
            Premium tees for men and women. Built from the ground up — be better
            everyday.
          </p>
        </div>

        <FooterCol title="Shop" links={SHOP} />
        <FooterCol title="Help" links={HELP} />

        <div>
          <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em]">
            Join The Club
          </div>
          <p className="mb-3.5 text-[14px] text-white/60">
            Get early access to drops and 10% off your first order.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto mt-11 flex max-w-[1400px] flex-wrap justify-between gap-3 border-t border-white/[0.12] pt-6 text-[13px] text-white/45">
        <span>© 2026 Golden Egal. All rights reserved.</span>
        <span className="tracking-[0.06em]">Privacy · Terms · Sitemap</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em]">
        {title}
      </div>
      <div className="flex flex-col gap-[11px]">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="text-[14px] text-white/60 no-underline transition-colors hover:text-[#c79a4b]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
