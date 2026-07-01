# Shopify integration

The storefront is headless: this repo owns catalog/product/cart **UI**; Shopify
owns checkout, payments and orders. See
[`docs/plans/2026-06-17-golden-egal-storefront-design.md`](plans/2026-06-17-golden-egal-storefront-design.md)
for the architecture decisions.

## The catalog seam

- `src/lib/catalog.ts` — typed **mock** data + the `Product` type. Still the
  source of truth for the UI today.
- `src/lib/shopify/` — the **live** data layer against the Storefront API,
  producing the exact same `Product` shape:
  - `client.ts` — `shopifyFetch()` (GraphQL POST, caching + tags) and
    `isShopifyConfigured`.
  - `queries.ts` — GraphQL documents.
  - `transform.ts` — Storefront product → `Product`.
  - `index.ts` — async accessors: `fetchProductByHandle`, `fetchProducts`,
    `fetchCollectionProducts`, `fetchAllHandles`.

Nothing consumes `src/lib/shopify/` yet, so the mock site is unchanged.

## Setup

1. Shopify admin → **Settings → Apps and sales channels → Develop apps** →
   create an app → enable **Storefront API** scopes → Install → copy the
   **Storefront API access token** (public / read-only).
2. `cp .env.example .env.local` and fill in `SHOPIFY_STORE_DOMAIN`,
   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`.
3. Restart `npm run dev` (env changes aren't hot-reloaded).
4. **Verify:** open `http://localhost:3000/api/shopify-check` — a dev-only
   route that reports whether the token/queries work and prints a sample of
   transformed products. (Returns 404 in production; never prints the token.)

### Product data expectations

The transform maps by convention:

- Variant options named **`Color`** and **`Size`** → colour swatches + size grid.
- `productType` → `category` (Men / Women / Accessories).
- Prices → `priceLKR` / `compareAtLKR` (store currency should be **LKR**).
- Metafields (optional, until set up): `reviews.rating_value`,
  `reviews.rating_count`, `custom.badge`, `custom.color_swatches`
  (JSON `{"Jet Black":"#111"}`) for exact swatch hexes.

## Remaining wiring (flip mocks → Shopify)

1. Point the page/route consumers at the async accessors: make the Server
   Components `await fetchProducts()` / `fetchProductByHandle(slug)` etc.
   (they're already `async`), replacing the mock constants
   (`latestStyles`, `getProduct`, `relatedTo`, …).
2. `generateStaticParams` → `fetchAllHandles()`.
3. Cart via the Storefront `Cart` object → redirect to `cart.checkoutUrl`
   (replaces the in-memory `cart-provider`).
4. Collection/search filters via Shopify **Search & Discovery** `filters`.
5. Customer Account API for login + orders.

Keep the mock backorder helpers (`isBackorderSize`, `queuePosition`, …) until
real inventory (policy `CONTINUE`) + the FCFS queue land in Shopify.
