import Image from "next/image";
import Link from "next/link";
import { CarouselRow } from "@/components/carousel-row";
import { ProductCard } from "@/components/product-card";
import { ActivitySwitch } from "@/components/activity-switch";
import { LogoMarquee } from "@/components/logo-marquee";
import { PromoBanner } from "@/components/promo-banner";
import { Button } from "@/components/ui/button";
import { accessories, latestStyles, recommended } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="w-full bg-white">
      {/* ---------------------------------------------------------------- */}
      {/* Hero — full-screen studio image; nav overlays it transparently.   */}
      {/* Kept OUTSIDE the overflow-x-hidden wrapper so its negative top     */}
      {/* margin can slide under the transparent nav without being clipped.  */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative -mt-[74px] flex min-h-screen items-end overflow-hidden bg-[#17120f] pt-[74px] lg:items-center">
        <Image
          src="/hero-golden-eagle.jpg"
          alt="Golden Eagle black hoodie with gold eagle embroidery on a dark studio backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] lg:object-center"
        />
        {/* Dark scrim for text legibility (stronger at the bottom on mobile, on
            the left on desktop where the headline sits) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-black/70 lg:via-black/15 lg:to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-14 sm:px-8 lg:pb-0">
          <div className="max-w-[540px]">
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/60">
              New Collection
            </p>
            <h1 className="display-tight m-0 text-[clamp(44px,7vw,104px)] font-semibold leading-[0.95] text-white">
              Be Better
              <br />
              Everyday
            </h1>
            <p className="mb-8 mt-5 text-[clamp(15px,1.4vw,20px)] text-white/75">
              Explore the Golden Egal collection.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <Link
                href="/collections/men"
                className="rounded-none bg-[#c79a4b] px-9 py-4 text-[13px] font-semibold text-[#0c0c0d] no-underline transition-colors hover:bg-[#b3863a] hover:text-[#0c0c0d]"
              >
                Shop Men
              </Link>
              <Link
                href="/collections/women"
                className="rounded-none border border-white bg-transparent px-9 py-4 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-white hover:text-[#0c0c0d]"
              >
                Shop Women
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Everything below the hero keeps the horizontal-overflow guard. */}
      <div className="overflow-x-hidden">
      {/* Brand marquee */}
      <LogoMarquee />
      {/* ---------------------------------------------------------------- */}
      {/* Shop the latest styles                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="pb-6 pt-16">
        <CarouselRow title="Shop The Latest Styles" shopAllHref="/collections/all">
          {latestStyles.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </CarouselRow>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* First-order discount banner                                      */}
      {/* ---------------------------------------------------------------- */}
      <PromoBanner />

      {/* ---------------------------------------------------------------- */}
      {/* Shop by category                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-5 pb-4 pt-6 sm:px-8">
        <div className="mb-[26px] flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.24em] text-[#8a8a8e]">
              Build Your Style
            </div>
            <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
              Shop By Category
            </h2>
          </div>
          <Button
            href="/collections/all"
            size="sm"
            arrow
            className="hidden shrink-0 sm:inline-flex"
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CategoryTile
            name="T-Shirts"
            caption="CATEGORY · TEES"
            href="/collections/men"
            dark
            bg="radial-gradient(120% 120% at 40% 30%,#2a2a2e,#101012)"
          />
          <CategoryTile
            name="Oversized"
            caption="CATEGORY · OVERSIZED"
            href="/collections/all"
            bg="linear-gradient(150deg,#edecef,#dcdbdf)"
          />
          <CategoryTile
            name="Jerseys"
            caption="CATEGORY · JERSEYS"
            href="/collections/all"
            bg="linear-gradient(150deg,#ece9e1,#dad6c9)"
          />
          <CategoryTile
            name="Tanks"
            caption="CATEGORY · TANKS"
            href="/collections/women"
            dark
            bg="radial-gradient(120% 120% at 60% 30%,#26262a,#0d0d0f)"
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Train in Golden Egal                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-5 pb-6 pt-14 sm:px-8">
        <div className="mb-[26px] flex items-center justify-between gap-4">
          <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
            Train In Golden Egal
          </h2>
          <ActivitySwitch />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ActivityTile
            name="Running"
            href="/collections/all"
            bg="radial-gradient(120% 120% at 35% 25%,#33332f,#121210)"
          />
          <ActivityTile
            name="Rest Day"
            href="/collections/all"
            bg="radial-gradient(120% 120% at 60% 30%,#3a3128,#161210)"
          />
          <ActivityTile
            name="Studio"
            href="/collections/all"
            bg="radial-gradient(120% 120% at 45% 30%,#2f3338,#101315)"
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Accessories                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div id="accessories" className="scroll-mt-24 pb-6 pt-14">
        <CarouselRow title="Accessories" shopAllHref="/collections/accessories">
          {accessories.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </CarouselRow>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Campaign banner — closing CTA above the footer                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-2 mt-12 px-5 sm:px-8">
      <section className="relative mx-auto flex min-h-[58vh] max-w-[1280px] items-center overflow-hidden rounded-3xl bg-[#f4f4f5]">
        <Image
          src="/campaign-v2.png"
          alt="Golden Egal campaign — model in the graphic tee on a studio plinth"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[75%_0%]"
        />
        {/* Left-anchored white scrim keeps the dark copy legible — strong on
            mobile (where the model fills the frame), barely-there on desktop. */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent lg:from-white/35 lg:via-white/5 lg:to-transparent" />
        <div className="relative w-full px-8 py-16 sm:px-12">
          <div className="max-w-[480px]">
            <div className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.3em] text-[#0c0c0d]">
              New Drop
            </div>
            <h2 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[1.02] text-[#0c0c0d]">
              <span className="block whitespace-nowrap">Built From</span>
              <span className="block whitespace-nowrap">The Ground Up</span>
            </h2>
            <p className="mb-[26px] mt-[18px] max-w-[440px] text-[16px] text-[#0c0c0d]/75">
              Heavyweight tees engineered for everyday wear. Built for comfort,
              styled for every day.
            </p>
            <Link
              href="/collections/new"
              className="inline-block rounded-none bg-[#0c0c0d] px-10 py-[17px] text-[13px] font-semibold text-white no-underline transition-colors hover:bg-white hover:text-[#0c0c0d]"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* You may also like                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="pb-20 pt-10">
        <CarouselRow title="You May Also Like" shopAllHref="/collections/all">
          {recommended.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </CarouselRow>
      </div>
      </div>
    </div>
  );
}

function CategoryTile({
  name,
  caption,
  bg,
  href,
  dark = false,
}: {
  name: string;
  caption: string;
  bg: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative aspect-[3/4] overflow-hidden no-underline ${
        dark ? "tile-texture-dark" : "tile-texture-light"
      }`}
      style={{ background: bg }}
    >
      <span
        className="absolute left-5 top-4 z-10 font-mono text-[9.5px] tracking-[0.12em]"
        style={{ color: dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.3)" }}
      >
        {caption}
      </span>
      <span
        className="absolute bottom-[18px] left-5 z-10 text-[clamp(22px,2.4vw,34px)] font-semibold"
        style={{ color: dark ? "#fff" : "#0c0c0d" }}
      >
        {name}
      </span>
    </Link>
  );
}

function ActivityTile({
  name,
  bg,
  href,
}: {
  name: string;
  bg: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="tile-texture-dark relative aspect-[4/5] overflow-hidden no-underline"
      style={{ background: bg }}
    >
      <span className="absolute bottom-5 left-[22px] z-10 text-[clamp(24px,2.6vw,40px)] font-semibold text-white">
        {name}
      </span>
    </Link>
  );
}
