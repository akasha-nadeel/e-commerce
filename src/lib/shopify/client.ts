/**
 * Shopify Storefront API (GraphQL) client — the live-data half of the catalog
 * seam (see `src/lib/catalog.ts`, which holds the typed mocks + `Product` type).
 *
 * Server-only: the access token is deliberately NOT `NEXT_PUBLIC_`-prefixed, so
 * Next keeps it out of the client bundle. Import this only from Server
 * Components / server code.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
// Storefront API version — quarterly (YYYY-MM). Keep this on a currently
// supported version; override per environment with SHOPIFY_API_VERSION.
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";

/**
 * True once the store domain + token are set. Callers use this to fall back to
 * the mock catalog while the Shopify store isn't wired up yet.
 */
export const isShopifyConfigured = Boolean(DOMAIN && TOKEN);

const ENDPOINT = DOMAIN
  ? `https://${DOMAIN}/api/${API_VERSION}/graphql.json`
  : "";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

/**
 * POST a GraphQL query to the Storefront API.
 *
 * Catalog reads default to `force-cache` + cache tags, so pages stay static/ISR
 * and can be revalidated on demand from Shopify webhooks via `revalidateTag`.
 * Pass `cache: "no-store"` for per-request data (e.g. cart mutations).
 */
export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  cache = "force-cache",
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  cache?: RequestCache;
}): Promise<T> {
  if (!isShopifyConfigured) {
    throw new Error(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and " +
        "SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local (see .env.example).",
    );
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags && tags.length > 0 ? { next: { tags } } : {}),
  });

  if (!res.ok) {
    throw new Error(
      `Shopify Storefront API ${res.status}: ${await res.text()}`,
    );
  }

  const body = (await res.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!body.data) {
    throw new Error("Shopify Storefront API returned no data.");
  }
  return body.data;
}
