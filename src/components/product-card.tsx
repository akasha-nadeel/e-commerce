"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Product } from "@/lib/catalog";
import { formatLKR } from "@/lib/format";
import { useIntroPlayed } from "./motion-gate";
import { MediaTile } from "./media-tile";
import { CountUpPrice } from "./ui/count-up-price";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Minimal PLP card: image, title, colourway, price and a row of colour chips.
 * The whole card reveals as ONE lightweight fade+rise when it scrolls into view
 * (kept to a single motion layer so a full row/grid doesn't jank the scroll),
 * and the price counts 0 → value once visible. `delay` staggers cards.
 */
export function ProductCard({
  product,
  inGrid = false,
  delay = 0,
}: {
  product: Product;
  /** Fill the parent grid cell instead of the fixed carousel width. */
  inGrid?: boolean;
  /** Stagger offset (s) added to this card's reveal. */
  delay?: number;
}) {
  const href = `/products/${product.slug}`;
  const onSale = !!product.compareAtLKR;
  const reduce = useReducedMotion();
  const played = useIntroPlayed();

  const className = `group relative ${
    inGrid ? "w-full" : "w-[clamp(238px,25vw,300px)] shrink-0 snap-start"
  }`;

  const body = (
    <>
      <MediaTile
        label={product.cardLabel}
        src={product.images[0]?.src}
        hoverSrc={product.images[1]?.src}
        alt={product.name}
        aspect={product.square ? "1/1" : "3/4"}
        hoverZoom={false}
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
          <CountUpPrice value={product.priceLKR} />
        </span>
      </div>

      {product.colors.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {product.colors.slice(0, 5).map((c, i) => (
            <span
              key={c.name}
              title={c.name}
              className={`relative block h-[38px] w-[31px] overflow-hidden rounded-[4px] border transition-colors ${
                i === 0 ? "border-[#0c0c0d]" : "border-black/10"
              }`}
              style={c.image ? undefined : { background: c.swatch }}
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  quality={100}
                  sizes="31px"
                  className="object-cover"
                />
              )}
            </span>
          ))}
        </div>
      )}
    </>
  );

  // Static once the intro has already played this session (or for reduced
  // motion): render a plain div so the card is visible immediately. A motion.div
  // would otherwise keep the inline opacity:0 from its `initial` frozen when the
  // animation props drop on the mid-session `played` flip (see `MotionGate`).
  if (reduce || played) {
    return <div className={className}>{body}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {body}
    </motion.div>
  );
}
