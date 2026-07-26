"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  archiveStudioProduct,
  deleteStudioProduct,
  saveStudioProduct,
} from "@/lib/shopify/admin-products";
import { stageUpload } from "@/lib/shopify/files";
import { assertStudio, login, logout } from "@/lib/studio/auth";
import type {
  SaveProductResult,
  StudioProductInput,
} from "@/lib/studio/types";

/**
 * Server Actions behind the Studio.
 *
 * Every one of these begins with `assertStudio()`. Server Actions are ordinary
 * POST endpoints — anyone who knows the action id can invoke them without ever
 * loading the page — so the session check has to live *inside* the action, not
 * only on the route that renders the form. See the warning in Next's "Mutating
 * Data" guide.
 */

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export async function studioLogin(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const passphrase = String(formData.get("passphrase") ?? "");
  const result = await login(passphrase);
  if (!result.ok) return { error: result.error };
  // Outside the try/catch above: redirect() signals by throwing.
  redirect("/studio");
}

export async function studioLogout(): Promise<void> {
  await logout();
  redirect("/studio/login");
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export interface UploadResult {
  ok: boolean;
  /** Staged upload URL to hand back to `saveProduct`. */
  source?: string;
  error?: string;
}

/**
 * Stage one already-resized photo and return its upload URL.
 *
 * Photos upload one request at a time rather than riding along with the form
 * submit — that keeps every request comfortably under the Server Action body
 * limit no matter how many photos a product has, and lets the form show
 * per-photo progress instead of one long stall on save.
 */
export async function uploadStudioPhoto(
  formData: FormData,
): Promise<UploadResult> {
  await assertStudio();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No photo received." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "That file isn't an image." };
  }

  try {
    const source = await stageUpload(file, "product.jpg");
    return { ok: true, source };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Upload failed.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/**
 * Create or update a product, then make the storefront show it immediately.
 *
 * `updateTag` (not `revalidateTag`) is the right call here: this is a
 * read-your-own-writes flow — the client saves a product and clicks straight
 * through to the live page — and `updateTag` expires the entry so the next
 * request waits for fresh data instead of serving one more stale copy.
 */
export async function saveProduct(
  input: StudioProductInput,
): Promise<SaveProductResult> {
  await assertStudio();

  const result = await saveStudioProduct(input);

  if (result.ok) {
    // Tags set by `shopify/client.ts` on every Storefront read.
    updateTag("products");
    if (result.handle) updateTag(`product:${result.handle}`);
  }

  return result;
}

export async function archiveProduct(
  id: string,
  handle?: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertStudio();

  const result = await archiveStudioProduct(id);
  if (result.ok) {
    updateTag("products");
    // Also bust the product's own page, or its cached PDP outlives it.
    if (handle) updateTag(`product:${handle}`);
  }
  return result;
}

/**
 * Permanently delete. Separate action from `archiveProduct` on purpose: an
 * irreversible operation shouldn't be a boolean flag on a reversible one, where
 * a wrong argument quietly destroys data.
 */
export async function deleteProduct(
  id: string,
  handle?: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertStudio();

  const result = await deleteStudioProduct(id);
  if (result.ok) {
    updateTag("products");
    if (handle) updateTag(`product:${handle}`);
  }
  return result;
}
