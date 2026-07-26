"use client";

import Image from "next/image";
import { formatLKR } from "@/lib/format";
import { CheckItem } from "./ui";

/**
 * Live preview of the product card, plus the publish checklist.
 *
 * This is the single most valuable thing on the screen for a non-technical
 * owner: it renders the same layout `product-card.tsx` puts on the storefront —
 * 3:4 media (1:1 for accessories), uppercase name, colourway, strike-through
 * sale price, swatch row — so he can see the result *before* committing rather
 * than saving and then going to look.
 *
 * It is a deliberate visual copy rather than a reuse of `ProductCard`, because
 * that component takes a full `Product` (slug, variants, Shopify ids) which
 * doesn't exist until the thing is saved. Keep the two in step if the card
 * design changes.
 */

export interface PreviewColor {
  name: string;
  hex: string;
  image?: string;
}

export function ProductPreview({
  name,
  priceLKR,
  compareAtLKR,
  colors,
  heroImage,
  square,
  badge,
  visible,
  checklist,
}: {
  name: string;
  priceLKR: number;
  compareAtLKR?: number;
  colors: PreviewColor[];
  heroImage?: string;
  square?: boolean;
  badge?: string;
  visible: boolean;
  checklist: { label: string; done: boolean }[];
}) {
  const onSale = Boolean(compareAtLKR && compareAtLKR > priceLKR);
  const remaining = checklist.filter((c) => !c.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a8a8e]">
          How it will look
        </p>

        <div className="border border-[#e7e6e9] bg-white p-4">
          {/* Media */}
          <div
            className="relative overflow-hidden bg-[#f5f5f6]"
            style={{ aspectRatio: square ? "1 / 1" : "3 / 4" }}
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt=""
                fill
                quality={100}
                unoptimized={heroImage.startsWith("blob:")}
                sizes="(max-width: 1024px) 90vw, 320px"
                className="object-cover"
              />
            ) : (
              <div className="tile-texture-light absolute inset-0 grid place-items-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a3a3a8]">
                  Add a photo
                </span>
              </div>
            )}

            {badge && (
              <span className="absolute left-0 top-0 bg-[#0c0c0d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                {badge}
              </span>
            )}
            {!visible && (
              <span className="absolute right-0 top-0 bg-[#eec449] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0c0c0d]">
                Draft
              </span>
            )}
          </div>

          {/* Copy — mirrors product-card.tsx */}
          <p className="mt-3.5 text-[15px] font-semibold uppercase leading-tight tracking-[0.01em] text-[#0c0c0d]">
            {name.trim() || "Product name"}
          </p>
          <p className="mt-1 text-[13px] text-[#8a8a8e]">
            {colors[0]?.name ?? "Colour"}
          </p>

          <div className="mt-1.5 flex items-baseline gap-2 text-[14px]">
            {onSale && (
              <span className="text-[#8a8a8e] line-through">
                {formatLKR(compareAtLKR as number)}
              </span>
            )}
            <span className="font-medium text-[#0c0c0d]">
              {priceLKR > 0 ? formatLKR(priceLKR) : "LKR —"}
            </span>
          </div>

          {colors.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {colors.slice(0, 5).map((c, i) => (
                <span
                  key={c.name}
                  title={c.name}
                  className={`relative block h-[38px] w-[31px] overflow-hidden rounded-[4px] border ${
                    i === 0 ? "border-[#0c0c0d]" : "border-black/10"
                  }`}
                  style={c.image ? undefined : { background: c.hex }}
                >
                  {c.image && (
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      quality={100}
                      unoptimized={c.image.startsWith("blob:")}
                      sizes="31px"
                      className="object-cover"
                    />
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checklist — every requirement at once, not just the next blocker. */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a8a8e]">
          {remaining === 0 ? "Ready" : `${remaining} left`}
        </p>
        <ul className="flex flex-col gap-2">
          {checklist.map((c) => (
            <CheckItem key={c.label} done={c.done}>
              {c.label}
            </CheckItem>
          ))}
        </ul>
      </div>
    </div>
  );
}
