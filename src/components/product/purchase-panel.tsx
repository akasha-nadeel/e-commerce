"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { BACKORDER_RESTOCK, isBackorderSize, queuePosition } from "@/lib/catalog";
import { discountPercent, formatLKR } from "@/lib/format";
import { useCart } from "@/components/cart-provider";
import { startCheckout } from "@/lib/actions/checkout";

export function PurchasePanel({
  product,
  colorIdx,
  onColorChange,
}: {
  product: Product;
  colorIdx: number;
  onColorChange: (i: number) => void;
}) {
  const { add } = useCart();
  const firstAvailable =
    product.sizes.find((s) => s.available)?.label ?? product.sizes[0]?.label ?? "";

  const [size, setSize] = useState(firstAvailable);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hasSizes = product.sizes.length > 1;
  const rating = product.rating ?? 4.8;
  const reviews = product.reviewCount ?? 124;
  const onSale = !!product.compareAtLKR && product.compareAtLKR > product.priceLKR;

  const activeSize = hasSizes ? size : product.sizes[0]?.label ?? "OS";
  const backorder = isBackorderSize(product, activeSize);
  const queuePos = backorder ? queuePosition(product.slug, activeSize) : 0;

  // Resolve the Shopify variant for the current Color/Size (undefined in mock mode).
  function currentVariantId(): string | undefined {
    const colorName = product.colors[colorIdx]?.name ?? "";
    const sizeLabel = hasSizes ? size : product.sizes[0]?.label ?? "OS";
    return product.variants?.find((v) =>
      v.selectedOptions.every((o) => {
        const n = o.name.toLowerCase();
        if (n === "color") return o.value === colorName;
        if (n === "size") return o.value === sizeLabel;
        return true;
      }),
    )?.id;
  }

  function addToCart() {
    add({
      slug: product.slug,
      name: product.name,
      colorName: product.colors[colorIdx]?.name ?? "",
      size: hasSizes ? size : "OS",
      priceLKR: product.priceLKR,
      image: product.colors[colorIdx]?.image ?? product.images[0]?.src,
      backorder,
      queuePosition: backorder ? queuePos : undefined,
      variantId: currentVariantId(),
    });
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1600);
  }

  // Skip the cart — build a one-item Shopify cart and go straight to checkout.
  async function buyNow() {
    setBuying(true);
    try {
      const url = await startCheckout([{ variantId: currentVariantId(), qty: 1 }]);
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      // fall through
    }
    // Mock mode / no variant: add to cart and open the local checkout.
    addToCart();
    setBuying(false);
    window.location.href = "/checkout";
  }

  const colorSelector = (
    <>
      <div className="text-[14px]">
        <span className="font-semibold">Color:</span>{" "}
        <span className="text-[#3a3a3e]">{product.colors[colorIdx].name}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {product.colors.map((c, i) => {
          const sel = colorIdx === i;
          return (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              aria-pressed={sel}
              title={c.name}
              onClick={() => onColorChange(i)}
              className={`relative h-[68px] w-[56px] shrink-0 overflow-hidden rounded-[6px] border transition-colors ${
                sel ? "border-[#0c0c0d]" : "border-[#e2e1e4] hover:border-[#0c0c0d]/40"
              }`}
              style={c.image ? undefined : { background: c.swatch }}
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  quality={100}
                  sizes="56px"
                  className="object-cover"
                />
              )}
              {sel && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[6px] ring-2 ring-inset ring-[#0c0c0d]"
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <div>
      {/* Color — mobile shows it right under the gallery, above the title */}
      <div className="mb-6 lg:hidden">{colorSelector}</div>

      {/* Badge */}
      {product.badge && (
        <span className="mb-4 inline-block rounded-full bg-[#f1f1f3] px-3 py-1 text-[12px] font-semibold text-[#3a3a3e]">
          {product.badge}
        </span>
      )}

      {/* Title */}
      <h1 className="display-tight m-0 text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.05]">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="mt-3 flex items-center gap-2">
        <Stars value={rating} />
        <span className="text-[14px] text-[#6a6a6e]">
          {rating.toFixed(1)} ({reviews} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-[28px] font-bold tracking-[-0.02em]">
          {formatLKR(product.priceLKR)}
        </span>
        {onSale && (
          <>
            <span className="text-[18px] text-[#9a9a9e] line-through">
              {formatLKR(product.compareAtLKR!)}
            </span>
            <span className="rounded-md bg-[#0c0c0d] px-2 py-1 text-[12px] font-bold text-white">
              {discountPercent(product.priceLKR, product.compareAtLKR!)}% OFF
            </span>
          </>
        )}
      </div>

      {/* Color — desktop keeps it in place, after the price */}
      <div className="hidden lg:block">
        <hr className="my-6 border-0 border-t border-[#e7e6e9]" />
        {colorSelector}
      </div>

      {/* Size */}
      {hasSizes && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-[14px]">
              <span className="font-semibold">Size:</span>{" "}
              <span className="text-[#3a3a3e]">{size}</span>
            </div>
            <Link
              href="/account#size-guide"
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#0c0c0d] no-underline hover:text-[#eec449]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 7l4-4 14 14-4 4z" />
                <path d="M9 9l2 2M12 6l2 2M6 12l2 2" />
              </svg>
              Size Guide
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2.5">
            {product.sizes.map((s) => {
              const sel = size === s.label;
              const oos = !s.available;
              return (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={sel}
                  title={oos ? "Out of stock — available on backorder" : undefined}
                  onClick={() => setSize(s.label)}
                  className="relative cursor-pointer rounded-none border py-3 text-[14px] font-semibold transition-colors"
                  style={{
                    background: sel ? "#0c0c0d" : "#fff",
                    color: sel ? "#fff" : oos ? "#9a9a9e" : "#0c0c0d",
                    borderColor: sel ? "#0c0c0d" : "#e2e1e4",
                  }}
                >
                  {s.label}
                  {oos && (
                    <span
                      aria-hidden
                      className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#eec449]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Backorder notice */}
      {backorder && (
        <div className="mt-6 flex items-start gap-2.5 border border-[#eec449]/45 bg-[#eec449]/10 px-3.5 py-3 text-[13px] leading-snug text-[#0c0c0d]">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#eec449"
            strokeWidth={1.9}
            className="mt-px shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>
            <span className="font-semibold">Out of stock — available on backorder.</span>{" "}
            {BACKORDER_RESTOCK}. You&apos;ll be{" "}
            <span className="font-semibold">#{queuePos}</span> in the fulfilment
            queue.
          </span>
        </div>
      )}

      {/* Buy now — straight to checkout */}
      <button
        type="button"
        onClick={buyNow}
        disabled={buying}
        className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-none border-2 border-[#0c0c0d] bg-white px-6 py-[16px] text-[15px] font-semibold text-[#0c0c0d] transition-colors hover:bg-[#0c0c0d] hover:text-white disabled:cursor-default disabled:opacity-70"
      >
        {buying ? "Redirecting…" : "Buy Now"}
      </button>

      {/* Add to cart */}
      <button
        type="button"
        onClick={addToCart}
        className={`mt-3 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-none px-6 py-[18px] text-[15px] font-semibold transition-colors ${
          backorder
            ? "bg-[#eec449] text-[#0c0c0d] hover:bg-[#b3863a] hover:text-white"
            : "bg-[#0c0c0d] text-white hover:bg-[#eec449] hover:text-[#0c0c0d]"
        }`}
      >
        {backorder ? (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        ) : (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 8h12l-1 12H7L6 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
        )}
        {backorder
          ? added
            ? "Added — On Backorder"
            : "Backorder Now"
          : added
            ? "Added to Cart"
            : "Add to Cart"}
      </button>

      {/* Trust badges */}
      <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#e7e6e9] pt-6">
        <Trust
          title="Free Shipping"
          sub="On orders over LKR 20,000"
          icon={
            <>
              <path d="M3 7h11v8H3z" />
              <path d="M14 10h4l3 3v2h-7z" />
              <circle cx="7" cy="18" r="1.6" />
              <circle cx="17.5" cy="18" r="1.6" />
            </>
          }
        />
        <Trust
          title="Easy Returns"
          sub="14-day return policy"
          icon={
            <>
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </>
          }
        />
        <Trust
          title="Secure Payment"
          sub="100% secure checkout"
          icon={
            <>
              <path d="M12 3l8 3v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </>
          }
        />
      </div>

      {/* Description */}
      <div className="mt-6 border-t border-[#e7e6e9] pt-6">
        <h2 className="mb-4 text-[16px] font-semibold text-[#0c0c0d]">
          Description
        </h2>
        {product.descriptionHtml ? (
          <div
            className="rich-text text-[14px] leading-[1.7] text-[#6a6a6e]"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <p className="m-0 text-[14px] leading-[1.7] text-[#6a6a6e]">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < full ? "#0c0c0d" : "#d7d6d9"}>
          <path d="M12 2l3 6.5 7 .8-5.2 4.7L18.4 21 12 17.3 5.6 21 7.2 14 2 9.3l7-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Trust({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c0c0d" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      <div>
        <div className="text-[12px] font-semibold leading-tight">{title}</div>
        <div className="mt-0.5 text-[11px] leading-tight text-[#8a8a8e]">{sub}</div>
      </div>
    </div>
  );
}

