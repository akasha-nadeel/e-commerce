import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Real product photography will be served from the Shopify CDN once the
    // headless backend is wired up. Placeholder tiles use no remote images yet.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
