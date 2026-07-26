import { ProductForm } from "@/components/studio/product-form";
import { canWriteStock } from "@/lib/shopify/admin-products";
import { requireStudio } from "@/lib/studio/auth";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireStudio();
  // Checked server-side so the form can warn about the missing inventory scope
  // before quantities are typed, not after saving.
  const canSaveStock = await canWriteStock();

  return <ProductForm canSaveStock={canSaveStock} />;
}
