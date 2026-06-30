import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only honours `quality` values listed here. Photos use 100 (no
    // visible recompression); 75 stays the default for any unmarked image.
    qualities: [75, 95, 100],
    // Real product photography will be served from the Shopify CDN once the
    // headless backend is wired up. Placeholder tiles use no remote images yet.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
