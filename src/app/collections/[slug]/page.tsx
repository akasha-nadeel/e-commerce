import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { CollectionBrowser } from "@/components/collection/collection-browser";
import { PageTransition } from "@/components/ui/page-transition";
import { getCollectionProducts } from "@/lib/products";
import { COLLECTIONS, COLLECTION_SLUGS } from "@/lib/collections";
import { JsonLd } from "@/components/json-ld";
import {
  FALLBACK_OG_IMAGE,
  SITE_NAME,
  WEBSITE_ID,
  absoluteUrl,
  breadcrumbNode,
  jsonLdGraph,
} from "@/lib/seo";

export function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = COLLECTIONS[slug];
  if (!c) return { title: "Collection", robots: { index: false } };

  const title = `${c.title} — Shop ${c.title} Online in Sri Lanka`;
  const description = `${c.tagline} Shop ${c.title.toLowerCase()} from ${SITE_NAME} with free island-wide delivery on orders over LKR 20,000.`;

  // Lead the share card with a real garment from the collection — far better
  // than a generic brand card. Defining `openGraph` below replaces the root's
  // inherited image, so this must always resolve to something.
  const products = await getCollectionProducts(slug);
  const hero = products.find((p) => p.images[0]?.src)?.images[0]?.src;

  return {
    title: c.title,
    description,
    // An empty category page is thin content, and keeping it out of the sitemap
    // isn't enough — the home page's Shop By Category cards link to every
    // collection, so Google will find it anyway. `follow` stays on so link
    // equity still flows through the page's own nav.
    ...(products.length === 0
      ? { robots: { index: false, follow: true } }
      : {}),
    // Filters and sorting are query params on this same route; the canonical
    // always points at the bare collection URL so faceted permutations
    // consolidate here instead of competing with each other.
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/collections/${slug}`),
      images: [
        {
          url: hero ?? FALLBACK_OG_IMAGE,
          alt: `${c.title} — ${SITE_NAME}`,
        },
      ],
    },
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
  const url = absoluteUrl(`/collections/${slug}`);

  // CollectionPage + ItemList: tells Google this URL is a product listing and
  // which PDPs it links to, which is what surfaces collection-level sitelinks.
  const collectionNode = {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: c.title,
    description: c.tagline,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: absoluteUrl(`/products/${p.slug}`),
      })),
    },
  };

  const breadcrumbs = breadcrumbNode([
    { name: "Home", path: "/" },
    { name: c.title, path: `/collections/${slug}` },
  ]);

  return (
    <div className="w-full bg-white">
      <JsonLd data={jsonLdGraph(collectionNode, breadcrumbs)} />
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
