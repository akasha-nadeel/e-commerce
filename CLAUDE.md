# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16, not your training data.** The line above pulls in `AGENTS.md`: APIs and conventions differ from older Next.js. Concretely in this repo, route `params`/`searchParams` are **Promises** you must `await` (see `src/app/products/[slug]/page.tsx`). Before writing routing/rendering/data-fetching code, read the relevant guide under `node_modules/next/dist/docs/` (e.g. `01-app/`).

## Project

**Golden Eagle** — a headless storefront for a Sri Lankan men's/women's T-shirt & athleisure brand. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. The **Shopify** backend is wired up: with store credentials in `.env.local` the catalog, cart, hosted checkout, customer accounts, and product reviews all run against Shopify; with no env set, each feature falls back to typed mock data so the app still runs standalone. The switch is **per-feature and automatic** — driven by env-detection flags (`isShopifyConfigured`, `isCustomerAuthConfigured`, `isAdminConfigured`), not a build flag.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build — also typechecks and runs SSG (use this to verify a change compiles)
npm run lint     # ESLint (flat config, next/core-web-vitals + next/typescript)
```

There is **no test runner** configured. `npm run build` is the typecheck/verification step. To check types without a full build, `npx tsc --noEmit`.

### Environment
Copy `.env.example` → `.env.local` to connect Shopify. Each feature is gated by its own flag, so wire them up independently (all optional — with none set everything runs on mocks):
- **Catalog + cart + checkout** — `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` → `isShopifyConfigured`
- **Customer accounts** — `SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID`, `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` → `isCustomerAuthConfigured`
- **Reviews** — `SHOPIFY_ADMIN_ACCESS_TOKEN` (secret) → `isAdminConfigured`
- `SHOPIFY_API_VERSION` defaults to `2025-10`.

After setting the Storefront env and restarting the dev server, hit **`/api/shopify-check`** (dev-only) to confirm the token/queries work and preview transformed products.

## Architecture

### The catalog seam — `products.ts` (entry) → `catalog.ts` (mocks) / `shopify/` (live)
The most important part of the app to understand. Three layers:

- **`src/lib/products.ts`** — the **unified entry point pages call** (`getProductBySlug`, `getAllProductSlugs`, `getCollectionProducts`, `getLatestStyles`, `getRelatedProducts`, `getAccessoryProducts`, `getRecommendedProducts`, `getAllProducts`). Each is `async` and returns live Shopify data when `isShopifyConfigured`, else the mock. **Route / data-fetching code must call `products.ts` — do not import `catalog.ts` or `shopify/` directly.** That indirection is what keeps the mock↔live swap a one-line env change and every consumer on a single `Product` shape.
- **`src/lib/catalog.ts`** — defines the `Product` type (+ `ProductColor`/`ProductSize`/`ProductImage`/`ProductVariant`) and holds all product data as **typed mocks**, plus the stock/backorder helpers (`isOutOfStock`, `isBackorderSize`, `queuePosition`, `BACKORDER_RESTOCK`). Merchandising metadata (ratings, review counts, `badge`, `compareAtLKR` sale prices) is derived deterministically at module load. Stock is per size variant (`ProductSize.available`); a sold-out variant reads as **backorder**, not hidden — the mock `queuePosition` stands in for the real FCFS allocation deferred to Shopify (inventory policy CONTINUE).
- **`src/lib/shopify/`** — the live half. `client.ts` (Storefront GraphQL `shopifyFetch` + `isShopifyConfigured`), `queries.ts`, `transform.ts` (maps a Storefront product onto the **same `Product` type** so consumers are unchanged; also resolves swatch colours and per-colour images), `index.ts` (async accessors + `createCart`). The Storefront token is deliberately **not** `NEXT_PUBLIC_` — `shopify/*` is **server-only**; import it only from Server Components / server code.

### Caching & revalidation — `src/lib/shopify/client.ts`
Storefront reads go through `shopifyFetch` with **ISR** (`next: { revalidate: 60 }`) plus **cache tags** (`products`, `product:<handle>`, `collection:<handle>`), so statically generated pages pick up Shopify edits within ~60s and can be busted on demand via `revalidateTag` from a Shopify webhook. Cart/checkout **mutations pass `cache: "no-store"`**. The Admin client (`shopify/admin.ts`) mirrors this: tagged+revalidated reads, no-store mutations.

### Checkout — `src/lib/actions/checkout.ts`
`startCheckout` (server action) builds a Shopify cart from the cart lines' variant ids (`createCart`) and returns Shopify's **hosted checkout URL**; the client redirects there. When Shopify isn't configured, or no line carries a variant id (mock mode), it returns `null` and the client falls back to the local `/checkout` page. Which gateway the hosted checkout uses is a Shopify-side concern (see domain constraints).

### Customer accounts — `src/lib/auth/`, `/api/auth/*`
Passwordless login via the **Shopify Customer Account API** (OAuth 2.0 Authorization Code + **PKCE**, hosted by Shopify). `customer-account.ts` holds endpoints + PKCE helpers; the `/api/auth/{login,callback,logout,me}` route handlers run the handshake; `session.ts` stores tokens in **httpOnly cookies** (`cust_at`/`cust_rt`/`cust_it`/`cust_exp`). There is **no proactive refresh** — an expired access token reads as logged-out. `/account` (Server Component) reads the session and queries the customer's profile + orders. Gated by `isCustomerAuthConfigured` (`SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID` + `_CLIENT_ID`).

### Product reviews — `src/lib/reviews.ts`
Custom reviews stored as Shopify **metaobjects** (type `ge_product_review`) via the **Admin API** (`shopify/admin.ts`, server-only). Submissions (`submitReview` server action) are created as **DRAFT / pending moderation**; only `ACTIVE` metaobjects render — approve them in Shopify admin (**Content → Metaobjects**). Optional review photos upload to Shopify Files first (`shopify/files.ts`: staged upload → `fileCreate`). Gated by `reviewsEnabled` (= `isAdminConfigured`). One-time setup: `node scripts/setup-reviews-metaobject.mjs` creates the metaobject definition.

### Faceted filtering — `src/lib/filters.ts`
Pure, dependency-free filter/sort helpers (`computeFacets`, `filterAndSort`, `filtersFromParams`, `filtersToParams`). They run on **both** server and client and (de)serialize `FilterState` to/from URL search params, so collection/search state is shareable and SSR-friendly. Facet shapes are designed to map onto Shopify's `filters`. Color names map to display "families" via `COLOR_NAME_TO_FAMILY`.

### Server/client split
- **Pages are Server Components** (`async`, `await params`). Routes that list things pair `generateStaticParams` + `generateMetadata` for SSG + per-page SEO. `src/app/products/[slug]` and `src/app/collections/[slug]` are statically generated.
- **Interactivity lives in client islands** marked `"use client"`: `cart-provider`, `site-header` (mega-menu), `collection/collection-browser`, `search/search-client`, `product/purchase-panel`, `carousel-row`. Client components that read URL search params are wrapped in `<Suspense>` by their server page (see the collection page).

### Cross-cutting providers in `src/app/layout.tsx`
`CartProvider` wraps the whole app and holds cart state in React context (`useCart`). Cart is **in-memory only** — no localStorage/persistence yet; lines merge by `slug::colorName::size`. `MotionGate` (`src/components/motion-gate.tsx`) gates the site's scroll-reveal entrance animations so they play **once per browser session** (flag in `sessionStorage`, `ge:intro-played`); read it via `useIntroPlayed()` in any animated client component so a plain refresh or later navigation doesn't replay them. `ChromeGate` (`src/components/chrome-gate.tsx`) hides the global header/footer on "bare" routes — `BARE_ROUTES` = `/login`, `/signup`, `/checkout` — which render their own full-screen layouts (note `/account` is *not* bare). Add a route to `BARE_ROUTES` if it needs the focused chrome-less treatment.

### Media — `src/components/media-tile.tsx`
Renders a real `next/image` when given `src`, otherwise a labelled placeholder tile. Product hero/second-angle photos live at `public/products/<slug>.jpg` (and `-2.jpg`), generated by the `scripts/*.mjs` (sharp). Real Shopify CDN images replace these via `images[].src` with no layout change; `cdn.shopify.com` is already allowlisted in `next.config.ts`.

### Styling — Tailwind v4, CSS-first
No `tailwind.config.js`. Tokens and theme live in `src/app/globals.css` via `@import "tailwindcss"` + `@theme inline`. Brand palette: ink `#0c0c0d`, gold `#c79a4b`, bone `#f3f1ea`. Type stack leads with Apple's SF Pro (`-apple-system`) and falls back to **Inter** (loaded via `next/font`) — despite the README mentioning "Archivo," the code uses Inter. Path alias `@/*` → `./src/*`. CTAs use the shared `Button` primitive (`src/components/ui/button.tsx`) — sharp-cornered, ink→gold on hover, renders a `<Link>` when given `href` else a `<button>`; reuse it rather than hand-rolling button classes. Animations use **`motion`** (the Framer Motion successor) — scroll reveals (`ui/reveal.tsx`), price count-ups (`count-up-price.tsx`, `ui/sliding-number.tsx`), carousels and hero. Gate any entrance animation behind `useIntroPlayed()` (see providers) to honour the once-per-session rule.

## Domain constraints

- **Currency is LKR for all visitors** in v1 (`src/lib/format.ts`); USD/Shopify Markets is a documented phase-2 item.
- **Payments are Sri-Lanka-specific:** PayHere is the core gateway; there is no Shopify Payments/Stripe; COD is conditional by country. The full backend/checkout/payments plan is `docs/plans/2026-06-17-golden-egal-storefront-design.md`.
- `docs/design-reference/` is the original Claude Design prototype bundle (the source of truth for visual design); it and `scripts/` are excluded from lint.
