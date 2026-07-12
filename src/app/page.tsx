import Image from "next/image";
import Link from "next/link";
import { CarouselRow } from "@/components/carousel-row";
import { TileCarousel } from "@/components/tile-carousel";
import { ProductCard } from "@/components/product-card";
import { LogoMarquee } from "@/components/logo-marquee";
import { PromoBanner } from "@/components/promo-banner";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { getLatestStyles, getRecommendedProducts } from "@/lib/products";

// Rotating hero slides — the studio image + garment lifestyle shots.
const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero-golden-eagle-v2.webp",
    imageClassName: "object-cover object-right lg:object-[50%_72%]",
    titleLines: ["Own", "The Day"],
    subtitle:
      "Premium heavyweight essentials for men and women — built from the ground up to move with you, all day, every day.",
    ctas: [
      { label: "Shop Men", href: "/collections/men", variant: "solid" },
      { label: "Shop Women", href: "/collections/women", variant: "outline" },
    ],
  },
  {
    image: "/collection-hero-polo-bg.webp",
    imageClassName: "object-cover object-[68%_center]",
    titleLines: ["Smart", "Casual"],
    subtitle:
      "Breathable piqué polos in striped and solid styles, finished with the gold Golden Eagle mark — dress them up or keep it easy.",
    ctas: [{ label: "Shop Polos", href: "/collections/polo", variant: "solid" }],
  },
  {
    image: "/collection-hero-hoody-bg.webp",
    imageClassName: "object-cover object-center",
    titleLines: ["Cozy", "Layers"],
    subtitle:
      "Heavyweight fleece hoodies with a soft brushed interior and relaxed fit — built for cold mornings and easy everyday layering.",
    ctas: [{ label: "Shop Hoodies", href: "/collections/hoody", variant: "solid" }],
  },
  {
    image: "/collection-hero-tanks-bg.webp",
    imageClassName: "object-cover object-[60%_center]",
    titleLines: ["Summer", "Ready"],
    subtitle:
      "Lightweight, breathable tanks cut for movement — built for hot days, hard training, and everywhere the summer takes you.",
    ctas: [{ label: "Shop Tanks", href: "/collections/tanks", variant: "solid" }],
  },
];

export default async function HomePage() {
  const [latestStyles, recommended] = await Promise.all([
    getLatestStyles(),
    getRecommendedProducts(),
  ]);
  return (
    <div className="w-full bg-white">
      {/* ---------------------------------------------------------------- */}
      {/* Hero — full-screen auto-rotating slideshow; nav overlays it.       */}
      {/* Kept OUTSIDE the overflow-x-hidden wrapper so its negative top     */}
      {/* margin can slide under the transparent nav without being clipped.  */}
      {/* ---------------------------------------------------------------- */}
      <HeroCarousel slides={HERO_SLIDES} />

      {/* Everything below the hero keeps the horizontal-overflow guard. */}
      <div className="overflow-x-hidden">
      {/* Brand marquee */}
      <LogoMarquee />
      {/* ---------------------------------------------------------------- */}
      {/* Shop the latest styles                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="pb-6 pt-16">
        <CarouselRow title="Shop The Latest Styles" shopAllHref="/collections/all">
          {latestStyles.map((p, i) => (
            <ProductCard key={p.slug} product={p} delay={(i % 4) * 0.1} />
          ))}
        </CarouselRow>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* First-order discount banner — surfaced early (right after the     */}
      {/* first product row) so new visitors browse the whole site knowing  */}
      {/* they'll save 20% on their first order.                            */}
      {/* ---------------------------------------------------------------- */}
      <PromoBanner />

      {/* ---------------------------------------------------------------- */}
      {/* Shop by department — Women / Men                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] px-5 pb-4 pt-16 sm:px-8">
        <Reveal x={-30} y={0} duration={0.9}>
          <div className="mb-[26px]">
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.24em] text-[#8a8a8e]">
              Find Your Fit
            </div>
            <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
              Shop By Department
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Reveal y={-44} duration={1.05} delay={0.15}>
            <DepartmentPanel
              eyebrow="Women's Collection"
              title="Shop Women"
              href="/collections/women"
              image="/dept-women-wide-v2.jpg"
              imageClassName="object-cover object-center origin-bottom scale-[1.6] translate-x-[24%] translate-y-[26%] sm:scale-[1.3] sm:translate-x-[12%] sm:translate-y-[21%]"
              align="top"
              bg="#875ea0"
              buttonHoverOnly
              ctaClassName="bg-[#4f2c7c] text-white hover:bg-[#3d2161]"
              textDelay={0.7}
            />
          </Reveal>
          <Reveal y={-44} duration={1.05} delay={0.32}>
            <DepartmentPanel
              eyebrow="Men's Collection"
              title="Shop Men"
              href="/collections/men"
              image="/dept-men-wide.png"
              imageClassName="object-cover object-center translate-x-[8%] sm:translate-x-0"
              align="top"
              bg="#0c0d0f"
              buttonHoverOnly
              ctaClassName="bg-[#cc1007] text-white hover:bg-[#a30c04]"
              textDelay={0.87}
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Shop by category                                                 */}
      {/* ---------------------------------------------------------------- */}
      <TileCarousel
        id="shop-by-category"
        eyebrow="Build Your Style"
        title="Shop By Category"
        control={
          <Button href="/collections/all" size="sm" arrow>
            View All
          </Button>
        }
      >
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal y={-44} duration={1.05}>
            <CategoryTile
              name="T-Shirts"
              caption="Everyday Essentials"
              href="/collections/t-shirts"
              image="/category-tshirt-v6.webp"
              imageClassName="object-cover object-center"
              nameTop
              overlay={false}
              nameColor="#0c0c0d"
              bg="#d8d6d2"
              textDelay={0.55}
            />
          </Reveal>
        </div>
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal y={-44} duration={1.05} delay={0.18}>
            <CategoryTile
              name="Polos"
              caption="Smart Casual"
              href="/collections/polo"
              image="/category-polo-v3.webp"
              imageClassName="object-cover object-center"
              nameTop
              overlay={false}
              nameColor="#0c0c0d"
              bg="#bcd8ea"
              textDelay={0.73}
            />
          </Reveal>
        </div>
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal y={-44} duration={1.05} delay={0.36}>
            <CategoryTile
              name="Hoodies"
              caption="Cozy Layers"
              href="/collections/hoody"
              image="/category-hoody-v8.webp"
              imageClassName="object-cover object-center"
              nameTop
              overlay={false}
              nameColor="#0c0c0d"
              bg="#e7e5e0"
              textDelay={0.91}
            />
          </Reveal>
        </div>
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal y={-44} duration={1.05} delay={0.54}>
            <CategoryTile
              name="Tanks"
              caption="Summer Ready"
              href="/collections/tanks"
              image="/category-tank-v2.webp"
              imageClassName="object-cover object-center"
              nameTop
              overlay={false}
              nameColor="#0c0c0d"
              bg="#d8c9c1"
              textDelay={1.09}
            />
          </Reveal>
        </div>
      </TileCarousel>

      {/* ---------------------------------------------------------------- */}
      {/* Accessories                                                      */}
      {/* ---------------------------------------------------------------- */}
      <TileCarousel
        id="accessories"
        title="Accessories"
        control={
          <Button href="/collections/accessories" size="sm" arrow>
            View All
          </Button>
        }
      >
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal>
            <ActivityTile
              name="Caps"
              href="/collections/caps"
              image="/accessory-cap.webp"
              imageClassName="object-cover object-top"
              bg="#d9d6d2"
            />
          </Reveal>
        </div>
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal delay={0.1}>
            <ActivityTile
              name="Perfume"
              href="/collections/perfume"
              image="/accessory-perfume.webp"
              imageClassName="object-cover object-center"
              bg="#1b2530"
            />
          </Reveal>
        </div>
        <div className="w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]">
          <Reveal delay={0.2}>
            <ActivityTile
              name="Bottles"
              href="/collections/bottles"
              image="/accessory-bottle.webp"
              imageClassName="object-cover object-center"
              bg="#3a7bd5"
            />
          </Reveal>
        </div>
      </TileCarousel>

      {/* ---------------------------------------------------------------- */}
      {/* Campaign banner — closing CTA above the footer                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="mb-2 mt-12 px-5 sm:px-8">
      <section className="relative mx-auto flex min-h-[58vh] max-w-[1280px] items-start overflow-hidden rounded-3xl bg-[#b4d0eb] lg:items-center">
        <Image
          src="/campaign-v2.png"
          alt="Golden Eagle campaign — model in the graphic tee on a studio plinth"
          fill
          quality={100}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[72%_top] translate-y-[42%] lg:translate-y-0 lg:object-[72%_22%]"
        />
        {/* White scrim only on desktop, where the dark copy sits over the photo;
            on mobile the copy sits up top over the empty sky, no overlay. */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-white/35 via-white/5 to-transparent lg:block" />
        <div className="relative w-full px-8 py-10 sm:px-12 lg:py-16">
          <Reveal className="mx-auto flex max-w-[480px] flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
            <h2 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[1.02] text-[#0c0c0d]">
              <span className="block whitespace-nowrap">Built From</span>
              <span className="block whitespace-nowrap">The Ground Up</span>
            </h2>
            <p className="mb-[26px] mt-[18px] max-w-[440px] text-[16px] text-[#0c0c0d]/75">
              Heavyweight everyday essentials.
            </p>
            <Link
              href="/collections/new"
              className="inline-block rounded-none bg-[#1d1da8] px-6 py-3 text-[12px] font-semibold text-white no-underline transition-colors hover:bg-[#15158c] lg:px-10 lg:py-[17px] lg:text-[13px]"
            >
              Shop Now
            </Link>
          </Reveal>
        </div>
      </section>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* You may also like                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="pb-20 pt-10">
        <CarouselRow title="You May Also Like" shopAllHref="/collections/all">
          {recommended.map((p, i) => (
            <ProductCard key={p.slug} product={p} delay={(i % 4) * 0.1} />
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
  image,
  imageClassName = "object-cover object-center",
  nameTop = false,
  overlay = true,
  nameColor,
  textDelay = 0,
}: {
  name: string;
  caption: string;
  bg: string;
  href: string;
  dark?: boolean;
  image?: string;
  imageClassName?: string;
  nameTop?: boolean;
  /** Dark top gradient behind top-aligned labels (default true). Turn off when
   *  the image is light where the label sits and the text is dark. */
  overlay?: boolean;
  nameColor?: string;
  /** Delay (s) before the label slides in from the left — set > the card's own
   *  reveal delay so the text lands after the card has dropped in. */
  textDelay?: number;
}) {
  const captionColor = dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.3)";
  const resolvedNameColor = nameColor ?? (dark ? "#fff" : "#0c0c0d");
  return (
    <Link
      href={href}
      className={`group block aspect-[4/5] w-full overflow-hidden no-underline relative ${
        dark ? "tile-texture-dark" : "tile-texture-light"
      }`}
      style={{ background: bg }}
    >
      {image && (
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={image}
            alt=""
            fill
            quality={100}
            /* Generous sizes: a landscape image scaled to fill this tall card
               (object-cover) renders ~1.8x the card width, so request a large
               candidate to keep it sharp. */
            sizes="(max-width: 1024px) 100vw, 820px"
            className={imageClassName}
          />
        </div>
      )}
      {image && nameTop && overlay && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-[5] h-1/2 bg-gradient-to-b from-black/55 via-black/15 to-transparent"
        />
      )}
      {nameTop ? (
        <Reveal
          x={-26}
          y={0}
          delay={textDelay}
          duration={0.9}
          className="absolute left-5 right-5 top-5 z-10"
        >
          <span
            className={`block text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[12px] ${
              dark ? "text-white/85" : "text-black/55"
            }`}
          >
            {caption}
          </span>
          <span
            className="mt-2.5 block text-[clamp(22px,2.4vw,34px)] font-semibold leading-none"
            style={{ color: resolvedNameColor }}
          >
            {name}
          </span>
        </Reveal>
      ) : (
        <>
          <span
            className="absolute left-5 top-4 z-10 font-mono text-[9.5px] tracking-[0.12em]"
            style={{ color: captionColor }}
          >
            {caption}
          </span>
          <span
            className="absolute bottom-[18px] left-5 z-10 text-[clamp(22px,2.4vw,34px)] font-semibold"
            style={{ color: resolvedNameColor }}
          >
            {name}
          </span>
        </>
      )}

      {/* Circular add / shop badge */}
      <span
        aria-hidden
        className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0c0c0d] text-white shadow-[0_4px_14px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    </Link>
  );
}

function DepartmentPanel({
  eyebrow,
  title,
  caption,
  bg,
  href,
  image,
  imageClassName = "object-cover object-center",
  align = "bottom",
  center = false,
  buttonHoverOnly = false,
  ctaClassName = "bg-white text-[#0c0c0d] group-hover:bg-[#eec449]",
  textDelay = 0,
}: {
  eyebrow: string;
  title: string;
  caption?: string;
  bg: string;
  href: string;
  image?: string;
  imageClassName?: string;
  align?: "top" | "bottom";
  center?: boolean;
  buttonHoverOnly?: boolean;
  ctaClassName?: string;
  /** Delay (s) before the copy slides in from the left, after the card drops. */
  textDelay?: number;
}) {
  const top = align === "top";
  // When buttonHoverOnly is set, the CTA reacts to its own hover (not the whole
  // card); the arrow then follows the button's group instead of the card's.
  const arrowHover = buttonHoverOnly
    ? "group-hover/btn:translate-x-1"
    : "group-hover:translate-x-1";
  return (
    <Link
      href={href}
      className={`tile-texture-dark group relative flex aspect-[4/3] flex-col overflow-hidden p-7 no-underline sm:p-9 ${
        top ? "justify-start" : "justify-end"
      }`}
      style={{ background: bg }}
    >
      {image && (
        <>
          {/* Full-frame copy so any edge the positioned image leaves uncovered
              shows the photo's own background (an exact match), never the card
              bg colour — the transformed copy on top keeps the tuned framing. */}
          <Image
            src={image}
            alt=""
            fill
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 1400px) 48vw, 660px"
            className="object-cover object-center"
          />
          <Image
            src={image}
            alt=""
            fill
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 1400px) 48vw, 660px"
            className={imageClassName}
          />
        </>
      )}
      {/* Eyebrow pins to the top for bottom-aligned cards; for top-aligned cards
          it stacks with the title + CTA in the content block below. */}
      {!top && (
        <span className="absolute left-7 top-6 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 sm:left-9 sm:top-7">
          {eyebrow}
        </span>
      )}
      <div
        className={`relative z-10 ${
          center ? "flex flex-col items-center text-center" : ""
        }`}
      >
        <Reveal x={-28} y={0} delay={textDelay} duration={0.9}>
          {top && (
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/90 sm:mb-3">
              {eyebrow}
            </span>
          )}
          <h3 className="m-0 text-[clamp(26px,3.1vw,44px)] font-semibold leading-none text-white">
            {title}
          </h3>
          {caption && (
            <p className="mt-2 max-w-[200px] text-[11px] leading-snug text-white/65 sm:mt-3.5 sm:max-w-[300px] sm:text-[14px] sm:leading-relaxed">
              {caption}
            </p>
          )}
        </Reveal>
        {/* CTA rises up from the bottom, just after the copy slides in. */}
        <Reveal
          y={32}
          delay={textDelay + 0.22}
          duration={0.8}
          className="mt-3.5 sm:mt-6"
        >
          <span
            className={`inline-flex w-fit items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold transition-colors sm:gap-2 sm:px-6 sm:py-3 sm:text-[13px] ${
              buttonHoverOnly ? "group/btn" : ""
            } ${ctaClassName}`}
          >
            Shop Now
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              aria-hidden
              className={`transition-transform duration-200 ${arrowHover}`}
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </span>
        </Reveal>
      </div>
    </Link>
  );
}

function ActivityTile({
  name,
  bg,
  href,
  image,
  imageClassName = "object-cover object-center",
}: {
  name: string;
  bg: string;
  href: string;
  image?: string;
  imageClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="tile-texture-dark group relative block aspect-[4/5] w-full overflow-hidden no-underline"
      style={{ background: bg }}
    >
      {image && (
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={image}
            alt=""
            fill
            quality={100}
            sizes="(max-width: 1024px) 78vw, 460px"
            className={imageClassName}
          />
        </div>
      )}
      {image && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[5] h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
        />
      )}
      <span className="absolute bottom-5 left-[22px] z-10 text-[clamp(24px,2.6vw,40px)] font-semibold text-white">
        {name}
      </span>
    </Link>
  );
}
