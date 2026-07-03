import "server-only";

import { adminFetch, isAdminConfigured } from "./shopify/admin";

/**
 * Custom product reviews stored as Shopify metaobjects (type `product_review`).
 * Reviews are created as DRAFT (pending moderation) and only ACTIVE ones are
 * shown — publish them in Shopify admin (Content → Metaobjects). Everything runs
 * through the Admin API on the server.
 */

export const REVIEW_TYPE = "ge_product_review";

export interface Review {
  id: string;
  productHandle: string;
  rating: number;
  author: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface ReviewSummary {
  reviews: Review[];
  count: number;
  average: number;
  /** Percent per star, index 0 = 5★ … index 4 = 1★. */
  breakdown: number[];
}

export const reviewsEnabled = isAdminConfigured;

const tagFor = (handle: string) => `reviews:${handle}`;

type MetaobjectNode = {
  id: string;
  fields: { key: string; value: string | null }[];
  capabilities?: { publishable?: { status: string } };
};

function fieldMap(node: MetaobjectNode): Record<string, string> {
  const m: Record<string, string> = {};
  for (const f of node.fields) if (f.value != null) m[f.key] = f.value;
  return m;
}

/** Published reviews for a product + rating summary. */
export async function getProductReviews(
  handle: string,
): Promise<ReviewSummary> {
  const empty: ReviewSummary = {
    reviews: [],
    count: 0,
    average: 0,
    breakdown: [0, 0, 0, 0, 0],
  };
  if (!isAdminConfigured) return empty;

  const query = /* GraphQL */ `
    query ProductReviews($q: String!) {
      metaobjects(type: "${REVIEW_TYPE}", first: 100, query: $q, sortKey: "updated_at", reverse: true) {
        edges {
          node {
            id
            capabilities { publishable { status } }
            fields { key value }
          }
        }
      }
    }
  `;

  let edges: { node: MetaobjectNode }[] = [];
  try {
    const data = await adminFetch<{
      metaobjects: { edges: { node: MetaobjectNode }[] };
    }>({
      query,
      variables: { q: `fields.product_handle:${handle}` },
      tags: [tagFor(handle), "reviews"],
      revalidate: 60,
    });
    edges = data.metaobjects.edges;
  } catch {
    return empty;
  }

  const reviews: Review[] = edges
    .filter((e) => e.node.capabilities?.publishable?.status === "ACTIVE")
    .map((e) => {
      const f = fieldMap(e.node);
      return {
        id: e.node.id,
        productHandle: f.product_handle ?? handle,
        rating: Math.max(1, Math.min(5, parseInt(f.rating ?? "5", 10) || 5)),
        author: f.author ?? "Anonymous",
        title: f.title ?? "",
        body: f.body ?? "",
        createdAt: f.created_at ?? "",
      };
    })
    // Belt-and-braces: only keep reviews for this exact product.
    .filter((r) => r.productHandle === handle);

  const count = reviews.length;
  if (count === 0) return empty;

  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  const average = sum / count;
  const counts = [0, 0, 0, 0, 0]; // 5..1
  for (const r of reviews) counts[5 - r.rating] += 1;
  const breakdown = counts.map((c) => Math.round((c / count) * 100));

  return { reviews, count, average, breakdown };
}

/** Create a review (pending moderation). Returns true on success. */
export async function createReview(input: {
  productHandle: string;
  productTitle?: string;
  rating: number;
  author: string;
  title: string;
  body: string;
}): Promise<boolean> {
  if (!isAdminConfigured) return false;

  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  const mutation = /* GraphQL */ `
    mutation CreateReview($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }
  `;

  const data = await adminFetch<{
    metaobjectCreate: {
      metaobject: { id: string } | null;
      userErrors: { message: string }[];
    };
  }>({
    query: mutation,
    variables: {
      metaobject: {
        type: REVIEW_TYPE,
        capabilities: { publishable: { status: "DRAFT" } },
        fields: [
          { key: "product_handle", value: input.productHandle },
          { key: "product_title", value: input.productTitle ?? input.productHandle },
          { key: "rating", value: String(rating) },
          { key: "author", value: input.author.slice(0, 80) },
          { key: "title", value: input.title.slice(0, 120) },
          { key: "body", value: input.body.slice(0, 2000) },
          { key: "created_at", value: new Date().toISOString() },
        ],
      },
    },
  });

  const { metaobject, userErrors } = data.metaobjectCreate;
  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join("; "));
  }
  // New reviews are pending (DRAFT) so they aren't shown until approved; the
  // 60s ISR on getProductReviews refreshes the published list on its own.
  return Boolean(metaobject);
}
