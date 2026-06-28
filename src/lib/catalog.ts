/**
 * Golden Egal product catalog.
 *
 * This module is the integration seam for the headless Shopify backend.
 * Today it returns typed mock data that mirrors the Claude Design prototype;
 * swapping these functions for Shopify Storefront API (GraphQL) calls later
 * keeps every consuming component unchanged.
 */

export interface ProductColor {
  name: string;
  /** CSS color used for the swatch chip. */
  swatch: string;
}

export interface ProductSize {
  label: string;
  available: boolean;
}

export interface ProductImage {
  /** Monospace caption shown on the placeholder tile until real photography lands. */
  label: string;
  /** Optional real image URL (Shopify CDN later); falls back to the tile when absent. */
  src?: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Breadcrumb / department, e.g. "Men", "Women", "Accessories". */
  category: string;
  /** Headline color name shown under the title and on cards. */
  colorName: string;
  priceLKR: number;
  /** Original ("compare at") price when on sale; renders a strike-through + discount badge. */
  compareAtLKR?: number;
  colors: ProductColor[];
  sizes: ProductSize[];
  description: string;
  images: ProductImage[];
  /** Short caption for card placeholder media. */
  cardLabel: string;
  /** Square media instead of 3:4 (used by accessories). */
  square?: boolean;
  /** Average rating out of 5 (filled in by the normalization step below). */
  rating?: number;
  /** Number of reviews. */
  reviewCount?: number;
  /** Optional merchandising badge, e.g. "New Arrival" / "Best Seller". */
  badge?: string;
}

const CLOTHING_SIZES: ProductSize[] = [
  { label: "XS", available: false },
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: false },
];

const ONE_SIZE: ProductSize[] = [{ label: "OS", available: true }];

function gallery(base: string): ProductImage[] {
  return [
    { label: `${base} · FRONT` },
    { label: `${base} · BACK` },
    { label: `${base} · DETAIL` },
    { label: `${base} · LIFESTYLE` },
  ];
}

export const PRODUCTS: Product[] = [
  {
    slug: "varsity-box-fit-jersey",
    name: "Varsity Box Fit Jersey",
    category: "Men",
    colorName: "Antique White",
    priceLKR: 5450,
    colors: [
      { name: "Antique White", swatch: "#f3f1ea" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Indigo", swatch: "#1c2a44" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "Oversized box fit jersey in a breathable mesh knit. Ribbed V-neck collar with contrast tipping, dropped shoulders and a varsity chest print. Built from the ground up for everyday wear. 100% polyester mesh. Model is 6'1\" wearing size S.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · VARSITY JERSEY",
  },
  {
    slug: "essential-oversized-tee",
    name: "Essential Oversized Tee",
    category: "Men",
    colorName: "Jet Black",
    priceLKR: 4500,
    colors: [
      { name: "Jet Black", swatch: "#111111" },
      { name: "Antique White", swatch: "#f3f1ea" },
      { name: "Indigo", swatch: "#1c2a44" },
      { name: "Gold", swatch: "#c79a4b" },
      { name: "Maroon", swatch: "#7a1f2b" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "A heavyweight 240gsm cotton tee with a relaxed oversized drop-shoulder fit. Pre-shrunk, garment-dyed and ribbed at the neck so it holds shape wash after wash. 100% combed cotton.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · ESSENTIAL TEE",
  },
  {
    slug: "heavyweight-crew-tee",
    name: "Heavyweight Crew Tee",
    category: "Men",
    colorName: "Bone",
    priceLKR: 4950,
    colors: [
      { name: "Bone", swatch: "#e9e4d8" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Sage", swatch: "#6b6f5e" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "Our heaviest everyday crew. Structured 260gsm loopback cotton with a clean ribbed collar and a straight true-to-size body. Built for layering. 100% cotton.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · CREW TEE",
  },
  {
    slug: "mesh-training-tee",
    name: "Mesh Training Tee",
    category: "Men",
    colorName: "Slate Grey",
    priceLKR: 4250,
    colors: [
      { name: "Slate Grey", swatch: "#8a8d92" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Indigo", swatch: "#1c2a44" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "Engineered mesh training tee that moves air where you need it. Lightweight, quick-drying and cut for an athletic range of motion. 100% recycled polyester.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · MESH TEE",
  },
  {
    slug: "prime-graphic-tee",
    name: "Prime Graphic Tee",
    category: "Men",
    colorName: "Washed Olive",
    priceLKR: 4650,
    colors: [
      { name: "Washed Olive", swatch: "#5f6347" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Antique White", swatch: "#f3f1ea" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "Mid-weight graphic tee with a vintage washed finish and a screen-printed back hit. Relaxed regular fit. 100% combed cotton.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · GRAPHIC TEE",
  },
  {
    slug: "varsity-full-sleeve-jersey",
    name: "Varsity Full Sleeve Jersey",
    category: "Men",
    colorName: "Jet Black",
    priceLKR: 5950,
    colors: [
      { name: "Jet Black", swatch: "#111111" },
      { name: "Antique White", swatch: "#f3f1ea" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "The long-sleeve cut of our varsity jersey. Breathable mesh body, ribbed cuffs and a contrast-tipped collar. Oversized box fit. 100% polyester mesh.",
    images: gallery("PRODUCT"),
    cardLabel: "MODEL · FULL SLEEVE",
  },
  {
    slug: "athlex-cross-back-tank",
    name: "Athlex Cross Back Tank",
    category: "Women",
    colorName: "Dandelion",
    priceLKR: 5950,
    colors: [
      { name: "Dandelion", swatch: "#e9c14a" },
      { name: "Antique White", swatch: "#f3f1ea" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Maroon", swatch: "#7a1f2b" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "A sculpted cross-back training tank in a soft four-way stretch knit. Bonded edges, a flattering scoop and a built-in shelf for low-to-medium support. 82% nylon, 18% elastane.",
    images: gallery("MODEL"),
    cardLabel: "MODEL · TANK",
  },
  {
    slug: "varsity-air-jersey",
    name: "Varsity Air Jersey",
    category: "Women",
    colorName: "Punch Pink",
    priceLKR: 5450,
    colors: [
      { name: "Punch Pink", swatch: "#d96aa0" },
      { name: "Antique White", swatch: "#f3f1ea" },
      { name: "Jet Black", swatch: "#111111" },
    ],
    sizes: CLOTHING_SIZES,
    description:
      "The lightest jersey we make. Ultra-fine air mesh with a cropped box fit and a tipped collar. Built to breathe. 100% polyester mesh.",
    images: gallery("MODEL"),
    cardLabel: "MODEL · AIR JERSEY",
  },
  {
    slug: "logo-cap",
    name: "Logo Cap",
    category: "Accessories",
    colorName: "Jet Black",
    priceLKR: 2500,
    colors: [
      { name: "Jet Black", swatch: "#111111" },
      { name: "Antique White", swatch: "#f3f1ea" },
    ],
    sizes: ONE_SIZE,
    description:
      "Six-panel cotton twill cap with a low-profile crown, embroidered Golden Egal mark and an adjustable strap back. One size fits most. 100% cotton.",
    images: gallery("PRODUCT"),
    cardLabel: "PRODUCT · CAP",
    square: true,
  },
  {
    slug: "essence-tote-bag",
    name: "Essence Tote Bag",
    category: "Accessories",
    colorName: "Jet Black",
    priceLKR: 9500,
    colors: [{ name: "Jet Black", swatch: "#111111" }],
    sizes: ONE_SIZE,
    description:
      "A structured heavyweight canvas tote with reinforced handles and an interior pocket. Roomy enough for the studio and the commute. 100% cotton canvas.",
    images: gallery("PRODUCT"),
    cardLabel: "PRODUCT · TOTE",
    square: true,
  },
  {
    slug: "classic-no-show-sock",
    name: "Classic No Show Sock",
    category: "Accessories",
    colorName: "Sheer White",
    priceLKR: 1250,
    colors: [
      { name: "Sheer White", swatch: "#f3f1ea" },
      { name: "Jet Black", swatch: "#111111" },
    ],
    sizes: ONE_SIZE,
    description:
      "Low-cut no-show socks with cushioned soles and a silicone heel grip that stays put. Sold as a three-pack. 80% cotton, 17% polyester, 3% elastane.",
    images: gallery("PRODUCT"),
    cardLabel: "PRODUCT · SOCK",
    square: true,
  },
  {
    slug: "staple-ankle-sock",
    name: "Staple Ankle Sock",
    category: "Accessories",
    colorName: "Sheer White",
    priceLKR: 1450,
    colors: [
      { name: "Sheer White", swatch: "#f3f1ea" },
      { name: "Jet Black", swatch: "#111111" },
      { name: "Slate Grey", swatch: "#8a8d92" },
    ],
    sizes: ONE_SIZE,
    description:
      "Ribbed ankle socks with arch support and a reinforced toe. Everyday comfort, three-pack. 80% cotton, 17% polyester, 3% elastane.",
    images: gallery("PRODUCT"),
    cardLabel: "PRODUCT · SOCK",
    square: true,
  },
  {
    slug: "beanie",
    name: "Beanie",
    category: "Accessories",
    colorName: "Charcoal",
    priceLKR: 2950,
    colors: [
      { name: "Charcoal", swatch: "#2c2c2e" },
      { name: "Jet Black", swatch: "#111111" },
    ],
    sizes: ONE_SIZE,
    description:
      "A fine-gauge ribbed knit beanie with a folded cuff and a woven Golden Egal tab. Warm without the bulk. 50% merino wool, 50% acrylic.",
    images: gallery("PRODUCT"),
    cardLabel: "PRODUCT · BEANIE",
    square: true,
  },
];

// Attach placeholder photography (web-optimized imports under
// public/products/) until the client supplies real product shots. Slot 0 is the
// hero (used on cards too); a few products also have a second angle in slot 1.
// Remaining slots stay as labelled tiles. Real Shopify CDN images replace these.
const SECOND_ANGLE = new Set([
  "varsity-box-fit-jersey",
  "essential-oversized-tee",
  "heavyweight-crew-tee",
  "mesh-training-tee",
  "prime-graphic-tee",
  "varsity-full-sleeve-jersey",
]);

for (const p of PRODUCTS) {
  p.images[0] = { ...p.images[0], src: `/products/${p.slug}.jpg` };
  if (SECOND_ANGLE.has(p.slug) && p.images[1]) {
    p.images[1] = { ...p.images[1], src: `/products/${p.slug}-2.jpg` };
  }
}

// Deterministic merchandising metadata (ratings/reviews) so the storefront has
// realistic social proof until Shopify product metafields/reviews are wired in.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const NEW_IN = new Set([
  "essential-oversized-tee",
  "varsity-box-fit-jersey",
  "athlex-cross-back-tank",
  "varsity-air-jersey",
]);

// Curated "on sale" set — compare-at price implies a ~30–35% discount.
const SALE_DISCOUNT: Record<string, number> = {
  "essential-oversized-tee": 0.33,
  "heavyweight-crew-tee": 0.3,
  "mesh-training-tee": 0.25,
  "logo-cap": 0.2,
};

for (const p of PRODUCTS) {
  const h = hash(p.slug);
  p.rating = Math.round((4.5 + (h % 5) / 10) * 10) / 10; // 4.5 – 4.9
  p.reviewCount = 40 + (h % 260); // 40 – 299
  if (NEW_IN.has(p.slug)) p.badge = "New Arrival";
  const disc = SALE_DISCOUNT[p.slug];
  if (disc) p.compareAtLKR = Math.round((p.priceLKR / (1 - disc)) / 50) * 50;
}

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return BY_SLUG.get(slug);
}

export function allSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

function pick(slugs: string[]): Product[] {
  return slugs.map((s) => BY_SLUG.get(s)).filter((p): p is Product => !!p);
}

/** Home — "Shop The Latest Styles". */
export const latestStyles = pick([
  "essential-oversized-tee",
  "varsity-box-fit-jersey",
  "heavyweight-crew-tee",
  "mesh-training-tee",
  "prime-graphic-tee",
]);

/** Home — "Accessories". */
export const accessories = pick([
  "logo-cap",
  "essence-tote-bag",
  "classic-no-show-sock",
  "staple-ankle-sock",
  "beanie",
]);

/** PDP — "You May Also Like". */
export function relatedTo(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.slug !== slug && p.category !== "Accessories").slice(
    0,
    5,
  );
}
