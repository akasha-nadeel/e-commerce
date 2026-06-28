import type { ReactNode } from "react";

/**
 * Moving "Pay Your Way" partner strip below the hero — the real payment & BNPL
 * providers this store is built around (see the headless checkout design doc:
 * PayHere core + PayPal + cards, with local installment providers). Brand-accurate
 * inline SVG/wordmarks on a clean light strip; pure-CSS infinite marquee that
 * pauses on hover and respects reduced motion.
 */

const BRANDS: { name: string; node: ReactNode }[] = [
  {
    name: "Visa",
    node: (
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 28,
          color: "#1434CB",
          letterSpacing: "0.01em",
        }}
      >
        VISA
      </span>
    ),
  },
  {
    name: "Mastercard",
    node: (
      <svg width="48" height="30" viewBox="0 0 48 30" role="img" aria-label="Mastercard">
        <circle cx="19" cy="15" r="12" fill="#EB001B" />
        <circle cx="29" cy="15" r="12" fill="#F79E1B" />
        <path d="M24 6.2a12 12 0 0 1 0 17.6 12 12 0 0 1 0-17.6Z" fill="#FF5F00" />
      </svg>
    ),
  },
  {
    name: "American Express",
    node: (
      <span
        style={{
          background: "#1F72CF",
          color: "#fff",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: "0.06em",
          padding: "7px 9px",
          borderRadius: 4,
        }}
      >
        AMEX
      </span>
    ),
  },
  {
    name: "PayPal",
    node: (
      <span
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 24,
        }}
      >
        <span style={{ color: "#003087" }}>Pay</span>
        <span style={{ color: "#009CDE" }}>Pal</span>
      </span>
    ),
  },
  {
    name: "PayHere",
    node: (
      <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em" }}>
        <span style={{ color: "#1AC0E8" }}>Pay</span>
        <span style={{ color: "#16223C" }}>Here</span>
      </span>
    ),
  },
  {
    name: "Koko",
    node: (
      <span
        style={{
          background: "#101010",
          color: "#C9F73B",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: "0.02em",
          padding: "5px 11px",
          borderRadius: 5,
        }}
      >
        koko
      </span>
    ),
  },
  {
    name: "Mintpay",
    node: (
      <span style={{ fontWeight: 700, fontSize: 21, color: "#1FBF8F", letterSpacing: "-0.01em" }}>
        mintpay
      </span>
    ),
  },
];

export function LogoMarquee() {
  return (
    <section aria-label="Accepted payment partners" className="border-y border-[#ececee] bg-white py-9">
      <p className="mb-7 text-center text-[12px] font-semibold uppercase tracking-[0.28em] text-[#8a8a8e]">
        Pay Your Way · Secure Checkout
      </p>

      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-28" />

        <div className="flex w-max animate-marquee items-center [animation-play-state:running] hover:[animation-play-state:paused]">
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center" aria-hidden={half === 1}>
              {BRANDS.map((b) => (
                <div
                  key={b.name}
                  className="flex h-10 shrink-0 items-center justify-center px-8 grayscale transition-[filter,opacity] duration-300 hover:grayscale-0 sm:px-14 [opacity:0.85] hover:[opacity:1]"
                  title={b.name}
                >
                  {b.node}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
