/**
 * The Studio's controlled vocabulary.
 *
 * Everything the client can pick from lives here, and every value is chosen so
 * the product it produces satisfies what `shopify/transform.ts` needs to render
 * a complete PDP. That constraint is the whole point of the Studio: the raw
 * Shopify form lets you type "Colour" or "Navy Blue" and silently lose the
 * swatch row, whereas here a wrong value simply isn't offerable.
 *
 * Safe to import from Client Components — no secrets, no server imports.
 */

/** A colour the client can put on a product. `hex` drives the storefront swatch. */
export interface StudioColor {
  name: string;
  hex: string;
}

/**
 * Brand palette. The Studio writes these hexes into the product's
 * `custom.color_swatches` metafield, which `transform.ts` reads *first* —
 * ahead of Shopify's native swatch and its built-in name lookup. That is why a
 * colour here can never fall back to the generic grey `#8a8a8e`.
 */
export const STUDIO_COLORS: StudioColor[] = [
  { name: "Jet Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Bone", hex: "#f3f1ea" },
  { name: "Charcoal", hex: "#2a2a2e" },
  { name: "Grey", hex: "#8a8a8e" },
  { name: "Navy", hex: "#1c2a44" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Olive", hex: "#5b5f43" },
  { name: "Green", hex: "#2f6f4e" },
  { name: "Gold", hex: "#c79a4b" },
  { name: "Sand", hex: "#d8c9a8" },
  { name: "Orange", hex: "#f97316" },
  { name: "Red", hex: "#b3241f" },
  { name: "Maroon", hex: "#6b1f2a" },
  { name: "Purple", hex: "#4f2c7c" },
  { name: "Pink", hex: "#e08aa6" },
];

export const COLOR_BY_NAME = new Map(STUDIO_COLORS.map((c) => [c.name, c]));

/** Apparel sizes, in the order they should appear on the PDP size grid. */
export const STUDIO_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;

/** Accessories that don't come in sizes use this single label. */
export const ONE_SIZE = "OS";

/**
 * Garment types.
 *
 * **Every storefront collection in this store is a Shopify *smart* collection**
 * — membership is derived from a rule, not assigned. Verified against the live
 * store: `men`/`women` are `TYPE EQUALS`, and every garment collection is
 * `TAG EQUALS`. That means a product cannot be *added* to them; you set the
 * product's type and tags and Shopify sorts it in.
 *
 * So `tag` here is not decorative — it is the only thing that puts the product
 * on its `/collections/[slug]` page, and it must match the collection's rule
 * exactly. Note `t-shirts` is ruled by the **singular** tag `t-shirt`.
 */
export interface StudioType {
  label: string;
  /** Shopify collection handle this type maps to (for reference/messages). */
  collection: string;
  /** The tag the smart collection's rule matches. Exact, case-sensitive. */
  tag: string;
  /** Accessories render as square cards and sit outside Men/Women. */
  accessory?: boolean;
  /** Sized garments show the size grid; accessories default to one size. */
  sized?: boolean;
}

export const STUDIO_TYPES: StudioType[] = [
  { label: "T-Shirt", collection: "t-shirts", tag: "t-shirt", sized: true },
  { label: "Polo", collection: "polo", tag: "polo", sized: true },
  { label: "Hoodie", collection: "hoody", tag: "hoody", sized: true },
  { label: "Tank", collection: "tanks", tag: "tanks", sized: true },
  { label: "Cap", collection: "caps", tag: "caps", accessory: true },
  { label: "Perfume", collection: "perfume", tag: "perfume", accessory: true },
  { label: "Bottle", collection: "bottles", tag: "bottles", accessory: true },
];

export const TYPE_BY_LABEL = new Map(STUDIO_TYPES.map((t) => [t.label, t]));

/**
 * Who the product is for. This becomes Shopify's `productType`, which
 * `transform.ts` turns into the storefront Category — the breadcrumb, the page
 * title and the filter chip.
 *
 * **"Unisex" only works because the `men`/`women` collections were made
 * disjunctive** (`TYPE EQUALS "Men" OR TAG EQUALS "men"`). A product has exactly
 * one `productType`, so type alone can never put it in both departments — a
 * unisex product instead carries *both* `men` and `women` tags and joins through
 * the tag half of each rule. If someone ever simplifies those collections back
 * to a type-only rule, every unisex product silently vanishes from both
 * department pages. See `tagsFor` below.
 */
export type StudioAudience = "Men" | "Women" | "Unisex";

export const STUDIO_AUDIENCES: StudioAudience[] = ["Men", "Women", "Unisex"];

/** Optional merchandising badge (`custom.badge`) shown on cards. */
export const STUDIO_BADGES = ["New Arrival", "Best Seller", "Back In Stock"];

/**
 * Tags that put a product into its smart collections. Accessories need their
 * own type tag *and* the umbrella `accessories` tag, because `/collections/
 * accessories` is ruled by `TAG EQUALS "accessories"` rather than by type.
 */
export function tagsFor(type: StudioType, audience: StudioAudience): string[] {
  const tags = [type.tag];
  if (type.accessory) {
    tags.push("accessories");
  } else if (audience === "Unisex") {
    // The only case that needs gender tags. `productType` is "Unisex", which
    // matches neither `TYPE EQUALS` rule, so these tags are the sole reason the
    // product appears under both Men and Women.
    tags.push("men", "women");
  }
  // Single-gender products need no gender tag — `TYPE EQUALS "Men"` already
  // covers them, and every pre-existing product in the store carries only its
  // garment tag. Matching that keeps the Shopify admin readable.
  return [...new Set(tags)];
}

/**
 * Shopify `productType` — the `men`/`women` smart-collection rule *and* the
 * storefront's displayed Category. Accessories get "Accessories", which is also
 * what makes `transform.ts` render them as square cards.
 */
export function productTypeFor(
  type: StudioType,
  audience: StudioAudience,
): string {
  return type.accessory ? "Accessories" : audience;
}

/** The collection handle a product of this type should end up on. */
export function expectedCollection(type: StudioType): string {
  return type.collection;
}

/**
 * URL handle from a product name — this becomes the live product URL
 * (`/products/<handle>`), so it's generated once at creation and never changed
 * afterwards; renaming a product must not break its links or its SEO.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\u0300-\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
