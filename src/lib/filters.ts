/**
 * Faceted filtering + sorting for collection / search pages.
 *
 * Pure, dependency-free helpers so the same logic can run on the server (SSR
 * default render) and the client (interactive filtering). When the Shopify
 * Storefront API is wired in, the facet shapes here map onto Shopify's
 * `filters` (option values + metafields) with no UI changes.
 */
import type { Product } from "./catalog";

/* ----------------------------- Colour facets ----------------------------- */

/** Human colour-family buckets, in display order, each with a representative chip hex. */
export const COLOR_FAMILIES = [
  { key: "Black", hex: "#111111" },
  { key: "White", hex: "#f3f1ea" },
  { key: "Grey", hex: "#8a8d92" },
  { key: "Blue", hex: "#1c2a44" },
  { key: "Green", hex: "#5f6347" },
  { key: "Pink", hex: "#d96aa0" },
  { key: "Yellow", hex: "#e9c14a" },
  { key: "Red", hex: "#7a1f2b" },
  { key: "Gold", hex: "#c79a4b" },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["key"];

/** Maps a catalog colour name to its family bucket. */
const COLOR_NAME_TO_FAMILY: Record<string, ColorFamily> = {
  "Antique White": "White",
  "Sheer White": "White",
  Bone: "White",
  "Jet Black": "Black",
  Charcoal: "Grey",
  "Slate Grey": "Grey",
  Indigo: "Blue",
  Sage: "Green",
  "Washed Olive": "Green",
  Dandelion: "Yellow",
  "Punch Pink": "Pink",
  Maroon: "Red",
  Gold: "Gold",
};

export function colorFamiliesOf(p: Product): ColorFamily[] {
  const set = new Set<ColorFamily>();
  for (const c of p.colors) {
    const fam = COLOR_NAME_TO_FAMILY[c.name];
    if (fam) set.add(fam);
  }
  return [...set];
}

/* ------------------------------ Size facets ------------------------------ */

export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "OS"] as const;
export type SizeLabel = (typeof SIZE_ORDER)[number];

export const SIZE_DISPLAY: Record<string, string> = { OS: "One Size" };

/** Sizes a product is actually available in. */
export function availableSizesOf(p: Product): string[] {
  return p.sizes.filter((s) => s.available).map((s) => s.label);
}

/* ------------------------------ Price facets ----------------------------- */

export const PRICE_BUCKETS = [
  { key: "under-2500", label: "Under LKR 2,500", min: 0, max: 2500 },
  { key: "2500-5000", label: "LKR 2,500 – 5,000", min: 2500, max: 5000 },
  { key: "over-5000", label: "Over LKR 5,000", min: 5000, max: Infinity },
] as const;

export type PriceBucketKey = (typeof PRICE_BUCKETS)[number]["key"];

function inPriceBucket(price: number, key: PriceBucketKey): boolean {
  const b = PRICE_BUCKETS.find((x) => x.key === key);
  if (!b) return true;
  // Upper bound exclusive so buckets don't overlap (2500 lands in the middle band).
  return price >= b.min && price < b.max;
}

/* -------------------------------- Sorting -------------------------------- */

export const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "name-asc", label: "Alphabetical" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

/* ------------------------------ Filter state ----------------------------- */

export interface FilterState {
  sizes: string[];
  colors: ColorFamily[];
  prices: PriceBucketKey[];
  categories: string[];
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = {
  sizes: [],
  colors: [],
  prices: [],
  categories: [],
  sort: "featured",
};

export function activeFilterCount(f: FilterState): number {
  return f.sizes.length + f.colors.length + f.prices.length + f.categories.length;
}

/* ------------------------- Available facet options ----------------------- */

export interface Facets {
  sizes: string[];
  colors: ColorFamily[];
  categories: string[];
  prices: PriceBucketKey[];
}

/** Computes which facet values actually exist in a product set (so we never show a dead filter). */
export function computeFacets(products: Product[]): Facets {
  const sizes = new Set<string>();
  const colors = new Set<ColorFamily>();
  const categories = new Set<string>();
  const prices = new Set<PriceBucketKey>();

  for (const p of products) {
    for (const s of availableSizesOf(p)) sizes.add(s);
    for (const c of colorFamiliesOf(p)) colors.add(c);
    categories.add(p.category);
    for (const b of PRICE_BUCKETS) if (inPriceBucket(p.priceLKR, b.key)) prices.add(b.key);
  }

  return {
    sizes: SIZE_ORDER.filter((s) => sizes.has(s)),
    colors: COLOR_FAMILIES.map((c) => c.key).filter((c) => colors.has(c)),
    categories: ["Men", "Women", "Accessories"].filter((c) => categories.has(c)),
    prices: PRICE_BUCKETS.map((b) => b.key).filter((k) => prices.has(k)),
  };
}

/* ---------------------------- Apply + sort ------------------------------- */

export function filterAndSort(products: Product[], f: FilterState): Product[] {
  const out = products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.sizes.length) {
      const have = new Set(availableSizesOf(p));
      if (!f.sizes.some((s) => have.has(s))) return false;
    }
    if (f.colors.length) {
      const have = new Set(colorFamiliesOf(p));
      if (!f.colors.some((c) => have.has(c))) return false;
    }
    if (f.prices.length && !f.prices.some((k) => inPriceBucket(p.priceLKR, k))) {
      return false;
    }
    return true;
  });

  const sorted = [...out];
  switch (f.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.priceLKR - b.priceLKR);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.priceLKR - a.priceLKR);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      sorted.reverse();
      break;
    case "featured":
    default:
      break;
  }
  return sorted;
}

/* --------------------------- URL (de)serialise --------------------------- */

const LIST_SEP = ",";

export function filtersFromParams(params: URLSearchParams): FilterState {
  const list = (k: string) =>
    (params.get(k) ?? "").split(LIST_SEP).map((s) => s.trim()).filter(Boolean);

  const sortParam = params.get("sort") as SortKey | null;
  const sort =
    sortParam && SORT_OPTIONS.some((o) => o.key === sortParam) ? sortParam : "featured";

  return {
    sizes: list("size"),
    colors: list("color") as ColorFamily[],
    prices: list("price") as PriceBucketKey[],
    categories: list("cat"),
    sort,
  };
}

export function filtersToParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.sizes.length) p.set("size", f.sizes.join(LIST_SEP));
  if (f.colors.length) p.set("color", f.colors.join(LIST_SEP));
  if (f.prices.length) p.set("price", f.prices.join(LIST_SEP));
  if (f.categories.length) p.set("cat", f.categories.join(LIST_SEP));
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p;
}
