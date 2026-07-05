/**
 * Currency formatting for the storefront.
 *
 * v1 prices are LKR for every visitor (see design doc — multi-currency USD
 * display is a documented phase-2 upgrade via Shopify Markets). International
 * cards still convert at pay time through PayHere.
 */
// Built once and reused — creating a formatter per call is costly when the
// price counter formats ~60×/second per card.
const LKR = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatLKR(amount: number): string {
  return `LKR ${LKR.format(amount)}`;
}

/** Three interest-free installments, matching the PDP copy. */
export function installment(amount: number): string {
  return formatLKR(amount / 3);
}

/** Whole-number discount percentage from a sale + compare-at price. */
export function discountPercent(price: number, compareAt: number): number {
  return Math.round((1 - price / compareAt) * 100);
}
