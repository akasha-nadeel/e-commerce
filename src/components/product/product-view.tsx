"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";

/**
 * Client shell that owns the selected colour so the purchase panel drives the
 * cart variant, and the gallery highlights that colour's image.
 */
export function ProductView({
  product,
  reviewAverage = 0,
  reviewCount = 0,
}: {
  product: Product;
  reviewAverage?: number;
  reviewCount?: number;
}) {
  const [colorIdx, setColorIdx] = useState(0);
  const activeColor = product.colors[colorIdx]?.name;

  return (
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 px-5 pb-16 pt-3 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
      {/* Gallery pins while the (usually taller) details column scrolls, so
          both columns end on the same line — the Carnage/editorial pattern. */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductGallery
          images={product.images}
          name={product.name}
          activeColor={activeColor}
        />
      </div>
      <PurchasePanel
        product={product}
        colorIdx={colorIdx}
        onColorChange={setColorIdx}
        reviewAverage={reviewAverage}
        reviewCount={reviewCount}
      />
    </section>
  );
}
