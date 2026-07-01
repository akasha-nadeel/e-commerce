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

## Status

**Done** (live Shopify data via `src/lib/products.ts`, mock fallback via
`isShopifyConfigured`):

- Product detail, home, collections (men/women/accessories/new/all) and search
  pages consume the async accessors; `generateStaticParams` → `fetchAllHandles`.
- Cart → **Shopify hosted checkout**: cart lines carry the variant id;
  `src/lib/actions/checkout.ts` runs `cartCreate` and redirects to
  `cart.checkoutUrl`. Falls back to the local `/checkout` in mock mode.

**Pending** (backend paused to focus on frontend):

1. **Payments** — connect PayHere (+ COD). Needs the client's Sri Lankan
   business + bank account; decides the go-live path.
2. **Conditional COD by country** — payment-customization app in checkout.
3. **Customer accounts** — wire `/login` `/account` to the Customer Account API.
4. **Cart persistence** — the cart is in-memory per session; optionally persist
   the Shopify cart across reloads.
5. Reviews (metafields), Search & Discovery `filters`, warehouse email,
   store address → Sri Lanka.

Keep the mock backorder helpers (`isBackorderSize`, `queuePosition`, …) until
real inventory (policy `CONTINUE`) + the FCFS queue land in Shopify.
