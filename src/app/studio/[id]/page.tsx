import { notFound } from "next/navigation";
import { ProductForm } from "@/components/studio/product-form";
import { canWriteStock, getStudioProduct } from "@/lib/shopify/admin-products";
import { requireStudio } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

/**
 * Edit one product. The URL carries the numeric Shopify id (a full
 * `gid://shopify/Product/123` doesn't survive a path segment), so it's
 * reassembled here.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStudio();

  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const [product, canSaveStock] = await Promise.all([
    getStudioProduct(`gid://shopify/Product/${id}`),
    canWriteStock(),
  ]);
  if (!product) notFound();

  return (
    <ProductForm
      canSaveStock={canSaveStock}
      initial={{
        id: product.id,
        handle: product.handle,
        name: product.name,
        typeLabel: product.typeLabel,
        audience: product.audience,
        priceLKR: product.priceLKR,
        compareAtLKR: product.compareAtLKR,
        colors: product.colors,
        sizes: product.sizes,
        stock: product.stock,
        backorder: product.backorder,
        visible: product.visible,
        description: product.description,
        badge: product.badge,
        fit: product.fit,
        fabrication: product.fabrication,
        photos: product.photos.map((p) => ({
          mediaId: p.mediaId,
          url: p.url,
          color: p.color,
        })),
      }}
    />
  );
}
