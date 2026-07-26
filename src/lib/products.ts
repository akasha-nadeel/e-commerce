/**
 * Unified product data access. Returns live Shopify data when the store is
 * configured (see `src/lib/shopify`), otherwise the typed mocks in
 * `src/lib/catalog`. Pages call these async helpers instead of importing the
 * catalog or shopify modules directly, so flipping the source is a one-line
 * env change (SHOPIFY_STORE_DOMAIN + token in .env.local).
 */
import type { Product } from "./catalog";
import {
  PRODUCTS as mockProducts,
  accessories as mockAccessories,
  allSlugs as mockAllSlugs,
  getProduct as mockGetProduct,
  latestStyles as mockLatestStyles,
  recommended as mockRecommended,
  relatedTo as mockRelatedTo,
} from "./catalog";
import {
  fetchAllHandles,
  fetchCollectionProducts,
  fetchNonEmptyCollectionHandles,
  fetchProductByHandle,
  fetchProducts,
  isShopifyConfigured,
} from "./shopify";

/** Single product by slug/handle. */
export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (isShopifyConfigured) return fetchProductByHandle(slug);
  return mockGetProduct(slug);
}

/** All product slugs — for `generateStaticParams`. */
export async function getAllProductSlugs(): Promise<string[]> {
  if (isShopifyConfigured) return fetchAllHandles();
  return mockAllSlugs();
}

/**
 * "You May Also Like" — real, non-accessory products other than this one.
 * Returns [] when there are no other products yet (the PDP hides the section).
 */
export async function getRelatedProducts(slug: string): Promise<Product[]> {
  if (isShopifyConfigured) {
    const all = await fetchProducts({ first: 12 });
    return all
      .filter(
        (p) => p.slug !== slug && p.category.toLowerCase() !== "accessories",
      )
      .slice(0, 5);
  }
  return mockRelatedTo(slug);
}

// Mock-mode category filter for a collection route slug.
const MOCK_CATEGORY: Record<string, string> = {
  men: "Men",
  women: "Women",
  accessories: "Accessories",
};

/**
 * Products for a collection route (`/collections/[slug]`). Live: `men`/`women`/
 * `accessories` map to Shopify collections; `all` is everything; `new` is newest
 * first. Mock: filter the mock catalog by category.
 */
export async function getCollectionProducts(slug: string): Promise<Product[]> {
  if (isShopifyConfigured) {
    if (slug === "all") return fetchProducts({ first: 100 });
    if (slug === "new")
      return fetchProducts({
        first: 50,
        sortKey: "CREATED_AT",
        reverse: true,
      });
    return fetchCollectionProducts(slug, 100);
  }
  const cat = MOCK_CATEGORY[slug];
  return cat ? mockProducts.filter((p) => p.category === cat) : mockProducts;
}

/** All products — for the search page's client-side filter. */
export async function getAllProducts(): Promise<Product[]> {
  if (isShopifyConfigured) return fetchProducts({ first: 100 });
  return mockProducts;
}

/** Home — "Shop The Latest Styles" (newest first). */
export async function getLatestStyles(first = 6): Promise<Product[]> {
  if (isShopifyConfigured)
    return fetchProducts({ first, sortKey: "CREATED_AT", reverse: true });
  return mockLatestStyles;
}

/** Home — "Accessories" carousel. */
export async function getAccessoryProducts(first = 8): Promise<Product[]> {
  if (isShopifyConfigured) return fetchCollectionProducts("accessories", first);
  return mockAccessories;
}

/** Home — "You May Also Like". */
export async function getRecommendedProducts(first = 6): Promise<Product[]> {
  if (isShopifyConfigured) return fetchProducts({ first });
  return mockRecommended;
}

/**
 * Registered collection slugs that currently have something to show.
 *
 * Used to keep empty collections out of `sitemap.xml` and to `noindex` them.
 * Submitting a category page with no products invites Google to classify it as
 * thin content or a soft 404, which costs crawl budget and drags on site
 * quality — and this store legitimately has empty collections, since the
 * routes for hoodies, tanks, caps, perfume and bottles exist before the stock
 * does.
 *
 * `all` and `new` are query-based rather than real Shopify collections, so they
 * count as populated whenever the catalog has any product at all.
 */
export async function getNonEmptyCollectionSlugs(): Promise<Set<string>> {
  const QUERY_BASED = ["all", "new"];

  if (isShopifyConfigured) {
    const [live, anyProduct] = await Promise.all([
      fetchNonEmptyCollectionHandles(),
      fetchProducts({ first: 1 }),
    ]);
    if (anyProduct.length > 0) for (const s of QUERY_BASED) live.add(s);
    return live;
  }

  // Mock mode: membership is by category, which is all the mocks model.
  const slugs = new Set<string>();
  if (mockProducts.length > 0) for (const s of QUERY_BASED) slugs.add(s);
  for (const [slug, category] of Object.entries(MOCK_CATEGORY)) {
    if (mockProducts.some((p) => p.category === category)) slugs.add(slug);
  }
  return slugs;
}
