/**
 * Map a Storefront API product onto the repo's `Product` type so every existing
 * component keeps working unchanged. `import type` keeps the mock catalog's
 * module-load code from running here.
 */
import type {
  Product,
  ProductColor,
  ProductSize,
  ProductImage,
  ProductVariant,
} from "@/lib/catalog";

/** The subset of Storefront `Product` fields requested in `queries.ts`. */
export type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  } | null;
  options: {
    name: string;
    optionValues: {
      name: string;
      swatch: { color: string | null } | null;
    }[];
  }[];
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
        image: { url: string; altText: string | null } | null;
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
  rating?: { value: string } | null;
  reviewCount?: { value: string } | null;
  badge?: { value: string } | null;
  swatches?: { value: string } | null;
};

const toLKR = (amount: string): number => Math.round(parseFloat(amount));

// Last-resort swatch colours by name, only used when Shopify has no native
// option-value swatch and no `custom.color_swatches` metafield override.
const SWATCH_BY_NAME: Record<string, string> = {
  "jet black": "#111111",
  black: "#111111",
  "antique white": "#f3f1ea",
  bone: "#f3f1ea",
  white: "#ffffff",
  indigo: "#1c2a44",
  navy: "#1c2a44",
  gold: "#c79a4b",
  olive: "#5b5f43",
  grey: "#8a8a8e",
  gray: "#8a8a8e",
  charcoal: "#2a2a2e",
  sand: "#d8c9a8",
  red: "#b3241f",
  orange: "#f97316",
  purple: "#4f2c7c",
};

function getOption(p: ShopifyProduct, name: string) {
  return p.options.find((o) => o.name.toLowerCase() === name.toLowerCase());
}

export function transformProduct(p: ShopifyProduct): Product {
  const colorOption = getOption(p, "Color");
  const colorNames = colorOption?.optionValues.map((v) => v.name) ?? [];
  const sizeLabels = getOption(p, "Size")?.optionValues.map((v) => v.name) ?? [];

  // Real swatch colours set in Shopify (per option value), keyed by name.
  const shopifySwatch: Record<string, string> = {};
  for (const v of colorOption?.optionValues ?? []) {
    if (v.swatch?.color) shopifySwatch[v.name] = v.swatch.color;
  }

  // Optional per-product JSON override metafield.
  let swatchMap: Record<string, string> = {};
  if (p.swatches?.value) {
    try {
      swatchMap = JSON.parse(p.swatches.value) as Record<string, string>;
    } catch {
      swatchMap = {};
    }
  }
  // Priority: metafield override → Shopify native swatch → name map → grey.
  const swatchFor = (name: string): string =>
    swatchMap[name] ??
    shopifySwatch[name] ??
    SWATCH_BY_NAME[name.toLowerCase()] ??
    "#8a8a8e";

  // First variant image seen for each colour, so selecting a colour can switch
  // the gallery. (Assign a distinct image per colour variant in Shopify.)
  const colorImage: Record<string, string> = {};
  for (const e of p.variants.edges) {
    const url = e.node.image?.url;
    if (!url) continue;
    const color = e.node.selectedOptions.find(
      (o) => o.name.toLowerCase() === "color",
    )?.value;
    if (color && !colorImage[color]) colorImage[color] = url;
  }

  const colors: ProductColor[] = colorNames.map((name) => ({
    name,
    swatch: swatchFor(name),
    image: colorImage[name],
  }));

  // A size is available when at least one sellable variant has that size.
  const sizeAvailable = (label: string): boolean =>
    p.variants.edges.some(
      (v) =>
        v.node.availableForSale &&
        v.node.selectedOptions.some(
          (o) => o.name.toLowerCase() === "size" && o.value === label,
        ),
    );
  const sizes: ProductSize[] =
    sizeLabels.length > 0
      ? sizeLabels.map((label) => ({ label, available: sizeAvailable(label) }))
      : [{ label: "OS", available: p.availableForSale }];

  const images: ProductImage[] = p.images.edges.map((e) => ({
    src: e.node.url,
    label: e.node.altText ?? p.title,
  }));

  const variants: ProductVariant[] = p.variants.edges.map((e) => ({
    id: e.node.id,
    availableForSale: e.node.availableForSale,
    selectedOptions: e.node.selectedOptions,
  }));

  const category = p.productType || p.tags[0] || "Men";
  const price = toLKR(p.priceRange.minVariantPrice.amount);
  const compareAt = p.compareAtPriceRange
    ? toLKR(p.compareAtPriceRange.minVariantPrice.amount)
    : 0;

  return {
    slug: p.handle,
    name: p.title,
    category,
    colorName: colorNames[0] ?? "",
    priceLKR: price,
    compareAtLKR: compareAt > price ? compareAt : undefined,
    colors,
    sizes,
    description: p.description,
    images,
    cardLabel: p.title.toUpperCase(),
    square: category.toLowerCase() === "accessories",
    rating: p.rating ? parseFloat(p.rating.value) : undefined,
    reviewCount: p.reviewCount
      ? parseInt(p.reviewCount.value, 10)
      : undefined,
    badge: p.badge?.value || undefined,
    variants,
  };
}
