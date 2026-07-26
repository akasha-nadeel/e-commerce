/**
 * Client-side image downscaling, shared by the review form and the Studio.
 *
 * Uploads are resized in the browser before they ever reach a Server Action —
 * partly for speed on Sri Lankan mobile connections, partly because Server
 * Actions have a hard body-size limit (`serverActions.bodySizeLimit` in
 * `next.config.ts`). A phone photo straight off the camera can be 6–12 MB.
 *
 * Browser-only: uses `createImageBitmap` and `<canvas>`.
 */

/** Downscale + compress an image, preserving aspect ratio. */
export async function resizeImage(
  file: File,
  max = 1400,
  quality = 0.85,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > max || height > max) {
    const scale = Math.min(max / width, max / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
}

/**
 * Product photography settings — deliberately gentler than the review preset.
 * These become the shots on the PDP, which the site serves at `quality={100}`,
 * so they get a larger long edge and less compression.
 */
export const PRODUCT_PHOTO_MAX = 2200;
export const PRODUCT_PHOTO_QUALITY = 0.92;

export function resizeProductPhoto(file: File): Promise<Blob> {
  return resizeImage(file, PRODUCT_PHOTO_MAX, PRODUCT_PHOTO_QUALITY);
}
