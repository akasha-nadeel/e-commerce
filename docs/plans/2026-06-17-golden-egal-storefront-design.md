# Golden Egal — Headless Storefront Design & Decisions

_Date: 2026-06-17 · Stack: Next.js 16 (App Router) + Shopify (headless)_

## Summary

Premium custom Next.js storefront on a Shopify backend for a Sri Lankan
men's/women's T-shirt & athleisure brand. Storefront is fully bespoke (this
repo); checkout/payments/orders are handled by Shopify.

## Decisions

### Checkout architecture — **A: Shopify hosted checkout**
Next.js owns catalog + product + cart UI; at checkout we redirect to
`cart.checkoutUrl` (Shopify-hosted). Shopify carries PCI, fraud, tax. Cheapest
and most secure; no Shopify Plus required.

### Conditional COD by country — via app (not native)
Requirement: show **Cash on Delivery only for Sri Lanka**, hide it for
international addresses (show PayHere/PayPal only). Standard Shopify checkout
**cannot** do this natively (that's Plus/Checkout Blocks). Solved with a
payment-customization app — **HidePay / PayRules / Kip** (~$5–10/mo) — which
works on non-Plus plans and runs inside Shopify checkout where the address is
known.

### Payments
- **PayHere** — core gateway. Native Shopify app; handles **both local and
  international** Visa/MC/Amex + local wallets, settles to Sri Lankan banks.
  (Shopify Payments is not available in Sri Lanka.)
- **COD** — Shopify manual method, restricted to Sri Lanka via the app above.
- **PayPal** — fast-follow, **only after** confirming the client's account can
  *receive* (Sri Lanka receiving switched on ~May 2026; verify per account).
- **Stripe** — out of scope; not available to Sri Lankan entities, and PayHere
  already covers international cards.

### Warehouse notification — native
Shopify Settings → Notifications: add the warehouse email as an order
notification recipient. Auto-fires on every order; no custom integration.

### Product filtering — native Shopify (v1)
Shopify "Search & Discovery" defines size/colour/price/availability filters,
exposed via Storefront API collection `filters`; the storefront renders a custom
facet UI (swatches, size pills, URL-synced state). Algolia/Searchanise is a
documented upgrade path.

### v1 scope
Catalog + product + cart + **customer accounts** (Shopify passwordless) +
**editorial/lookbooks** (Shopify metaobjects), all in a bespoke UI.
**Deferred (phase 2):** wishlist, multi-currency USD (Shopify Markets), Stripe,
Algolia, Shopify Flow automations.

### SEO
Next.js App Router `generateMetadata` per page, Product JSON-LD, canonical URLs,
Open Graph, sitemap/robots, Core Web Vitals via `next/image` + SSG/ISR.

## Frontend status (this repo)
Home + Product detail pages implemented faithfully to the approved Claude Design
prototype. Catalog is typed mock data in `src/lib/catalog.ts` — the seam where
Shopify Storefront API calls plug in next.

## Open items / client confirmations
1. Shopify plan (Basic/Grow is sufficient — no Plus needed).
2. PayHere merchant registration + KYC approval (lead time).
3. Verify PayPal account can receive before wiring it.
4. Accept small Shopify third-party-gateway transaction fee (non-Plus).

## Next implementation phase
1. Connect `src/lib/catalog.ts` to Shopify Storefront API (GraphQL).
2. Cart via Storefront `Cart` object → `checkoutUrl` redirect.
3. Install + configure the hide-payment app for conditional COD.
4. Shopify "Search & Discovery" filters → collection/listing pages.
5. Customer Account API (login, orders) + metaobject lookbooks.
