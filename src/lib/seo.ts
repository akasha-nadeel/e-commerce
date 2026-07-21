/**
 * Site-wide SEO constants and schema.org JSON-LD builders.
 *
 * Everything that search engines and social crawlers need to describe the
 * store lives here, so the site identity (URL, brand, socials, merchant
 * policies) is declared once and reused by `layout.tsx`, the sitemap, the
 * robots file and every page that emits structured data.
 *
 * The linked-data model is a single `@graph` per page: a stable Organization
 * node (`ORG_ID`) and WebSite node (`WEBSITE_ID`) are emitted site-wide from
 * the root layout, and page-level nodes (Product, CollectionPage, Breadcrumb)
 * reference them by `@id` instead of restating them. That entity
 * consolidation is what lets Google merge the pages into one brand.
 */

import { FREE_SHIPPING_THRESHOLD_LKR, RETURN_WINDOW_DAYS } from "./shipping";

// Must be the host that actually serves a 200. The apex domain
// 308-redirects to www in production, so canonicals, sitemap <loc> entries and
// JSON-LD @ids all have to use www — pointing them at the redirecting apex
// makes Search Console file every URL under "Page with redirect".
export const SITE_URL = "https://www.goldeneagleclothing.com";
export const SITE_NAME = "Golden Eagle";
export const SITE_TAGLINE = "Own The Day";
export const CONTACT_EMAIL = "hello@goldeneagleclothing.com";

// ~150 characters: long enough to carry the brand promise and the geo term,
// short enough to survive Google's ~160-character snippet truncation intact.
export const SITE_DESCRIPTION =
  "Premium heavyweight tees, jerseys and athleisure for men and women in Sri Lanka. Built from the ground up — free island-wide delivery over LKR 20,000.";

/** Canonical (tracking-parameter-free) profile URLs for `sameAs`. */
export const SOCIAL_PROFILES = [
  "https://www.instagram.com/golden_eagle1976",
  "https://www.facebook.com/share/18dvMtfy7H/",
  "https://www.tiktok.com/@golden.eagle381",
];

// Merchant policies come from the shipping module the checkout itself uses, so
// structured data can't contradict what the customer is actually charged.
export { FREE_SHIPPING_THRESHOLD_LKR, RETURN_WINDOW_DAYS };

/**
 * Share card for pages that set their own `openGraph` block and so don't
 * inherit the generated card from `app/opengraph-image.tsx`. 1672×941 PNG —
 * close enough to the 1.91:1 OG ratio that platforms crop it cleanly.
 */
export const FALLBACK_OG_IMAGE = "/campaign-v2.png";

/** Stable node identifiers used for `@id` cross-references across pages. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Absolute URL for structured data. JSON-LD has no `metadataBase` equivalent,
 * so every `url`/`image` in a graph must be fully qualified. Pass-through for
 * URLs that are already absolute (Shopify CDN images).
 */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Wraps nodes in a single `@context` + `@graph` document. */
export function jsonLdGraph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/**
 * The store as an entity. `OnlineStore` is the Organization subtype Google
 * expects for merchant knowledge panels.
 */
export const organizationNode = {
  "@type": "OnlineStore",
  "@id": ORG_ID,
  name: SITE_NAME,
  alternateName: "Golden Eagle Clothing",
  url: SITE_URL,
  slogan: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/golden-eagle-logo-hd.png"),
    caption: `${SITE_NAME} logo`,
  },
  image: absoluteUrl("/hero-golden-eagle-v2.webp"),
  sameAs: SOCIAL_PROFILES,
  areaServed: { "@type": "Country", name: "Sri Lanka" },
  currenciesAccepted: "LKR",
};

/**
 * The site itself, plus the sitelinks search box hint that points Google's
 * in-SERP search at `/search?q=`.
 */
export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": ORG_ID },
  inLanguage: "en-LK",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/** Breadcrumb trail. Paths are site-relative; they're absolutised here. */
export function breadcrumbNode(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Return policy attached to every Offer. Only the facts the storefront
 * actually states are declared — return method and fees are deliberately
 * omitted rather than guessed.
 */
export const merchantReturnPolicyNode = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "LK",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: RETURN_WINDOW_DAYS,
  // Points at the published policy so the claim is verifiable.
  merchantReturnLink: `${SITE_URL}/shipping-returns`,
};

/** Free island-wide delivery above the threshold, expressed as an Offer detail. */
export const shippingDetailsNode = {
  "@type": "OfferShippingDetails",
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "LK",
  },
  shippingRate: {
    "@type": "MonetaryAmount",
    value: 0,
    currency: "LKR",
  },
  eligibleTransactionVolume: {
    "@type": "PriceSpecification",
    priceCurrency: "LKR",
    minPrice: FREE_SHIPPING_THRESHOLD_LKR,
  },
};

/**
 * A product's description for search snippets and Product schema.
 *
 * Shopify products can ship with an empty `description` (several currently
 * do), which would otherwise emit a blank `<meta name="description">` and let
 * Google invent a snippet from stray page text. The fallback is composed
 * strictly from attributes the product actually has — name, category, colours,
 * price, and the store's real delivery policy — so it never asserts a
 * material, fit or claim the merchant hasn't entered.
 *
 * Fill in real descriptions in Shopify and they take over automatically.
 */
export function productDescription(product: {
  name: string;
  category: string;
  colorName?: string;
  colors?: { name: string }[];
  priceLKR: number;
  description?: string;
}): string {
  const real = product.description?.trim();
  if (real) return real;

  // Kept under ~155 characters so the whole line survives in a search snippet
  // rather than being cut mid-promise.
  const colours = (product.colors ?? []).map((c) => c.name);
  const colourPhrase =
    colours.length > 1
      ? ` in ${colours.slice(0, -1).join(", ")} and ${colours[colours.length - 1]}`
      : colours.length === 1
        ? ` in ${colours[0]}`
        : "";

  return (
    `${product.name} from ${SITE_NAME} — ${product.category.toLowerCase()}'s premium everyday wear${colourPhrase}. ` +
    `Free island-wide delivery over LKR ${FREE_SHIPPING_THRESHOLD_LKR.toLocaleString("en-US")}.`
  );
}

/** True when a product has no merchant-written description in Shopify. */
export function hasRealDescription(product: { description?: string }): boolean {
  return Boolean(product.description?.trim());
}

/**
 * `priceValidUntil` is required for Google product rich results. Prices here
 * aren't time-boxed, so quote a rolling one-year horizon from render time.
 */
export function priceValidUntil(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}
