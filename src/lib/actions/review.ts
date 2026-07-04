"use server";

import { createReview } from "@/lib/reviews";
import { uploadReviewImage } from "@/lib/shopify/files";

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

const MAX_PHOTOS = 4;

/**
 * Submit a product review (+ optional photos) via FormData. Stored as a pending
 * metaobject in Shopify; appears on the site only after approval in admin.
 */
export async function submitReview(
  formData: FormData,
): Promise<SubmitReviewResult> {
  const productHandle = String(formData.get("productHandle") ?? "");
  const productTitle = String(formData.get("productTitle") ?? "");
  const rating = Math.round(Number(formData.get("rating")));
  const author = String(formData.get("author") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!author) return { ok: false, error: "Please enter your name." };
  if (!(rating >= 1 && rating <= 5))
    return { ok: false, error: "Please pick a star rating." };
  if (body.length < 4)
    return { ok: false, error: "Please write a little more about your experience." };
  if (!productHandle)
    return { ok: false, error: "Something went wrong. Please try again." };

  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_PHOTOS);

  let photoGids: string[] = [];
  try {
    if (files.length) {
      photoGids = await Promise.all(files.map((f) => uploadReviewImage(f)));
    }
  } catch {
    // Photos are optional — if upload fails, still save the text review.
    photoGids = [];
  }

  try {
    await createReview({
      productHandle,
      productTitle,
      rating,
      author,
      title,
      body,
      photoGids,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't submit your review. Please try again later." };
  }
}
