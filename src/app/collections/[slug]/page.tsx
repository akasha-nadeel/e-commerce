import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionBrowser } from "@/components/collection/collection-browser";
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
    tagline: "The full Golden Egal collection.",
    mixed: true,
  },
  new: {
    title: "New In",
    tagline: "The latest drops, fresh off the press.",
    mixed: true,
  },
  men: {
    title: "Men",
    tagline: "Built from the ground up — be better everyday.",
  },
  women: {
    title: "Women",
    tagline: "Premium tees and jerseys, engineered to move.",
  },
  accessories: {
    title: "Accessories",
    tagline: "Caps, totes and the finishing touches.",
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
      <section className="mx-auto max-w-[1400px] px-5 pb-6 pt-12 sm:px-8">
        <h1 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[0.95]">
          {c.title}
        </h1>
        <p className="mt-3 max-w-[520px] text-[15px] text-[#8a8a8e]">{c.tagline}</p>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8">
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
