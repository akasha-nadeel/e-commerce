import "server-only";

import { adminFetch } from "./admin";
import {
  COLOR_BY_NAME,
  ONE_SIZE,
  TYPE_BY_LABEL,
  expectedCollection,
  productTypeFor,
  slugify,
  tagsFor,
  type StudioAudience,
} from "@/lib/studio/options";
import type {
  SaveProductResult,
  StudioListItem,
  StudioPhotoInput,
  StudioProductInput,
} from "@/lib/studio/types";

// Re-exported so server callers can keep importing the shapes from here.
export type {
  SaveProductResult,
  StudioListItem,
  StudioPhotoInput,
  StudioProductInput,
};

/**
 * Product writes for the Studio.
 *
 * This module is the reason the Studio exists. It takes the seven things the
 * client actually decides (name, type, audience, price, colours, sizes, stock)
 * and expands them into the ~40 fields Shopify's own form asks for — filling
 * every remaining field with the value the storefront needs.
 *
 * The conventions encoded here are load-bearing; `shopify/transform.ts` reads
 * products back out and silently degrades if any of them is wrong:
 *
 *   - Options are named exactly "Color" and "Size" (case-sensitive lookup
 *     there is case-insensitive, but consistency keeps the admin readable).
 *   - Swatch hexes are written to `custom.color_swatches`, the highest-priority
 *     source in `transform.ts` — so a colour never falls back to generic grey.
 *   - Every photo's alt text carries its colour name, which is `transform.ts`'s
 *     fallback for grouping gallery shots by colour.
 *   - Each colour's first photo is attached to that colour's variants, which is
 *     what makes clicking a swatch change the gallery.
 *   - `productType` is the department (Men/Women/Unisex/Accessories) because
 *     that is what becomes the storefront Category and breadcrumb.
 *
 * Everything runs through `adminFetch`, so the token never reaches the client.
 */

/* ------------------------------------------------------------------ */
/* Store lookups (cached — these IDs barely ever change)               */
/* ------------------------------------------------------------------ */

/**
 * Which collection handles exist, so a save can warn when a product's tag has
 * no collection to land in. Returns null if the lookup fails — a warning is a
 * nicety and must never be the reason a save errors.
 */
async function collectionHandles(): Promise<Set<string> | null> {
  try {
    const data = await adminFetch<{
      collections: { nodes: { handle: string }[] };
    }>({
      query: /* GraphQL */ `
        query StudioCollections {
          collections(first: 100) {
            nodes { handle }
          }
        }
      `,
      tags: ["studio:collections"],
      revalidate: 3600,
    });
    return new Set(data.collections.nodes.map((c) => c.handle));
  } catch {
    return null;
  }
}

/**
 * Every sales channel the store publishes to. New products go to all of them,
 * which is what Shopify's own "All channels" default does — and, critically,
 * guarantees the product reaches whichever publication the headless Storefront
 * token reads from. A product that isn't published there exists in Shopify but
 * never appears on the website.
 */
async function publicationIds(): Promise<string[]> {
  const data = await adminFetch<{
    publications: { nodes: { id: string }[] };
  }>({
    query: /* GraphQL */ `
      query StudioPublications {
        publications(first: 25) {
          nodes { id }
        }
      }
    `,
    tags: ["studio:publications"],
    revalidate: 3600,
  });
  return data.publications.nodes.map((p) => p.id);
}

/**
 * The location stock is counted at. Returns null when the Admin app lacks the
 * `read_locations` scope — in that case we deliberately leave inventory
 * *untracked* rather than tracked-at-zero, because tracked-at-zero would read
 * as sold out across the whole site.
 */
async function primaryLocationId(): Promise<string | null> {
  try {
    const data = await adminFetch<{
      locations: { nodes: { id: string; isActive: boolean }[] };
    }>({
      query: /* GraphQL */ `
        query StudioLocation {
          locations(first: 5) {
            nodes { id isActive }
          }
        }
      `,
      tags: ["studio:location"],
      revalidate: 3600,
    });
    return data.locations.nodes.find((l) => l.isActive)?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Whether stock quantities can actually be written, i.e. whether the Admin app
 * has the `read_locations` scope. The form asks this up front so it can say so
 * *before* the owner types quantities, instead of reporting it as a warning
 * after he's already saved.
 */
export async function canWriteStock(): Promise<boolean> {
  return (await primaryLocationId()) !== null;
}

/* ------------------------------------------------------------------ */
/* Save                                                                */
/* ------------------------------------------------------------------ */

const MISSING_INVENTORY_SCOPE =
  "Stock numbers weren't saved: the Shopify app is missing the " +
  "read_locations and write_inventory scopes. The product itself saved fine " +
  "and is on sale. Add those two scopes in Shopify (Settings → Apps → Develop " +
  "apps → your app → Configuration), reinstall, and paste the new Admin token " +
  "into SHOPIFY_ADMIN_ACCESS_TOKEN.";

/**
 * Create or update a product. `id` present = update (a full replace: colours or
 * sizes removed from the form have their variants deleted, which is the
 * behaviour the form implies).
 */
export async function saveStudioProduct(
  input: StudioProductInput,
): Promise<SaveProductResult> {
  const warnings: string[] = [];

  const type = TYPE_BY_LABEL.get(input.typeLabel);
  if (!type) {
    return { ok: false, warnings, error: `Unknown product type "${input.typeLabel}".` };
  }

  const colors = input.colors.filter((c) => COLOR_BY_NAME.has(c));
  const sizes = type.accessory && input.sizes.length === 0 ? [] : input.sizes;

  if (input.priceLKR <= 0) {
    return { ok: false, warnings, error: "Enter a price above zero." };
  }

  /* --- options ---------------------------------------------------- */
  // Only include an option Shopify would actually have values for; a product
  // with neither falls back to Shopify's implicit single default variant.
  const productOptions: { name: string; position: number; values: { name: string }[] }[] = [];
  if (colors.length) {
    productOptions.push({
      name: "Color",
      position: productOptions.length + 1,
      values: colors.map((name) => ({ name })),
    });
  }
  if (sizes.length) {
    productOptions.push({
      name: "Size",
      position: productOptions.length + 1,
      values: sizes.map((name) => ({ name })),
    });
  }

  /* --- inventory -------------------------------------------------- */
  const wantsStock = Object.values(input.stock).some((q) => q > 0);
  const locationId = wantsStock ? await primaryLocationId() : null;
  if (wantsStock && !locationId) warnings.push(MISSING_INVENTORY_SCOPE);
  const tracked = Boolean(locationId);

  /* --- variants --------------------------------------------------- */
  const colorAxis = colors.length ? colors : [null];
  const sizeAxis = sizes.length ? sizes : [null];

  const variants = colorAxis.flatMap((color) =>
    sizeAxis.map((size) => {
      const optionValues: { optionName: string; name: string }[] = [];
      if (color) optionValues.push({ optionName: "Color", name: color });
      if (size) optionValues.push({ optionName: "Size", name: size });

      const qty = size ? (input.stock[size] ?? 0) : (input.stock[ONE_SIZE] ?? 0);

      return {
        optionValues,
        price: input.priceLKR.toFixed(2),
        ...(input.compareAtLKR && input.compareAtLKR > input.priceLKR
          ? { compareAtPrice: input.compareAtLKR.toFixed(2) }
          : {}),
        inventoryPolicy: input.backorder ? "CONTINUE" : "DENY",
        inventoryItem: { tracked },
        ...(locationId
          ? {
              inventoryQuantities: [
                { locationId, name: "available", quantity: Math.max(0, qty) },
              ],
            }
          : {}),
      };
    }),
  );

  /* --- media ------------------------------------------------------ */
  // Alt text doubles as the gallery caption and as `transform.ts`'s fallback
  // for grouping shots by colour, so the colour name has to be in there.
  const altFor = (color?: string) =>
    color ? `${input.name} — ${color}` : input.name;

  const files = input.photos.map((p) =>
    p.mediaId
      ? { id: p.mediaId, alt: altFor(p.color) }
      : {
          originalSource: p.source as string,
          contentType: "IMAGE" as const,
          alt: altFor(p.color),
          ...(p.filename ? { filename: p.filename } : {}),
        },
  );

  /* --- metafields ------------------------------------------------- */
  const swatchJson = JSON.stringify(
    Object.fromEntries(
      colors.map((name) => [name, COLOR_BY_NAME.get(name)?.hex ?? "#8a8a8e"]),
    ),
  );

  const metafields: { namespace: string; key: string; type: string; value: string }[] = [
    {
      namespace: "custom",
      key: "color_swatches",
      type: "json",
      value: swatchJson,
    },
  ];
  if (input.badge?.trim()) {
    metafields.push({
      namespace: "custom",
      key: "badge",
      type: "single_line_text_field",
      value: input.badge.trim(),
    });
  }
  if (input.fit?.trim()) {
    metafields.push({
      namespace: "custom",
      key: "fit",
      type: "multi_line_text_field",
      value: input.fit.trim(),
    });
  }
  if (input.fabrication?.trim()) {
    metafields.push({
      namespace: "custom",
      key: "fabrication",
      type: "multi_line_text_field",
      value: input.fabrication.trim(),
    });
  }

  /* --- collection membership (via tags, not joins) ----------------- */
  // Every storefront collection is a *smart* collection, so products can't be
  // added to one — `productType` and these tags are what Shopify's rules match.
  // Passing `collections: [...]` here would be rejected outright.
  const tags = tagsFor(type, input.audience);

  // Warn if the collection the rule feeds doesn't exist yet, since the product
  // saves either way but has nowhere to show up.
  const wanted = expectedCollection(type);
  const known = await collectionHandles();
  if (known && !known.has(wanted)) {
    warnings.push(
      `Saved, but there's no "${wanted}" collection in Shopify yet, so the ` +
        `product won't show on /collections/${wanted}. Create a smart ` +
        `collection with the rule: Product tag is equal to "${type.tag}".`,
    );
  }

  /* --- description ------------------------------------------------ */
  // Plain text from a textarea; keep the client's line breaks as paragraphs.
  const descriptionHtml = (input.description ?? "")
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const productInput: Record<string, unknown> = {
    title: input.name.trim(),
    productType: productTypeFor(type, input.audience),
    vendor: "Golden Eagle",
    // DRAFT is invisible to the Storefront API, so a draft can never leak onto
    // the site regardless of publishing or inventory.
    status: input.visible === false ? "DRAFT" : "ACTIVE",
    tags,
    metafields,
    seo: {
      title: `${input.name.trim()} — Golden Eagle`,
      description: plainSummary(input, type.label),
    },
    ...(descriptionHtml ? { descriptionHtml } : {}),
    ...(productOptions.length ? { productOptions } : {}),
    variants,
    ...(files.length ? { files } : {}),
  };

  // The handle is the live product URL. Generate it once at creation and never
  // touch it again — renaming a product must not break its links or its SEO.
  if (input.id) {
    productInput.id = input.id;
  } else {
    productInput.handle = slugify(input.name);
  }

  let saved: { id: string; handle: string; media: { id: string; alt: string | null }[]; variants: { id: string; selectedOptions: { name: string; value: string }[] }[] };
  try {
    const data = await adminFetch<{
      productSet: {
        product: {
          id: string;
          handle: string;
          media: { nodes: { id: string; alt: string | null }[] };
          variants: {
            nodes: {
              id: string;
              selectedOptions: { name: string; value: string }[];
            }[];
          };
        } | null;
        userErrors: { field: string[] | null; message: string }[];
      };
    }>({
      query: /* GraphQL */ `
        mutation StudioProductSet($input: ProductSetInput!) {
          productSet(input: $input, synchronous: true) {
            product {
              id
              handle
              media(first: 50) {
                nodes { id alt }
              }
              variants(first: 100) {
                nodes { id selectedOptions { name value } }
              }
            }
            userErrors { field message }
          }
        }
      `,
      variables: { input: productInput },
    });

    const err = data.productSet.userErrors[0];
    if (err) {
      return { ok: false, warnings, error: shopifyMessage(err.message) };
    }
    const p = data.productSet.product;
    if (!p) {
      return { ok: false, warnings, error: "Shopify didn't return the saved product." };
    }
    saved = {
      id: p.id,
      handle: p.handle,
      media: p.media.nodes,
      variants: p.variants.nodes,
    };
  } catch (e) {
    return { ok: false, warnings, error: friendlyError(e) };
  }

  /* --- attach each colour's photo to its variants ----------------- */
  // This is what makes the swatch row switch the gallery on the PDP. Matching
  // on alt text works because we wrote those alts ourselves, above.
  if (colors.length && saved.media.length) {
    const mediaForColor = new Map<string, string>();
    for (const color of colors) {
      const alt = altFor(color);
      const hit = saved.media.find((m) => m.alt === alt);
      if (hit) mediaForColor.set(color, hit.id);
    }

    const updates = saved.variants
      .map((v) => {
        const color = v.selectedOptions.find(
          (o) => o.name.toLowerCase() === "color",
        )?.value;
        const mediaId = color ? mediaForColor.get(color) : undefined;
        return mediaId ? { id: v.id, mediaId } : null;
      })
      .filter((u): u is { id: string; mediaId: string } => u !== null);

    if (updates.length) {
      try {
        await adminFetch<{
          productVariantsBulkUpdate: {
            userErrors: { message: string }[];
          };
        }>({
          query: /* GraphQL */ `
            mutation StudioVariantMedia(
              $productId: ID!
              $variants: [ProductVariantsBulkInput!]!
            ) {
              productVariantsBulkUpdate(
                productId: $productId
                variants: $variants
              ) {
                userErrors { message }
              }
            }
          `,
          variables: { productId: saved.id, variants: updates },
        });
      } catch {
        // Non-fatal: the gallery still groups shots by colour via alt text.
        warnings.push(
          "Photos saved, but couldn't be pinned to individual colours. " +
            "The product page will still group them by colour.",
        );
      }
    }
  }

  /* --- publish to every sales channel ----------------------------- */
  try {
    const pubs = await publicationIds();
    if (pubs.length) {
      await adminFetch<{
        publishablePublish: { userErrors: { message: string }[] };
      }>({
        query: /* GraphQL */ `
          mutation StudioPublish($id: ID!, $input: [PublicationInput!]!) {
            publishablePublish(id: $id, input: $input) {
              userErrors { message }
            }
          }
        `,
        variables: {
          id: saved.id,
          input: pubs.map((publicationId) => ({ publicationId })),
        },
      });
    }
  } catch {
    warnings.push(
      "Saved, but couldn't confirm publishing to all sales channels. " +
        "Check Publishing on the product in Shopify if it doesn't appear.",
    );
  }

  return { ok: true, productId: saved.id, handle: saved.handle, warnings };
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

/** Products for the Studio list, newest edit first. */
export async function listStudioProducts(
  first = 50,
): Promise<StudioListItem[]> {
  const data = await adminFetch<{
    products: {
      nodes: {
        id: string;
        handle: string;
        title: string;
        status: string;
        productType: string;
        totalInventory: number;
        updatedAt: string;
        featuredMedia: { preview: { image: { url: string } | null } | null } | null;
        priceRangeV2: { minVariantPrice: { amount: string } };
      }[];
    };
  }>({
    query: /* GraphQL */ `
      query StudioProducts($first: Int!) {
        products(first: $first, sortKey: UPDATED_AT, reverse: true) {
          nodes {
            id
            handle
            title
            status
            productType
            totalInventory
            updatedAt
            featuredMedia { preview { image { url } } }
            priceRangeV2 { minVariantPrice { amount } }
          }
        }
      }
    `,
    // No cache: the Studio must always show what Shopify actually holds right
    // now, including a product saved seconds ago.
    variables: { first },
  });

  return data.products.nodes.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    status: p.status,
    productType: p.productType,
    priceLKR: Math.round(parseFloat(p.priceRangeV2.minVariantPrice.amount)),
    image: p.featuredMedia?.preview?.image?.url ?? null,
    totalInventory: p.totalInventory,
    updatedAt: p.updatedAt,
  }));
}

/** The saved state of one product, mapped back onto the Studio form's shape. */
export interface StudioProductDetail extends StudioProductInput {
  id: string;
  handle: string;
  status: string;
  /** Existing media, so the edit form can show and keep current photos. */
  photos: (StudioPhotoInput & { mediaId: string; url: string })[];
}

export async function getStudioProduct(
  id: string,
): Promise<StudioProductDetail | null> {
  const data = await adminFetch<{
    product: {
      id: string;
      handle: string;
      title: string;
      status: string;
      productType: string;
      description: string;
      tags: string[];
      media: {
        nodes: {
          id: string;
          alt: string | null;
          preview: { image: { url: string } | null } | null;
        }[];
      };
      options: { name: string; optionValues: { name: string }[] }[];
      variants: {
        nodes: {
          id: string;
          price: string;
          compareAtPrice: string | null;
          inventoryPolicy: string;
          inventoryQuantity: number | null;
          selectedOptions: { name: string; value: string }[];
        }[];
      };
      collections: { nodes: { handle: string }[] };
      badge: { value: string } | null;
      fit: { value: string } | null;
      fabrication: { value: string } | null;
    } | null;
  }>({
    query: /* GraphQL */ `
      query StudioProduct($id: ID!) {
        product(id: $id) {
          id
          handle
          title
          status
          productType
          description
          tags
          media(first: 50) {
            nodes {
              id
              alt
              preview { image { url } }
            }
          }
          options { name optionValues { name } }
          variants(first: 100) {
            nodes {
              id
              price
              compareAtPrice
              inventoryPolicy
              inventoryQuantity
              selectedOptions { name value }
            }
          }
          collections(first: 10) { nodes { handle } }
          badge: metafield(namespace: "custom", key: "badge") { value }
          fit: metafield(namespace: "custom", key: "fit") { value }
          fabrication: metafield(namespace: "custom", key: "fabrication") { value }
        }
      }
    `,
    variables: { id },
  });

  const p = data.product;
  if (!p) return null;

  const opt = (name: string) =>
    p.options.find((o) => o.name.toLowerCase() === name)?.optionValues.map((v) => v.name) ?? [];
  const colors = opt("color");
  const sizes = opt("size");

  // Stock per size = the largest quantity across that size's colour variants.
  // The form edits one number per size, so collapsing on max keeps a re-save
  // from quietly reducing a colour that happens to hold more.
  const stock: Record<string, number> = {};
  for (const v of p.variants.nodes) {
    const size =
      v.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value ??
      ONE_SIZE;
    stock[size] = Math.max(stock[size] ?? 0, v.inventoryQuantity ?? 0);
  }

  const first = p.variants.nodes[0];

  // The product's own tag is the authoritative signal (it's what the smart
  // collection rule matches); collection membership is the fallback for
  // products created before the Studio existed.
  const typeLabel =
    [...TYPE_BY_LABEL.values()].find((t) => p.tags.includes(t.tag))?.label ??
    [...TYPE_BY_LABEL.values()].find((t) =>
      p.collections.nodes.some((c) => c.handle === t.collection),
    )?.label ??
    "T-Shirt";

  // productType is free text in Shopify and existing products use "men"
  // lowercase, so compare case-insensitively.
  const pt = p.productType.trim().toLowerCase();
  const audience: StudioAudience =
    pt === "women" ? "Women" : pt === "unisex" ? "Unisex" : "Men";

  return {
    id: p.id,
    handle: p.handle,
    status: p.status,
    name: p.title,
    typeLabel,
    audience,
    priceLKR: Math.round(parseFloat(first?.price ?? "0")),
    compareAtLKR: first?.compareAtPrice
      ? Math.round(parseFloat(first.compareAtPrice))
      : undefined,
    colors,
    sizes,
    stock,
    backorder: first?.inventoryPolicy === "CONTINUE",
    visible: p.status === "ACTIVE",
    description: p.description,
    badge: p.badge?.value ?? undefined,
    fit: p.fit?.value ?? undefined,
    fabrication: p.fabrication?.value ?? undefined,
    photos: p.media.nodes
      .filter((m) => m.preview?.image?.url)
      .map((m) => ({
        mediaId: m.id,
        url: m.preview!.image!.url,
        // Recover the colour tag from the alt text we wrote on save.
        color: colors.find((c) => (m.alt ?? "").includes(c)),
      })),
  };
}

/**
 * Hide a product from the storefront. Archive rather than delete: it disappears
 * from the site immediately but stays attached to past orders and can be undone
 * in Shopify. There is no delete path in the Studio on purpose.
 */
export async function archiveStudioProduct(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const data = await adminFetch<{
      productUpdate: {
        product: { id: string } | null;
        userErrors: { message: string }[];
      };
    }>({
      query: /* GraphQL */ `
        mutation StudioArchive($product: ProductUpdateInput!) {
          productUpdate(product: $product) {
            product { id }
            userErrors { message }
          }
        }
      `,
      variables: { product: { id, status: "ARCHIVED" } },
    });
    const err = data.productUpdate.userErrors[0];
    if (err) return { ok: false, error: shopifyMessage(err.message) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

/**
 * Permanently delete a product.
 *
 * Unlike `archiveStudioProduct` this cannot be undone: the product, its
 * variants and its media links are gone, and anything that referenced it by id
 * (analytics, reports, draft orders) loses the reference. Past orders keep their
 * own snapshot of the line item, so order history stays readable, but it no
 * longer links anywhere.
 *
 * Archiving is the right answer almost every time — this exists because the
 * owner explicitly asked for a way to clear out mistakes and test products, and
 * the UI guards it behind typing DELETE.
 */
export async function deleteStudioProduct(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const data = await adminFetch<{
      productDelete: {
        deletedProductId: string | null;
        userErrors: { message: string }[];
      };
    }>({
      query: /* GraphQL */ `
        mutation StudioDelete($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors { message }
          }
        }
      `,
      variables: { input: { id } },
    });
    const err = data.productDelete.userErrors[0];
    if (err) return { ok: false, error: shopifyMessage(err.message) };
    if (!data.productDelete.deletedProductId) {
      return { ok: false, error: "Shopify didn't confirm the deletion." };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyError(e) };
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** ~150-char plain-text summary for the Shopify SEO fields. */
function plainSummary(input: StudioProductInput, typeLabel: string): string {
  const colors = input.colors.length
    ? ` in ${input.colors.slice(0, 3).join(", ")}`
    : "";
  return `${input.name} — Golden Eagle ${typeLabel.toLowerCase()}${colors}. LKR ${input.priceLKR.toLocaleString("en-LK")}. Free island-wide delivery over LKR 20,000.`.slice(
    0,
    320,
  );
}

/** Translate the Shopify errors worth explaining; pass the rest through. */
function shopifyMessage(message: string): string {
  if (/handle.*(taken|already)/i.test(message)) {
    return "A product with this name already exists. Try a slightly different name.";
  }
  return message;
}

function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/ACCESS_DENIED|access scope/i.test(msg)) {
    return (
      "Shopify refused the request because the app is missing a permission. " +
      "Check the Admin app's scopes include write_products and write_files."
    );
  }
  if (/not configured/i.test(msg)) {
    return "The Shopify Admin connection isn't configured on this server.";
  }
  return `Shopify rejected the save: ${msg}`;
}
