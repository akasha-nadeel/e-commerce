import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { CollectionBrowser } from "@/components/collection/collection-browser";
import { PageTransition } from "@/components/ui/page-transition";
import { getCollectionProducts } from "@/lib/products";

type Collection = {
  title: string;
  tagline: string;
  /** Mixed collections expose the Category facet. */
  mixed?: boolean;
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
  },
  polo: {
    title: "Polo",
    tagline: "Smart-casual staples, refined.",
    mixed: true,
  },
  hoody: {
    title: "Hoodies",
    tagline: "Cozy layers for every day.",
    mixed: true,
  },
  tanks: {
    title: "Tanks",
    tagline: "Built to move — train in Golden Eagle.",
    mixed: true,
  },
  accessories: {
    title: "Accessories",
    tagline: "Caps, perfume and finishing touches.",
    mixed: true,
  },
  caps: {
    title: "Caps",
    tagline: "Finish the fit with a clean cap.",
    mixed: true,
  },
  perfume: {
    title: "Perfume",
    tagline: "Signature scents for every day.",
    mixed: true,
  },
  bottles: {
    title: "Bottles",
    tagline: "Stay hydrated in style.",
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
    <div className="w-full bg-white">
      <PageTransition>
        <div className="mx-auto max-w-[1400px] px-5 pt-5 sm:px-8">
          <BackButton fallbackHref="/" />
        </div>

        <section className="mx-auto max-w-[1400px] px-5 pb-6 pt-6 sm:px-8">
          <h1 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[0.95]">
            {c.title}
          </h1>
          <p className="mt-3 max-w-[520px] text-[15px] text-[#8a8a8e]">
            {c.tagline}
          </p>
        </section>

        <section
          id="products"
          className="mx-auto max-w-[1400px] scroll-mt-24 px-5 pb-20 sm:px-8"
        >
          <Suspense fallback={<GridSkeleton count={products.length} />}>
            <CollectionBrowser products={products} showCategory={c.mixed} />
          </Suspense>
        </section>
      </PageTransition>
    </div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
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
