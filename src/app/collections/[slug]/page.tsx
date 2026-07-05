import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { CollectionBrowser } from "@/components/collection/collection-browser";
import { Button } from "@/components/ui/button";
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
      image: "/collection-hero-t-shirts-v3.webp",
      title: "T-Shirts",
      subtitle: "Everyday heavyweight essentials.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
    },
  },
  polo: {
    title: "Polo",
    tagline: "Smart-casual staples, refined.",
    mixed: true,
    hero: {
      image: "/collection-hero-polo.webp",
      title: "Polo",
      subtitle: "Smart-casual staples, refined.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
      imageFit: "contain",
    },
  },
  hoody: {
    title: "Hoody",
    tagline: "Cozy layers for every day.",
    mixed: true,
    hero: {
      image: "/collection-hero-hoody.webp",
      title: "Hoody",
      subtitle: "Cozy layers for every day.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
    },
  },
  tanks: {
    title: "Tanks",
    tagline: "Built to move — train in Golden Eagle.",
    mixed: true,
    hero: {
      image: "/collection-hero-tanks.webp",
      title: "Tanks",
      subtitle: "Built to move — train in Golden Eagle.",
      cta: "Shop The Collection",
      href: "#products",
      bg: "#ffffff",
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

  return (
    <div className="w-full" style={{ background: c.hero?.bg ?? "#ffffff" }}>
      <div className="mx-auto max-w-[1400px] px-5 pt-5 sm:px-8">
        <BackButton fallbackHref="/" />
      </div>

      {c.hero && (
        <section className="mx-auto max-w-[1400px] px-5 pt-2 sm:px-8">
          {/* Split hero: copy left / product right on desktop; on mobile the
              image stacks on top (flex-col-reverse) and the copy sits below. */}
          <div className="flex flex-col-reverse items-center gap-1 lg:flex-row lg:gap-8">
            <div className="w-full pb-8 pt-2 text-center lg:w-[42%] lg:py-10 lg:text-left">
              <h1 className="display-tight m-0 text-[clamp(30px,4.6vw,60px)] font-semibold leading-[0.98] text-[#0c0c0d]">
                {c.hero.title}
              </h1>
              <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-[#0c0c0d]/70 sm:text-[17px] lg:mx-0">
                {c.hero.subtitle}
              </p>
              <div className="mt-6">
                <Button href={c.hero.href} size="lg" arrow>
                  {c.hero.cta}
                </Button>
              </div>
            </div>
            <div className="relative aspect-square w-full lg:w-[58%]">
              <Image
                src={c.hero.image}
                alt=""
                fill
                priority
                quality={100}
                sizes="(max-width: 1024px) 100vw, 780px"
                className={`${
                  c.hero.imageFit === "contain"
                    ? "object-contain"
                    : "object-cover"
                } object-center`}
              />
            </div>
          </div>
        </section>
      )}

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
    </div>
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
