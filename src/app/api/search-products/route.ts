import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";

// Revalidated every 60s (matches the catalog cache) — the search panel loads
// this once per session and filters client-side for instant results.
export const revalidate = 60;

export async function GET() {
  const products = await getAllProducts();
  const items = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    colorName: p.colorName,
    colors: p.colors.map((c) => ({ name: c.name, image: c.image ?? null })),
    priceLKR: p.priceLKR,
    compareAtLKR: p.compareAtLKR ?? null,
    image: p.images[0]?.src ?? null,
  }));
  return NextResponse.json(items);
}
