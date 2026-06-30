import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Golden Egal is a premium menswear and womenswear label built from the ground up — heavyweight tees, jerseys and athleisure engineered for everyday wear.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section
        className="tile-texture-dark relative flex min-h-[56vh] items-end overflow-hidden"
        style={{
          background:
            "radial-gradient(130% 120% at 60% 25%,#34343a 0%,#1b1b1e 55%,#0a0a0b 100%)",
        }}
      >
        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-8">
          <div className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.3em] text-[#c79a4b]">
            Our Story
          </div>
          <h1 className="display-tight m-0 max-w-[14ch] text-[clamp(40px,7vw,104px)] font-semibold leading-[0.92] text-white">
            Be Better Everyday
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-[820px] px-5 py-20 sm:px-8">
        <p className="m-0 text-[clamp(20px,2.4vw,30px)] font-bold leading-[1.4] tracking-[-0.01em]">
          Golden Egal is a premium label for men and women — built from the ground
          up for people who show up, train hard and live in what they wear.
        </p>
        <div className="mt-8 flex flex-col gap-5 text-[16px] leading-[1.7] text-[#4a4a4e]">
          <p className="m-0">
            We started with one obsession: the perfect heavyweight tee. No
            shortcuts — dense knits that hold their shape, considered fits that
            flatter without trying, and finishing that survives the wash pile.
            Everything we make is measured against that first standard.
          </p>
          <p className="m-0">
            From oversized jerseys to everyday essentials, each piece is designed
            in-house and built to be worn on repeat. Premium fabric, honest
            construction, and a clean aesthetic that lets the garment do the
            talking. Quietly confident. Made to last.
          </p>
          <p className="m-0">
            Proudly rooted in Sri Lanka and made for everywhere — Golden Egal is
            for the long run, not the next trend.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[1400px] px-5 pb-8 sm:px-8">
        <div className="grid grid-cols-1 gap-7 border-y border-[#e7e6e9] py-12 sm:grid-cols-3">
          <Value title="Built to Last" copy="Heavyweight fabrics and honest construction, engineered to outlive the trend cycle." />
          <Value title="Designed In-House" copy="Every fit, print and trim is developed by our own team — never off the shelf." />
          <Value title="Made for Everyday" copy="Premium pieces priced to actually wear, not save for a special occasion." />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 text-center sm:px-8">
        <h2 className="display-tight m-0 text-[clamp(28px,4vw,52px)] font-semibold leading-[0.95]">
          Built From The Ground Up
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] text-[15px] text-[#8a8a8e]">
          Explore the collection and find your everyday uniform.
        </p>
        <Link
          href="/collections/all"
          className="mt-7 inline-block rounded-none bg-[#0c0c0d] px-10 py-[18px] text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
        >
          Shop All
        </Link>
      </section>
    </div>
  );
}

function Value({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="text-center">
      <div className="mb-2 text-[20px] font-semibold">{title}</div>
      <div className="mx-auto max-w-[300px] text-[14px] leading-[1.6] text-[#8a8a8e]">
        {copy}
      </div>
    </div>
  );
}
