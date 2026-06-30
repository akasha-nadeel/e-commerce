import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChromeGate } from "@/components/chrome-gate";

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

const SITE_URL = "https://goldenegal.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Golden Egal — Premium T-Shirts for Men & Women",
    template: "%s · Golden Egal",
  },
  description:
    "Premium heavyweight tees, jerseys and athleisure for men and women. Built from the ground up — be better everyday. Free island-wide shipping over LKR 20,000.",
  keywords: [
    "Golden Egal",
    "premium t-shirts Sri Lanka",
    "oversized tees",
    "jerseys",
    "athleisure",
    "men's t-shirts",
    "women's t-shirts",
  ],
  openGraph: {
    type: "website",
    siteName: "Golden Egal",
    title: "Golden Egal — Be Better Everyday",
    description:
      "Premium heavyweight tees, jerseys and athleisure for men and women.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Egal — Be Better Everyday",
    description:
      "Premium heavyweight tees, jerseys and athleisure for men and women.",
  },
  icons: { icon: "/logo-eagle-black-v2.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col overflow-x-clip bg-white">
        <CartProvider>
          <ChromeGate>
            <SiteHeader />
          </ChromeGate>
          <main className="flex-1">{children}</main>
          <ChromeGate>
            <SiteFooter />
          </ChromeGate>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
