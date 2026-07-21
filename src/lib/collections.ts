/**
 * The storefront's collection routes (`/collections/[slug]`).
 *
 * Shared by the collection page (rendering + `generateStaticParams`) and the
 * sitemap, so a new collection is listed for crawlers the moment it's routable.
 */

export type Collection = {
  title: string;
  tagline: string;
  /** Mixed collections expose the Category facet. */
  mixed?: boolean;
};

export const COLLECTIONS: Record<string, Collection> = {
  all: {
    title: "All Products",
    tagline: "The full Golden Eagle collection.",
    mixed: true,
  },
  new: {
    title: "New In",
    tagline: "The latest drops, fresh off the press.",
    mixed: true,
  },
  men: {
    title: "Men",
    tagline: "Built from the ground up — own the day.",
  },
  women: {
    title: "Women",
    tagline: "Premium tees and jerseys, engineered to move.",
  },
  // Garment-type collections (the Shop By Category cards). Populate by creating
  // Smart collections with these handles in Shopify. `mixed` shows the gender
  // facet, since a garment type spans men/women.
  "t-shirts": {
    title: "T-Shirts",
    tagline: "Everyday heavyweight essentials.",
    mixed: true,
  },
  polo: {
    title: "Polo",
    tagline: "Smart-casual staples, refined.",
    mixed: true,
  },
  hoody: {
    title: "Hoodies",
    tagline: "Cozy layers for every day.",
    mixed: true,
  },
  tanks: {
    title: "Tanks",
    tagline: "Built to move — train in Golden Eagle.",
    mixed: true,
  },
  accessories: {
    title: "Accessories",
    tagline: "Caps, perfume and finishing touches.",
    mixed: true,
  },
  caps: {
    title: "Caps",
    tagline: "Finish the fit with a clean cap.",
    mixed: true,
  },
  perfume: {
    title: "Perfume",
    tagline: "Signature scents for every day.",
    mixed: true,
  },
  bottles: {
    title: "Bottles",
    tagline: "Stay hydrated in style.",
    mixed: true,
  },
};

export const COLLECTION_SLUGS = Object.keys(COLLECTIONS);
