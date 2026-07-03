"use server";

import { createReview } from "@/lib/reviews";

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

/**
 * Submit a product review. Stored as a pending (DRAFT) metaobject in Shopify —
 * it appears on the site only after you approve it in Shopify admin.
 */
export async function submitReview(input: {
  productHandle: string;
  productTitle?: string;
  rating: number;
  author: string;
  title: string;
  body: string;
}): Promise<SubmitReviewResult> {
  const author = input.author?.trim() ?? "";
  const body = input.body?.trim() ?? "";
  const rating = Math.round(Number(input.rating));

  if (!author) return { ok: false, error: "Please enter your name." };
  if (!(rating >= 1 && rating <= 5))
    return { ok: false, error: "Please pick a star rating." };
  if (body.length < 4)
    return { ok: false, error: "Please write a little more about your experience." };
  if (!input.productHandle)
    return { ok: false, error: "Something went wrong. Please try again." };

  try {
    await createReview({
      productHandle: input.productHandle,
      productTitle: input.productTitle,
      rating,
      author,
      title: input.title?.trim() ?? "",
      body,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't submit your review. Please try again later." };
  }
}
