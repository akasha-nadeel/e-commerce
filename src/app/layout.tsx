import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { MotionGate } from "@/components/motion-gate";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChromeGate } from "@/components/chrome-gate";
import { JsonLd } from "@/components/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  jsonLdGraph,
  organizationNode,
  websiteNode,
} from "@/lib/seo";

// Apple's typography — San Francisco (SF Pro). It ships via the system font
// stack and isn't licensable as a webfont, so the CSS stack leads with
// -apple-system (genuine SF Pro on Mac/iPhone) and falls back to Inter, the
// closest metric-compatible substitute, on Windows/Android.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Premium T-Shirts & Athleisure in Sri Lanka`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Every page inherits a self-referencing canonical relative to its own
  // route; pages with query params (collections, search) override this.
  alternates: { canonical: "/" },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  // Tell crawlers they may show full-size image previews and untruncated
  // snippets — without this Google caps product image previews.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_LK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  // Phone-number autolinking mangles product copy and sizes on iOS Safari.
  formatDetection: { telephone: false, address: false, email: false },
  // Icons come from the file conventions in this directory (favicon.ico,
  // icon.png, apple-icon.png) — Next emits the <link> tags automatically.
  // The share card comes from `opengraph-image.tsx` alongside this file.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-LK" className={`${inter.variable} h-full`}>
      <head>
        {/* Product photography streams from the Shopify CDN — warming the
            connection early protects LCP, which is itself a ranking signal. */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        {/* Site-wide entity graph. Page-level structured data references these
            nodes by @id rather than redeclaring the brand on every page. */}
        <JsonLd data={jsonLdGraph(organizationNode, websiteNode)} />
        <CartProvider>
          <MotionGate>
            <ChromeGate>
              <SiteHeader />
            </ChromeGate>
            <main className="flex-1">{children}</main>
            <ChromeGate>
              <SiteFooter />
            </ChromeGate>
            <CartDrawer />
          </MotionGate>
        </CartProvider>

        {/* Vercel Web Analytics — cookieless page/referrer counts, no
            cross-site tracking and no persistent identifier, which is why it
            needs no consent banner. Last in <body> so it never delays paint.
            Disabled automatically outside production by the package itself, so
            local page views don't pollute the numbers. */}
        <Analytics />
      </body>
    </html>
  );
}
