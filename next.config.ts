import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only honours `quality` values listed here; 75 is the default and
    // 95 is used for the high-detail brand logo in the footer.
    qualities: [75, 95],
    // Real product photography will be served from the Shopify CDN once the
    // headless backend is wired up. Placeholder tiles use no remote images yet.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
