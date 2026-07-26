/**
 * Shapes shared between the Studio form (a Client Component) and the Admin
 * write layer (`shopify/admin-products.ts`, which is `server-only`).
 *
 * They live here rather than in the server module on purpose. `import type`
 * from a `server-only` file happens to compile — the types erase, so no runtime
 * import survives — but it leaves a trap: the day someone adds a value import
 * alongside it, the Admin token's module gets pulled toward the client bundle
 * and the failure is a confusing build error far from the cause. A plain
 * type-only module can't be misused that way.
 */

export interface StudioPhotoInput {
  /** Existing Shopify media GID — set for a photo already on the product. */
  mediaId?: string;
  /** Staged upload `resourceUrl` — set for a newly added photo. */
  source?: string;
  /** Colour this shot belongs to. Undefined = shown for every colour. */
  color?: string;
  filename?: string;
}

export interface StudioProductInput {
  /** Shopify product GID. Absent when creating. */
  id?: string;
  name: string;
  /** A `STUDIO_TYPES` label, e.g. "T-Shirt". */
  typeLabel: string;
  audience: import("./options").StudioAudience;
  priceLKR: number;
  /** Original price for a sale; only applied when above the current price. */
  compareAtLKR?: number;
  /** Colour names from the brand palette. */
  colors: string[];
  /** Size labels; empty for one-size accessories. */
  sizes: string[];
  /** Units in stock per size label, applied to every colour of that size. */
  stock: Record<string, number>;
  /** Keep selling once stock hits zero (Shopify inventory policy CONTINUE). */
  backorder: boolean;
  /**
   * Live on the website (Shopify `ACTIVE`) vs held back (`DRAFT`).
   *
   * A draft is invisible to the Storefront API, so it cannot appear on the site
   * no matter what else is set. That makes it both the "prepare it now, publish
   * later" workflow and the only safe way to exercise this form against a live
   * store. Defaults to visible when omitted.
   */
  visible?: boolean;
  description?: string;
  badge?: string;
  fit?: string;
  fabrication?: string;
  photos: StudioPhotoInput[];
}

/** One row in the Studio's product list. */
export interface StudioListItem {
  id: string;
  handle: string;
  title: string;
  /** Shopify status: ACTIVE | DRAFT | ARCHIVED. */
  status: string;
  productType: string;
  priceLKR: number;
  image: string | null;
  totalInventory: number;
  updatedAt: string;
}

export interface SaveProductResult {
  ok: boolean;
  productId?: string;
  handle?: string;
  /** Non-fatal problems worth telling the client about. */
  warnings: string[];
  error?: string;
}
