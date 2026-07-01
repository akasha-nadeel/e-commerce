import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarouselRow } from "@/components/carousel-row";
import { ProductCard } from "@/components/product-card";
import { ProductView } from "@/components/product/product-view";
import { ProductReviews } from "@/components/product/product-reviews";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";

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

  const related = await getRelatedProducts(slug);

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

      {/* Gallery + purchase (shared colour state) */}
      <ProductView product={product} />

      {/* Reviews */}
      <ProductReviews
        rating={product.rating ?? 4.8}
        reviewCount={product.reviewCount ?? 120}
        seed={product.slug}
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
