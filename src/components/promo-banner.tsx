"use client";

import Image from "next/image";
import { useState } from "react";

const CODE = "EGAL20";

// Heading / button styling follows the "Shoppin Land" reference: dark slate
// copy left-aligned over the yellow shopping photo, with a coral-red CTA. The
// scrim uses the photo's own yellow (#eaac33) so the text side blends seamlessly.
const INK = "#1f2a44";

/**
 * First-order promo-code banner. Yellow lifestyle photo background with a dark
 * left-aligned headline, a coral "Shop" button and a copy-to-clipboard code.
 * Sits below "Shop The Latest Styles" on the home page.
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
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-3xl bg-[#eaac33]">
        {/* Lifestyle photo — models sit on the right; copy lives over the left */}
        <Image
          src="/promo-shopping.png"
          alt="Two friends excitedly shopping online together"
          fill
          quality={100}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="object-cover object-[72%_center]"
        />
        {/* Yellow scrim keeps the dark copy legible over the photo on mobile,
            where the models fill the frame. Tablet/desktop show the photo with
            no overlay — there the copy sits over the empty yellow on the left. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#eaac33] via-[#eaac33]/85 to-[#eaac33]/10 sm:hidden"
        />

        <div className="relative px-7 py-14 sm:px-12 sm:py-20 lg:py-24">
          <div className="max-w-[480px]">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: INK, opacity: 0.7 }}
            >
              First Order Offer
            </p>

            <h2
              className="mt-3 text-[clamp(30px,4.4vw,52px)] font-extrabold leading-[1.08]"
              style={{ color: INK }}
            >
              Enjoy 20% Off
              <br />
              Your First Order
            </h2>

            <div className="mt-7">
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy discount code ${CODE}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ef4444] px-7 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#dc2626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ef4444]"
              >
                {copied ? "Code Copied ✓" : `Copy Code · ${CODE}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
