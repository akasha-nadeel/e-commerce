import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt. Everything customer-facing is crawlable; the disallow list is
 * limited to routes that are private (account, checkout), server plumbing
 * (`/api`), or infinite/duplicate surfaces that waste crawl budget without
 * ranking — faceted collection URLs and search result pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/account",
          "/checkout",
          "/login",
          "/signup",
          // Internal product manager — never for crawlers.
          "/studio",
          // Faceted/sorted variants duplicate the canonical collection page.
          "/collections/*?",
          // Search results are noindex; keep crawlers out of the query space.
          "/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
