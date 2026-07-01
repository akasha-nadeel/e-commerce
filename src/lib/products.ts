/**
 * Unified product data access. Returns live Shopify data when the store is
 * configured (see `src/lib/shopify`), otherwise the typed mocks in
 * `src/lib/catalog`. Pages call these async helpers instead of importing the
 * catalog or shopify modules directly, so flipping the source is a one-line
 * env change (SHOPIFY_STORE_DOMAIN + token in .env.local).
 */
import type { Product } from "./catalog";
import {
  allSlugs as mockAllSlugs,
  getProduct as mockGetProduct,
  relatedTo as mockRelatedTo,
} from "./catalog";
import {
  fetchAllHandles,
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

/** "You May Also Like" — a few non-accessory products other than this one. */
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
