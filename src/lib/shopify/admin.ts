import "server-only";

/**
 * Shopify Admin API (GraphQL) client — used only on the server for privileged
 * operations the Storefront token can't do (creating/reading review
 * metaobjects). The Admin token is a secret: never expose it to the client.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-10";

export const isAdminConfigured = Boolean(DOMAIN && ADMIN_TOKEN);

const ENDPOINT = DOMAIN
  ? `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`
  : "";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function adminFetch<T>({
  query,
  variables,
  tags,
  revalidate,
}: {
  query: string;
  variables?: Record<string, unknown>;
  /** Cache tags for reads; omit for mutations. */
  tags?: string[];
  /** ISR seconds for reads; use false / omit for no-store mutations. */
  revalidate?: number | false;
}): Promise<T> {
  if (!isAdminConfigured) {
    throw new Error(
      "Shopify Admin API is not configured. Set SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local.",
    );
  }

  const next: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) next.revalidate = revalidate;
  if (tags && tags.length > 0) next.tags = tags;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
    ...(revalidate === undefined && !tags
      ? { cache: "no-store" as const }
      : { next }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Admin API ${res.status}: ${await res.text()}`);
  }

  const body = (await res.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(
      `Shopify Admin GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!body.data) throw new Error("Shopify Admin API returned no data.");
  return body.data;
}
