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
  experimental: {
    // Review photo uploads go through a server action; allow room for a few
    // (client-resized) images per submission.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
