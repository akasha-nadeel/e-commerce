import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarouselRow } from "@/components/carousel-row";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { allSlugs, getProduct, relatedTo } from "@/lib/catalog";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} — Golden Egal`,
      description: product.description,
      type: "website",
    },
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = relatedTo(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    color: product.colors.map((c) => c.name),
    brand: { "@type": "Brand", name: "Golden Egal" },
    ...(product.rating && product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "LKR",
      price: product.priceLKR,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="w-full overflow-x-hidden bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1400px] px-5 pt-5 text-[13px] text-[#8a8a8e] sm:px-8">
        <Link href="/" className="text-[#8a8a8e] no-underline hover:text-[#0c0c0d]">
          Home
        </Link>{" "}
        /{" "}
        <Link
          href={`/collections/${product.category.toLowerCase()}`}
          className="text-[#8a8a8e] no-underline hover:text-[#0c0c0d]"
        >
          {product.category}
        </Link>{" "}
        / <span className="text-[#0c0c0d]">{product.name}</span>
      </div>

      {/* Gallery + purchase */}
      <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />
        <PurchasePanel product={product} />
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <div className="pb-20 pt-6">
          <CarouselRow title="You May Also Like">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </CarouselRow>
        </div>
      )}
    </div>
  );
}
