import type { MetadataRoute } from "next";
import { COLLECTION_SLUGS } from "@/lib/collections";
import { getAllProducts } from "@/lib/products";
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
  const products = await getAllProducts();
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const collections: MetadataRoute.Sitemap = COLLECTION_SLUGS.map((slug) => ({
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
