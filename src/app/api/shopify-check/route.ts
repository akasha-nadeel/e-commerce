/**
 * Dev-only sanity check for the Shopify Storefront connection.
 *
 * After filling in .env.local and restarting `npm run dev`, visit
 *   http://localhost:3000/api/shopify-check
 * It reports whether the env is set, whether the token/queries work, and a
 * sample of transformed products. Returns 404 in production. Never prints the
 * token.
 */
import { fetchProducts, isShopifyConfigured } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  if (!isShopifyConfigured) {
    return Response.json({
      configured: false,
      message:
        "Shopify env not set. Copy .env.example to .env.local, add " +
        "SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_ACCESS_TOKEN, then restart " +
        "the dev server.",
    });
  }

  try {
    const products = await fetchProducts({ first: 5 });
    return Response.json({
      configured: true,
      ok: true,
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
      apiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-10",
      productCount: products.length,
      note:
        products.length === 0
          ? "Connected, but no products came back — add products and make sure " +
            "they're published to the sales channel your token can read."
          : "Connected — Storefront API, token and transform are all working.",
      sample: products.map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        priceLKR: p.priceLKR,
        compareAtLKR: p.compareAtLKR,
        colors: p.colors.map((c) => c.name),
        sizes: p.sizes.map((s) => `${s.label}${s.available ? "" : " (out)"}`),
        images: p.images.length,
      })),
    });
  } catch (err) {
    return Response.json({
      configured: true,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      hint:
        "Common causes: wrong token or store domain, an unsupported " +
        "SHOPIFY_API_VERSION, or the app missing the " +
        "unauthenticated_read_product_listings scope.",
    });
  }
}
