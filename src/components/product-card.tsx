import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatLKR } from "@/lib/format";
import { MediaTile } from "./media-tile";

/**
 * Minimal PLP card: image, title, colourway, price and a row of colour chips.
 * No quick-add — the whole card links through to the PDP, keeping the grid calm
 * and letting the product photography do the work.
 */
export function ProductCard({
  product,
  inGrid = false,
}: {
  product: Product;
  /** Fill the parent grid cell instead of the fixed carousel width. */
  inGrid?: boolean;
}) {
  const href = `/products/${product.slug}`;
  const onSale = !!product.compareAtLKR;

  return (
    <div
      className={`group ${
        inGrid ? "w-full" : "w-[clamp(238px,25vw,300px)] shrink-0 snap-start"
      }`}
    >
      <MediaTile
        label={product.cardLabel}
        src={product.images[0]?.src}
        hoverSrc={product.images[1]?.src}
        alt={product.name}
        aspect={product.square ? "1/1" : "3/4"}
      >
        <Link
          href={href}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-10"
        />
      </MediaTile>

      <Link
        href={href}
        className="mt-3.5 block text-[15px] font-semibold uppercase leading-tight tracking-[0.01em] text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
      >
        {product.name}
      </Link>

      <div className="mt-1 text-[13px] text-[#8a8a8e]">{product.colorName}</div>

      <div className="mt-1.5 flex items-baseline gap-2 text-[14px]">
        {onSale && (
          <span className="text-[#8a8a8e] line-through">
            {formatLKR(product.compareAtLKR!)}
          </span>
        )}
        <span className="font-medium text-[#0c0c0d]">
          {formatLKR(product.priceLKR)}
        </span>
      </div>

      {product.colors.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.colors.slice(0, 5).map((c, i) => (
            <span
              key={c.name}
              title={c.name}
              className={`h-[22px] w-[22px] rounded-[5px] border transition-colors ${
                i === 0 ? "border-[#0c0c0d]" : "border-black/10"
              }`}
              style={{ background: c.swatch }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
