/**
 * Async catalog accessors backed by the Storefront API. These mirror the mock
 * accessors in `src/lib/catalog.ts` — the swap-in point once a store + token
 * exist. Consumers become `async` and `await` these instead of reading the
 * mock constants.
 */
import type { Product } from "@/lib/catalog";
import { isShopifyConfigured, shopifyFetch } from "./client";
import {
  GET_ALL_PRODUCT_HANDLES,
  GET_COLLECTION_PRODUCTS,
  GET_PRODUCT_BY_HANDLE,
  GET_PRODUCTS,
} from "./queries";
import { transformProduct, type ShopifyProduct } from "./transform";

export { isShopifyConfigured };

type Edges<T> = { edges: { node: T }[] };

/** Single product by its handle (slug), or undefined if not found. */
export async function fetchProductByHandle(
  handle: string,
): Promise<Product | undefined> {
  const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
    query: GET_PRODUCT_BY_HANDLE,
    variables: { handle },
    tags: ["products", `product:${handle}`],
  });
  return data.product ? transformProduct(data.product) : undefined;
}

/** A page of products, optionally filtered/sorted (Storefront `ProductSortKeys`). */
export async function fetchProducts(
  opts: {
    first?: number;
    query?: string;
    sortKey?: string;
    reverse?: boolean;
  } = {},
): Promise<Product[]> {
  const data = await shopifyFetch<{ products: Edges<ShopifyProduct> }>({
    query: GET_PRODUCTS,
    variables: {
      first: opts.first ?? 24,
      query: opts.query ?? null,
      sortKey: opts.sortKey ?? null,
      reverse: opts.reverse ?? false,
    },
    tags: ["products"],
  });
  return data.products.edges.map((e) => transformProduct(e.node));
}

/** Products in a Shopify collection (by handle), e.g. "men", "new". */
export async function fetchCollectionProducts(
  handle: string,
  first = 48,
): Promise<Product[]> {
  const data = await shopifyFetch<{
    collection: { products: Edges<ShopifyProduct> } | null;
  }>({
    query: GET_COLLECTION_PRODUCTS,
    variables: { handle, first },
    tags: ["products", `collection:${handle}`],
  });
  return data.collection
    ? data.collection.products.edges.map((e) => transformProduct(e.node))
    : [];
}

/** All product handles — for `generateStaticParams`. */
export async function fetchAllHandles(first = 250): Promise<string[]> {
  const data = await shopifyFetch<{ products: Edges<{ handle: string }> }>({
    query: GET_ALL_PRODUCT_HANDLES,
    variables: { first },
    tags: ["products"],
  });
  return data.products.edges.map((e) => e.node.handle);
}
