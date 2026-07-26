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
import { collectionHrefForCategory } from "@/lib/collections";
import { getProductReviews } from "@/lib/reviews";
import { formatLKR } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import {
  ORG_ID,
  SITE_NAME,
  absoluteUrl,
  breadcrumbNode,
  hasRealDescription,
  jsonLdGraph,
  merchantReturnPolicyNode,
  priceValidUntil,
  productDescription,
  shippingDetailsNode,
} from "@/lib/seo";

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
  if (!product)
    return { title: "Product not found", robots: { index: false } };

  // Search snippets truncate around 160 characters. A merchant-written
  // description gets the colour + price appended (it rarely states them); the
  // generated fallback already names the colours, so it's used as-is.
  const description = truncate(
    hasRealDescription(product)
      ? `${product.description.trim()} ${product.colorName} · ${formatLKR(product.priceLKR)}.`
      : productDescription(product),
    160,
  );

  const shareImages = product.images
    .map((img) => img.src)
    .filter((src): src is string => Boolean(src))
    .slice(0, 4)
    .map((src) => ({ url: src, alt: `${product.name} — ${SITE_NAME}` }));

  return {
    title: `${product.name} — ${product.category}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      // `og:type: product` unlocks price/availability tags in rich unfurls.
      type: "website",
      title: `${product.name} — ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/products/${product.slug}`),
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${SITE_NAME}`,
      description,
      images: shareImages.map((i) => i.url),
    },
  };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
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

  const url = absoluteUrl(`/products/${product.slug}`);

  // Sold-out sizes stay purchasable as backorders (Shopify inventory policy
  // CONTINUE), so a product with no in-stock size is BackOrder, never
  // OutOfStock — mislabelling it would suppress the listing entirely.
  const inStock = product.sizes.some((s) => s.available);

  const productNode = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: productDescription(product),
    category: product.category,
    sku: product.slug,
    color: product.colors.map((c) => c.name),
    size: product.sizes.map((s) => s.label),
    ...(product.fabrication ? { material: product.fabrication } : {}),
    image: product.images
      .map((img) => img.src)
      .filter((src): src is string => Boolean(src))
      .map((src) => absoluteUrl(src)),
    brand: { "@type": "Brand", name: SITE_NAME },
    // Ties the product back to the store entity declared in the root layout.
    manufacturer: { "@id": ORG_ID },
    url,
    ...(reviews.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviews.average.toFixed(1)),
            reviewCount: reviews.count,
            bestRating: 5,
            worstRating: 1,
          },
          // A handful of real reviews render as stars + snippets in the SERP.
          review: reviews.reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            datePublished: r.createdAt,
            name: r.title,
            reviewBody: r.body,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: "LKR",
      price: product.priceLKR,
      priceValidUntil: priceValidUntil(),
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/BackOrder",
      seller: { "@id": ORG_ID },
      hasMerchantReturnPolicy: merchantReturnPolicyNode,
      shippingDetails: shippingDetailsNode,
    },
  };

  const breadcrumbs = breadcrumbNode([
    { name: "Home", path: "/" },
    {
      name: product.category,
      path: collectionHrefForCategory(product.category),
    },
    { name: product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <div className="w-full overflow-x-clip bg-white">
      <JsonLd data={jsonLdGraph(productNode, breadcrumbs)} />

      {/* Back */}
      <div className="mx-auto max-w-[1400px] px-5 pt-3 sm:px-8">
        <BackButton fallbackHref={collectionHrefForCategory(product.category)} />
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
