import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

/**
 * Site-wide social share card. The root `metadata` declares a
 * `summary_large_image` Twitter card, which renders blank without an image —
 * this fills it, and Next reuses the same asset for `og:image` and
 * `twitter:image` on every page that doesn't supply its own (product pages
 * override it with their hero photo).
 *
 * Generated at build time, so it costs nothing at request time. Brand palette
 * matches `globals.css`: ink #0c0c0d, gold #c79a4b, bone #f3f1ea.
 */

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(130% 120% at 60% 25%, #34343a 0%, #1b1b1e 55%, #0a0a0b 100%)",
          color: "#f3f1ea",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#c79a4b",
            fontWeight: 600,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            marginTop: 34,
            width: 96,
            height: 4,
            backgroundColor: "#c79a4b",
          }}
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            color: "#a8a8ad",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          Premium tees, jerseys &amp; athleisure — men &amp; women
        </div>
      </div>
    ),
    size,
  );
}
