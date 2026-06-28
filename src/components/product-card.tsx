"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatLKR } from "@/lib/format";
import { useCart } from "./cart-provider";
import { MediaTile } from "./media-tile";

export function ProductCard({
  product,
  quickAdd = false,
  inGrid = false,
}: {
  product: Product;
  quickAdd?: boolean;
  /** Fill the parent grid cell instead of the fixed carousel width. */
  inGrid?: boolean;
}) {
  const { add } = useCart();
  const href = `/products/${product.slug}`;

  const defaultSize =
    product.sizes.find((s) => s.available)?.label ??
    product.sizes[0]?.label ??
    "OS";

  const handleQuickAdd = () =>
    add({
      slug: product.slug,
      name: product.name,
      colorName: product.colors[0].name,
      size: defaultSize,
      priceLKR: product.priceLKR,
      image: product.images[0]?.src,
    });

  return (
    <div
      className={`group ${
        inGrid ? "w-full" : "w-[clamp(238px,25vw,300px)] shrink-0 snap-start"
      }`}
    >
      <div className="relative">
        <MediaTile
          label={product.cardLabel}
          src={product.images[0]?.src}
          hoverSrc={product.images[1]?.src}
          alt={product.name}
          aspect={product.square ? "1/1" : "3/4"}
        >
          {/* Full-cover navigation link over the images. */}
          <Link
            href={href}
            aria-label={`View ${product.name}`}
            className="absolute inset-0 z-10"
          />
        </MediaTile>
      </div>

      <div className="mb-[9px] mt-[13px] flex gap-[7px]">
        {product.colors.slice(0, 5).map((c) => (
          <span
            key={c.name}
            title={c.name}
            className="h-3.5 w-3.5 rounded-full border border-black/[0.18]"
            style={{ background: c.swatch }}
          />
        ))}
      </div>

      <Link
        href={href}
        className="block text-[15px] font-bold text-[#0c0c0d] no-underline transition-colors hover:text-[#c79a4b]"
      >
        {product.name}
      </Link>
      <div className="mb-1.5 mt-0.5 text-[13px] text-[#8a8a8e]">
        {product.colorName}
      </div>
      <div className="text-[14px] font-semibold">{formatLKR(product.priceLKR)}</div>

      {/* Action stack — primary (Quick Add, filled) on top, secondary
          (View Product, outline) below. Both always visible so they work on
          touch, unlike a hover-only overlay. */}
      <div className="mt-3.5 flex flex-col gap-2.5">
        {quickAdd && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0c0c0d] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
          >
            Quick Add
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
          </button>
        )}
        <Link
          href={href}
          className="group/btn flex w-full items-center justify-center gap-2 rounded-full border border-[#0c0c0d] py-3 text-[13px] font-semibold text-[#0c0c0d] no-underline transition-colors hover:bg-[#0c0c0d] hover:text-white"
        >
          View Product
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            className="transition-transform duration-200 group-hover/btn:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
