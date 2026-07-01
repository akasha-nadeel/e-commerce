"use server";

import { createCart, isShopifyConfigured } from "@/lib/shopify";

/**
 * Build a Shopify cart from the current cart lines and return its hosted
 * checkout URL. Returns null when Shopify isn't configured or no line carries a
 * variant id (mock mode) — the client then falls back to the local /checkout.
 */
export async function startCheckout(
  lines: { variantId?: string; qty: number }[],
): Promise<string | null> {
  if (!isShopifyConfigured) return null;
  const cartLines = lines
    .filter((l) => l.variantId)
    .map((l) => ({ merchandiseId: l.variantId as string, quantity: l.qty }));
  if (cartLines.length === 0) return null;
  return createCart(cartLines);
}
