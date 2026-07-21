/**
 * Shipping rates, delivery estimates and the returns window.
 *
 * Single source of truth, shared by the checkout engine
 * (`checkout/checkout-client.tsx`), the public policy page
 * (`/shipping-returns`), the footer trust band and the `OfferShippingDetails`
 * / `MerchantReturnPolicy` structured data in `seo.ts`.
 *
 * Keeping these in one place is a correctness requirement, not tidiness: a
 * published policy or a schema.org rate that disagrees with what the customer
 * is actually charged is a consumer-protection problem, and Google demotes
 * merchant listings whose structured data contradicts the page.
 *
 * Rates are LKR. Sri Lanka is the home market; everywhere else is "worldwide".
 */

export const FREE_SHIPPING_THRESHOLD_LKR = 20000;

/** Days a customer has to start a return. */
export const RETURN_WINDOW_DAYS = 14;

export interface ShippingOption {
  /** Flat rate in LKR, before the free-shipping threshold is applied. */
  rateLKR: number;
  /** Human-readable delivery estimate. */
  estimate: string;
}

export const SHIPPING: Record<
  "local" | "international",
  Record<"standard" | "express", ShippingOption>
> = {
  local: {
    standard: { rateLKR: 350, estimate: "2–4 business days" },
    express: { rateLKR: 900, estimate: "1–2 business days" },
  },
  international: {
    standard: { rateLKR: 4500, estimate: "7–14 business days" },
    express: { rateLKR: 7500, estimate: "3–5 business days" },
  },
};

/**
 * What a customer actually pays. Free shipping applies to local standard
 * delivery only — express is always charged, and the threshold doesn't apply
 * to international orders.
 */
export function shippingCost(
  isLocal: boolean,
  method: "standard" | "express",
  subtotalLKR: number,
): number {
  const option = SHIPPING[isLocal ? "local" : "international"][method];
  if (isLocal && method === "standard" && subtotalLKR >= FREE_SHIPPING_THRESHOLD_LKR) {
    return 0;
  }
  return option.rateLKR;
}

/** Cash on Delivery is a Sri-Lanka-only payment method. */
export const COD_COUNTRY = "Sri Lanka";
