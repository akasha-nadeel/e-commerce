import type { MetadataRoute } from "next";
import { COLLECTION_SLUGS } from "@/lib/collections";
import { getAllProducts, getNonEmptyCollectionSlugs } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

/**
 * sitemap.xml — every indexable URL, built from the same data source the pages
 * render from, so it can't drift out of sync with the catalog.
 *
 * Private routes (account, checkout, login, signup) and the noindex search page
 * are intentionally absent. Product `lastModified` comes from Shopify's
 * `updatedAt` when the store is connected; in mock mode it's omitted rather
 * than faked, since a wrong lastmod trains crawlers to ignore the signal.
 */

// The revenue pages. Everything under /collections is worth crawling, but the
// department and newest-first views are the ones that should be crawled most.
const PRIORITY_COLLECTIONS = new Set(["all", "new", "men", "women"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, populated] = await Promise.all([
    getAllProducts(),
    getNonEmptyCollectionSlugs(),
  ]);
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Only collections that actually have products. A category page with nothing
  // on it reads to Google as thin content or a soft 404, and this store has
  // genuinely empty ones — the routes for hoodies, tanks, caps, perfume and
  // bottles exist before the stock does. They re-enter the sitemap on their own
  // as soon as a product lands in them, since this is computed from live data.
  const collections: MetadataRoute.Sitemap = COLLECTION_SLUGS.filter((slug) =>
    populated.has(slug),
  ).map((slug) => ({
    url: `${SITE_URL}/collections/${slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: PRIORITY_COLLECTIONS.has(slug) ? 0.9 : 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const content: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/shipping-returns`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/size-guide`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...home, ...collections, ...productPages, ...content];
}
