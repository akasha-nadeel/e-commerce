"use client";

import Link from "next/link";
import { useState } from "react";

const CODE = "EGAL20";

/**
 * First-order discount banner — branded answer to the "use code" promo strip.
 * Ink gradient with gold glow accents and a copy-to-clipboard code pill. Sits
 * below "Shop The Latest Styles" on the home page.
 */
export function PromoBanner() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="my-12 px-5 sm:px-8">
      <div
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl"
        style={{
          background: "radial-gradient(130% 150% at 50% 0%, #1b1b1f 0%, #0c0c0d 58%)",
        }}
      >
        {/* Gold glow accents flanking the copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#c79a4b]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#c79a4b]/25 blur-3xl"
        />

        <div className="relative flex flex-col items-center px-6 py-14 text-center sm:py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Golden Egal Club · First Order
          </p>
          <h2 className="display-tight mt-4 text-[clamp(46px,8vw,92px)] font-semibold leading-none text-[#c79a4b]">
            20% Off
          </h2>
          <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/70">
            Enjoy 20% off your first Golden Egal order — premium tees, jerseys
            and athleisure, built from the ground up.
          </p>

          <button
            type="button"
            onClick={copy}
            aria-label={`Copy discount code ${CODE}`}
            className="group mt-7 inline-flex items-center gap-3 rounded-full border border-[#c79a4b]/50 bg-[#c79a4b]/10 px-6 py-3.5 text-[14px] font-semibold tracking-[0.04em] text-white transition-colors hover:border-[#c79a4b] hover:bg-[#c79a4b]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c79a4b]"
          >
            <span className="text-white/60">Use code:</span>
            <span className="font-bold tracking-[0.14em] text-[#c79a4b]">{CODE}</span>
            <span className="text-[12px] font-medium text-white/55 transition-colors group-hover:text-white/85">
              {copied ? "Copied ✓" : "Copy"}
            </span>
          </button>

          <p className="mt-5 max-w-[460px] text-[12px] text-white/40">
            Valid on your first purchase, up to LKR 3,000 off. Terms &amp;
            conditions apply.
          </p>

          <Link
            href="/collections/all"
            className="mt-6 text-[13px] font-semibold uppercase tracking-[0.08em] text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#c79a4b]"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
