# Golden Egal — Storefront

Premium headless e-commerce storefront for **Golden Egal**, a Sri Lankan
men's & women's T-shirt / athleisure brand. Built with **Next.js 16 (App
Router) + React 19 + TypeScript + Tailwind v4**, designed to run as the custom
frontend for a **Shopify** backend.

The UI recreates the approved Claude Design prototype (`docs/design-reference/`):
a Carnage-style aesthetic — black `#0c0c0d` + gold `#c79a4b` accent, Archivo
display type, big italic uppercase headlines, scroll-snap product carousels,
colour swatches and a faceted size grid.

## What's implemented

| Area | Status |
| --- | --- |
| Home page (hero, latest styles, campaign, categories, activity switch, accessories, perks) | ✅ |
| Product detail page (`/products/[slug]`) — gallery, sticky buy panel, colour/size selection, add-to-cart, details accordion, related carousel | ✅ |
| **Collection / listing pages** (`/collections/[slug]` — all/new/men/women/accessories) — faceted **filtering** (size, colour family, price, category) + **sorting**, URL-synced, filter drawer, active-filter chips, empty state | ✅ |
| **Search** (`/search`) — live as-you-type filtering with popular-search chips and empty state | ✅ |
| Product cards — **hover image-swap** to the second angle (premium PLP touch) | ✅ |
| Cart drawer — **free-shipping progress bar** ("LKR X away from free shipping") | ✅ |
| **Account page** (`/account`) — passwordless sign-in form + Track Order / Returns / Size Guide help anchors | ✅ |
| **Checkout** (`/checkout`) — address form, order summary, **conditional COD** (Sri Lanka only) + PayHere/PayPal, order-confirmed state | ✅ |
| **Slide-in cart drawer** — real line items (merge by variant), qty +/−, remove, subtotal, opens on add | ✅ |
| Sticky black nav + hover **mega-menu** + responsive mobile menu; every nav/footer/CTA link resolves | ✅ |
| Eagle logo (white on dark, black on light) + Archivo type system | ✅ |
| On-page SEO — per-page metadata, Open Graph, **Product JSON-LD**, canonical | ✅ |
| 13 products + 5 collections statically generated (SSG) | ✅ |

> **Nav note:** information architecture is **NEW IN · MEN · WOMEN · ACCESSORIES**
> (apparel convention, mega-menus on Men/Women). `NEW IN` fills the slot the client
> hasn't committed to Gift Cards for — swap that `NAV` entry in `site-header.tsx`
> when confirmed. The search icon opens `/search`.

## Architecture

The catalog lives in [`src/lib/catalog.ts`](src/lib/catalog.ts) as typed mock
data. **This is the Shopify integration seam** — swapping those functions for
Shopify Storefront API (GraphQL) calls leaves every component unchanged. See
[`docs/plans/2026-06-17-golden-egal-storefront-design.md`](docs/plans/2026-06-17-golden-egal-storefront-design.md)
for the full backend/checkout/payments plan (Shopify hosted checkout, PayHere +
COD + PayPal, conditional COD-by-country, warehouse email).

```
src/
  app/
    layout.tsx                 # Archivo font, SEO defaults, header/footer, cart provider
    page.tsx                   # Home
    products/[slug]/page.tsx    # Product detail (SSG + JSON-LD)
  components/
    site-header.tsx            # nav + mega-menu + mobile menu (client)
    site-footer.tsx
    logo.tsx                   # eagle + wordmark, light/dark variants
    cart-provider.tsx          # cart count context (client)
    carousel-row.tsx           # scroll-snap row + arrows (client)
    product-card.tsx           # card w/ optional quick-add (client)
    media-tile.tsx             # image / labelled placeholder tile
    activity-switch.tsx        # mens/womens toggle (client)
    newsletter-form.tsx        # footer signup (client)
    product/purchase-panel.tsx # PDP buy column (client)
  lib/
    catalog.ts                 # products (→ swap for Shopify Storefront API)
    format.ts                  # LKR currency + installments
public/
  logo-eagle.png               # white master (dark surfaces)
  logo-eagle-black.png         # black master (light surfaces / favicon)
```

## Develop

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (also typechecks + SSG)
npm run lint
```

## Notes

- Each product shows a **temporary placeholder photo** (`public/products/<slug>.jpg`,
  imported via `scripts/import-placeholder-images.mjs`) as its card + PDP hero
  shot; the remaining PDP gallery angles stay as labelled tiles. Real photos
  replace these via `images[].src` (Shopify CDN) with no layout change.
- Prices are **LKR** for all visitors in v1; USD display (Shopify Markets) is a
  documented phase-2 upgrade.
- `docs/design-reference/` is the original design bundle (excluded from lint).
