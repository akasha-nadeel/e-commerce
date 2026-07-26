import Link from "next/link";
import { ProductList } from "@/components/studio/product-list";
import { Notice, PageHeading } from "@/components/studio/ui";
import { listStudioProducts } from "@/lib/shopify/admin-products";
import { requireStudio } from "@/lib/studio/auth";

/**
 * Studio home — every product in the store, with search, status filters and the
 * numbers worth acting on. Data is fetched here; filtering happens client-side
 * in `ProductList`.
 */

// Always live: this is an admin view of Shopify, never a cached snapshot.
export const dynamic = "force-dynamic";

export default async function StudioPage() {
  await requireStudio();

  let products;
  try {
    products = await listStudioProducts();
  } catch (e) {
    return (
      <div className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8">
        <PageHeading
          title="Can't reach Shopify"
          subtitle="The Studio is fine — the connection to your store isn't."
        />
        <Notice tone="danger" title="Error from Shopify">
          {e instanceof Error ? e.message : "Unknown error."}
        </Notice>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      <PageHeading
        title="Products"
        subtitle="Edits show on the website within about a minute."
        action={
          <Link
            href="/studio/new"
            className="rounded-none bg-[#0c0c0d] px-7 py-3.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
          >
            Add product
          </Link>
        }
      />

      <ProductList products={products} />
    </div>
  );
}
