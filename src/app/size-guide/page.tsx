import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { JsonLd } from "@/components/json-ld";
import {
  CONTACT_EMAIL,
  SITE_NAME,
  WEBSITE_ID,
  absoluteUrl,
  breadcrumbNode,
  jsonLdGraph,
} from "@/lib/seo";
import { RETURN_WINDOW_DAYS } from "@/lib/shipping";
import {
  MEASURED_AS,
  MEASURED_AS_NOTE,
  SIZE_CHART,
  SIZE_UNIT,
  hasSizeChart,
} from "@/lib/sizing";

/**
 * Size guide.
 *
 * Backs the "Size Guide" link beside the size selector on every product page,
 * which previously pointed at `/account#size-guide` — a nonexistent anchor
 * behind a login wall, at the exact moment a shopper is deciding size.
 *
 * The measurement table is data-driven: fill in `SIZE_CHART` in
 * `lib/sizing.ts` and it renders here automatically. Until then the page
 * stands on its own with how-to-measure guidance and an offer to measure a
 * specific garment on request — real numbers have to come from measuring
 * actual stock, and inventing them would drive up returns.
 */

export const metadata: Metadata = {
  title: "Size Guide",
  description: `How to measure yourself and choose the right size in ${SITE_NAME} tees, jerseys, polos and hoodies — plus what to do if your fit falls between sizes.`,
  alternates: { canonical: "/size-guide" },
};

const MEASUREMENTS = [
  {
    name: "Chest",
    how: "Measure around the fullest part of your chest, keeping the tape level and under your arms. Breathe normally — don't puff out.",
  },
  {
    name: "Waist",
    how: "Measure around your natural waistline, just above the navel. Keep the tape snug but not tight.",
  },
  {
    name: "Shoulder",
    how: "Measure across your back from the outer edge of one shoulder to the other.",
  },
  {
    name: "Length",
    how: "From the highest point of the shoulder straight down to where you want the garment to end.",
  },
];

const FITS = [
  {
    name: "Oversized / Box Fit",
    detail:
      "Cut deliberately wide with dropped shoulders. Take your usual size for the intended relaxed look, or size down if you'd rather it sat closer to the body.",
  },
  {
    name: "Regular Fit",
    detail:
      "Our standard cut — straight through the body with a normal shoulder seam. Take your usual size.",
  },
  {
    name: "Between two sizes",
    detail:
      "Size up. Heavyweight cotton has very little stretch, so the larger size is almost always the more comfortable choice.",
  },
];

export default function SizeGuidePage() {
  const url = absoluteUrl("/size-guide");

  const jsonLd = jsonLdGraph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Size Guide",
      description: `How to measure yourself and choose the right size in ${SITE_NAME} clothing.`,
      isPartOf: { "@id": WEBSITE_ID },
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Size Guide", path: "/size-guide" },
    ]),
  );

  return (
    <div className="w-full bg-white">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-[820px] px-5 pt-5 sm:px-8">
        <BackButton fallbackHref="/" />
      </div>

      <section className="mx-auto max-w-[820px] px-5 pb-8 pt-6 sm:px-8">
        <h1 className="display-tight m-0 text-[clamp(34px,5vw,56px)] font-semibold leading-[0.95]">
          Size Guide
        </h1>
        <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7] text-[#8a8a8e]">
          Get the fit right first time. Here&rsquo;s how to measure, and how our
          cuts run.
        </p>
      </section>

      <section className="mx-auto max-w-[820px] px-5 pb-24 sm:px-8">
        <div className="rich-text text-[15px] leading-[1.75] text-[#4a4a4e]">
          <h2>How to measure</h2>
          <p>
            Use a soft measuring tape and measure over light clothing, or
            measure a garment you already own that fits the way you want and
            compare it flat.
          </p>

          <div className="my-6 grid gap-4 sm:grid-cols-2">
            {MEASUREMENTS.map((m) => (
              <div
                key={m.name}
                className="border border-[#e5e4e6] p-5"
              >
                <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#c79a4b]">
                  {m.name}
                </div>
                <p className="m-0 mt-2 text-[14px] leading-[1.65] text-[#4a4a4e]">
                  {m.how}
                </p>
              </div>
            ))}
          </div>

          <h2>How our cuts run</h2>
          <p>
            Every product page lists the specific fit for that style, and most
            include the model&rsquo;s height and the size they&rsquo;re wearing
            — the fastest way to judge a garment on a real body.
          </p>
          <ul>
            {FITS.map((f) => (
              <li key={f.name}>
                <strong>{f.name}</strong> — {f.detail}
              </li>
            ))}
          </ul>

          <h2>Clothing sizes</h2>
          <p>
            Tees, jerseys, polos and hoodies come in <strong>XS to XXL</strong>.
            Caps, bottles and perfume are one size.
          </p>

          {/* Renders automatically once `SIZE_CHART` in lib/sizing.ts is filled. */}
          {hasSizeChart && (
            <>
              <p>{MEASURED_AS_NOTE[MEASURED_AS]}</p>
              <div className="my-6 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-[#e5e4e6]">
                      {["Size", "Chest", "Waist", "Shoulder", "Length"].map(
                        (h) => (
                          <th
                            key={h}
                            className="py-2 pr-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a8a8e]"
                          >
                            {h}
                            {h !== "Size" && ` (${SIZE_UNIT})`}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((r) => (
                      <tr key={r.size} className="border-b border-[#efeef0]">
                        <td className="py-3 pr-4 font-medium text-[#0c0c0d]">
                          {r.size}
                        </td>
                        <td className="py-3 pr-4">{r.chest}</td>
                        <td className="py-3 pr-4">{r.waist}</td>
                        <td className="py-3 pr-4">{r.shoulder}</td>
                        <td className="py-3">{r.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <h2>Still not sure?</h2>
          <p>
            Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            with the style you&rsquo;re looking at and your measurements, and
            we&rsquo;ll measure the actual garment and tell you which size to
            take.
          </p>
          <p>
            And if it still isn&rsquo;t right when it arrives, you have{" "}
            {RETURN_WINDOW_DAYS} days to return it — see{" "}
            <Link href="/shipping-returns">Shipping &amp; Returns</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
