import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { CarouselRow } from "@/components/carousel-row";
import { ProductCard } from "@/components/product-card";
import { ProductView } from "@/components/product/product-view";
import { ProductReviews } from "@/components/product/product-reviews";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { getProductReviews } from "@/lib/reviews";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(slug),
    getProductReviews(slug),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    color: product.colors.map((c) => c.name),
    brand: { "@type": "Brand", name: "Golden Egal" },
    ...(reviews.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviews.average.toFixed(1)),
            reviewCount: reviews.count,
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
    <div className="w-full overflow-x-clip bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back */}
      <div className="mx-auto max-w-[1400px] px-5 pt-3 sm:px-8">
        <BackButton
          fallbackHref={`/collections/${product.category.toLowerCase()}`}
        />
      </div>

      {/* Gallery + purchase (shared colour state) */}
      <ProductView
        product={product}
        reviewAverage={reviews.average}
        reviewCount={reviews.count}
      />

      {/* Reviews */}
      <ProductReviews
        productHandle={product.slug}
        productTitle={product.name}
        reviews={reviews.reviews}
        summary={{
          count: reviews.count,
          average: reviews.average,
          breakdown: reviews.breakdown,
        }}
      />

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
