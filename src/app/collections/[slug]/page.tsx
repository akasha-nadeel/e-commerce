import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { CollectionBrowser } from "@/components/collection/collection-browser";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { getCollectionProducts } from "@/lib/products";

/** Optional campaign hero banner shown at the top of a collection page. */
type Hero = {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Page background colour, matched to the hero image so it blends seamlessly. */
  bg: string;
  /** "cover" (default) fills the square for single centred products; "contain"
   *  shows a wide image (e.g. two products) in full without cropping. */
  imageFit?: "cover" | "contain";
  /** "split" (default) = copy left / product right. "background" = full-bleed
   *  lifestyle photo with the copy overlaid, for non-product shots. */
  layout?: "split" | "background";
  /** CSS object-position for the background layout, to frame the subject
   *  (e.g. "70% 25%"). Defaults to "62% 28%". */
  imagePosition?: string;
};

type Collection = {
  title: string;
  tagline: string;
  /** Mixed collections expose the Category facet. */
  mixed?: boolean;
  hero?: Hero;
};

const COLLECTIONS: Record<string, Collection> = {
  all: {
    title: "All Products",
    tagline: "The full Golden Eagle collection.",
    mixed: true,
  },
  new: {
    title: "New In",
    tagline: "The latest drops, fresh off the press.",
    mixed: true,
  },
  men: {
    title: "Men",
    tagline: "Built from the ground up — own the day.",
  },
  women: {
    title: "Women",
    tagline: "Premium tees and jerseys, engineered to move.",
  },
  // Garment-type collections (the Shop By Category cards). Populate by creating
  // Smart collections with these handles in Shopify. `mixed` shows the gender
  // facet, since a garment type spans men/women.
  "t-shirts": {
    title: "T-Shirts",
    tagline: "Everyday heavyweight essentials.",
    mixed: true,
    hero: {
      image: "/collection-hero-t-shirts-bg.webp",
      title: "T-Shirts",
      subtitle:
        "Heavyweight cotton tees cut for everyday wear. Bold graphics and clean staples, finished with the gold Golden Eagle mark. Built to last, wash after wash.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
      layout: "background",
      imagePosition: "50% 34%",
    },
  },
  polo: {
    title: "Polo",
    tagline: "Smart-casual staples, refined.",
    mixed: true,
    hero: {
      image: "/collection-hero-polo-bg.webp",
      title: "Polo",
      subtitle:
        "Smart-casual polos in soft, breathable pique. Striped and solid styles finished with the gold Golden Eagle mark. Dress them up or keep it easy.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
      layout: "background",
      imagePosition: "70% 22%",
    },
  },
  hoody: {
    title: "Hoodies",
    tagline: "Cozy layers for every day.",
    mixed: true,
    hero: {
      image: "/collection-hero-hoody-bg.webp",
      title: "Hoodies",
      subtitle:
        "Heavyweight fleece hoodies built for cold mornings and easy layering. Soft brushed interior and a relaxed fit, finished with the gold Golden Eagle mark.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
      layout: "background",
      imagePosition: "50% 42%",
    },
  },
  tanks: {
    title: "Tanks",
    tagline: "Built to move — train in Golden Eagle.",
    mixed: true,
    hero: {
      image: "/collection-hero-tanks-bg.webp",
      title: "Tanks",
      subtitle:
        "Lightweight, breathable tanks built for hot days and hard training. Cut for movement, finished with the gold Golden Eagle mark, and made to be worn anywhere.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
      layout: "background",
    },
  },
  accessories: {
    title: "Accessories",
    tagline: "Caps, perfume and finishing touches.",
    mixed: true,
  },
};

export function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTIONS[slug];
  if (!c) return { title: "Collection" };
  return {
    title: c.title,
    description: c.tagline,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = COLLECTIONS[slug];
  if (!c) notFound();

  const products = await getCollectionProducts(slug);
  // A full-bleed background hero carries its own overlaid Back button, so the
  // usual padded Back row above the content is skipped for it.
  const bgHero = c.hero?.layout === "background";

  return (
    <div className="w-full" style={{ background: c.hero?.bg ?? "#ffffff" }}>
      <PageTransition>
        {!bgHero && (
          <div className="mx-auto max-w-[1400px] px-5 pt-5 sm:px-8">
            <BackButton fallbackHref="/" />
          </div>
        )}

        {c.hero && <CollectionHero hero={c.hero} />}

        {!c.hero && (
          <section className="mx-auto max-w-[1400px] px-5 pb-6 pt-6 sm:px-8">
            <h1 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[0.95]">
              {c.title}
            </h1>
            <p className="mt-3 max-w-[520px] text-[15px] text-[#8a8a8e]">
              {c.tagline}
            </p>
          </section>
        )}

        <section
          id="products"
          className={`mx-auto max-w-[1400px] scroll-mt-24 px-5 pb-20 sm:px-8 ${
            c.hero ? "pt-6" : ""
          }`}
        >
          <Suspense fallback={<GridSkeleton count={products.length} />}>
            <CollectionBrowser products={products} showCategory={c.mixed} />
          </Suspense>
        </section>
      </PageTransition>
    </div>
  );
}

function CollectionHero({ hero }: { hero: Hero }) {
  // Full-bleed lifestyle background with overlaid copy (non-product shots).
  if (hero.layout === "background") {
    return (
      <section className="relative h-[460px] overflow-hidden sm:h-[540px] lg:h-[620px]">
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: hero.imagePosition ?? "62% 28%" }}
        />
        {/* Dark bottom-left scrim keeps the white copy legible while leaving
            the subject on the right of the photo clear. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/20 to-transparent"
        />
        {/* Full-bleed hero, so Back is overlaid on the photo (top-left). */}
        <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
          <BackButton fallbackHref="/" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-[560px]">
              <h1
                className="animate-rise display-tight m-0 text-[clamp(30px,4.6vw,60px)] font-semibold leading-[0.98] text-white"
                style={{ animationDelay: "0.1s" }}
              >
                {hero.title}
              </h1>
              <p
                className="animate-rise mt-3 max-w-[400px] text-[13px] leading-relaxed text-white/80 sm:text-[14px]"
                style={{ animationDelay: "0.22s" }}
              >
                {hero.subtitle}
              </p>
              <div className="animate-rise mt-5" style={{ animationDelay: "0.34s" }}>
                <Button href={hero.href} size="md" arrow>
                  {hero.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Split hero: copy left / product right on desktop; on mobile the image
  // stacks on top (flex-col-reverse) and the copy sits below.
  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-2 sm:px-8">
      <div className="flex flex-col-reverse items-center gap-1 lg:flex-row lg:gap-8">
        <div className="w-full pb-8 pt-2 text-center lg:w-[42%] lg:py-10 lg:text-left">
          <h1
            className="animate-rise display-tight m-0 text-[clamp(30px,4.6vw,60px)] font-semibold leading-[0.98] text-[#0c0c0d]"
            style={{ animationDelay: "0.1s" }}
          >
            {hero.title}
          </h1>
          <p
            className="animate-rise mx-auto mt-3 max-w-[420px] text-[15px] text-[#0c0c0d]/70 sm:text-[17px] lg:mx-0"
            style={{ animationDelay: "0.22s" }}
          >
            {hero.subtitle}
          </p>
          <div className="animate-rise mt-6" style={{ animationDelay: "0.34s" }}>
            <Button href={hero.href} size="lg" arrow>
              {hero.cta}
            </Button>
          </div>
        </div>
        <div className="relative aspect-square w-full lg:w-[58%]">
          <Image
            src={hero.image}
            alt=""
            fill
            priority
            quality={100}
            sizes="(max-width: 1024px) 100vw, 780px"
            className={`${
              hero.imageFit === "contain" ? "object-contain" : "object-cover"
            } object-center`}
          />
        </div>
      </div>
    </section>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[3/4] w-full animate-pulse bg-[#eeedef]" />
          <div className="mt-3 h-3 w-2/3 animate-pulse bg-[#eeedef]" />
          <div className="mt-2 h-3 w-1/3 animate-pulse bg-[#eeedef]" />
        </div>
      ))}
    </div>
  );
}
