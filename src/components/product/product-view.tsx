"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";

/**
 * Client shell that owns the selected colour, so choosing a colour in the
 * purchase panel switches the gallery to that colour's image.
 */
export function ProductView({ product }: { product: Product }) {
  const [colorIdx, setColorIdx] = useState(0);
  const activeColorImage = product.colors[colorIdx]?.image;

  // Picking a gallery image selects its matching colour (reverse of the swatch
  // → image link), so the swatch and the photo stay in sync both ways.
  function handleImageChange(src: string) {
    const idx = product.colors.findIndex((c) => c.image === src);
    if (idx >= 0) setColorIdx(idx);
  }

  return (
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
      <ProductGallery
        images={product.images}
        name={product.name}
        activeColorImage={activeColorImage}
        onImageChange={handleImageChange}
      />
      <PurchasePanel
        product={product}
        colorIdx={colorIdx}
        onColorChange={setColorIdx}
      />
    </section>
  );
}
