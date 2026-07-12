"use client";

import Image from "next/image";
import { useState } from "react";
import { Reveal } from "@/components/ui/reveal";

const CODE = "EAGLE20";

// The CTA is tinted to the model's light-blue dress (sampled from the photo)
// so the button reads as part of the shot; dark ink text keeps it legible.
const DRESS = "#9db6db";
const DRESS_HOVER = "#87a3ca";

/**
 * First-order promo-code banner. A shopping lifestyle photo on a black
 * background: the model sits on the right, white copy on the empty black left,
 * and a dress-blue copy-to-clipboard CTA. Sits below "Shop The Latest Styles".
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
    <section className="mx-auto my-12 max-w-[1400px] px-5 sm:px-8">
      <div className="relative overflow-hidden bg-black">
        {/* Lifestyle photo — model on the right; copy over the black left. */}
        <Reveal className="absolute inset-0">
          <Image
            src="/promo-shopping-v2.webp"
            alt="Smiling woman in a light-blue dress holding shopping bags"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover object-[72%_40%]"
          />
        </Reveal>
        {/* Black scrim keeps the white copy legible over the photo on mobile,
            where the model fills the frame. Tablet/desktop already have empty
            black on the left, so the gradient just reinforces it. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/10"
        />

        <div className="relative px-7 py-14 sm:px-12 sm:py-20 lg:py-24">
          <div className="max-w-[480px]">
            <Reveal delay={0.1}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-white/70">
                First Order Offer
              </p>

              <h2 className="mt-3 text-[clamp(30px,4.4vw,52px)] font-extrabold leading-[1.08] text-white">
                Enjoy 20% Off
                <br />
                Your First Order
              </h2>
            </Reveal>

            <Reveal delay={0.2} className="mt-7">
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy discount code ${CODE}`}
                style={{ backgroundColor: DRESS }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = DRESS_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = DRESS;
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 text-[14px] font-semibold text-[#0c0c0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9db6db]"
              >
                {copied ? "Code Copied ✓" : `Copy Code · ${CODE}`}
              </button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
