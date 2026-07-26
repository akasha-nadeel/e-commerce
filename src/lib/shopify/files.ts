import "server-only";

import { adminFetch } from "./admin";

/**
 * Push an image's bytes to Shopify's staging bucket and return the
 * `resourceUrl` that identifies it.
 *
 * This is step 1–2 of Shopify's upload dance; what you do with the resource
 * afterwards differs by caller. `fileCreate` turns it into a standalone
 * Files entry (reviews), while `productSet` accepts the same URL directly as
 * `originalSource` and attaches it as product media (the Studio). Requires the
 * app's `write_files` scope.
 */
export async function stageUpload(
  file: File,
  fallbackName = "upload.jpg",
): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = file.name || fallbackName;
  const mimeType = file.type || "image/jpeg";

  // 1) staged upload target
  const staged = await adminFetch<{
    stagedUploadsCreate: {
      stagedTargets: {
        url: string;
        resourceUrl: string;
        parameters: { name: string; value: string }[];
      }[];
      userErrors: { message: string }[];
    };
  }>({
    query: /* GraphQL */ `
      mutation StagedUploads($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets { url resourceUrl parameters { name value } }
          userErrors { message }
        }
      }
    `,
    variables: {
      input: [{ filename, mimeType, httpMethod: "POST", resource: "IMAGE" }],
    },
  });

  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target) {
    throw new Error(
      staged.stagedUploadsCreate.userErrors[0]?.message ??
        "No staged upload target returned.",
    );
  }

  // 2) upload the bytes to the staged URL (multipart form)
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append("file", new Blob([bytes], { type: mimeType }), filename);
  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) {
    throw new Error(`Staged upload failed (${up.status}).`);
  }

  return target.resourceUrl;
}

/**
 * Upload a review photo and return its MediaImage GID — the staged upload
 * above followed by `fileCreate`, which is what promotes the staged resource
 * into a permanent Files entry the review metaobject can reference.
 */
export async function uploadReviewImage(file: File): Promise<string> {
  const resourceUrl = await stageUpload(file, "review.jpg");

  // 3) create the Shopify file from the staged resource
  const created = await adminFetch<{
    fileCreate: {
      files: { id: string }[];
      userErrors: { message: string }[];
    };
  }>({
    query: /* GraphQL */ `
      mutation FileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files { id }
          userErrors { message }
        }
      }
    `,
    variables: {
      files: [
        {
          originalSource: resourceUrl,
          contentType: "IMAGE",
          alt: "Product review photo",
        },
      ],
    },
  });

  const fileId = created.fileCreate.files[0]?.id;
  if (!fileId) {
    throw new Error(
      created.fileCreate.userErrors[0]?.message ?? "fileCreate returned no file.",
    );
  }
  return fileId;
}
