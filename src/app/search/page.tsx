import type { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Golden Egal collection.",
  robots: { index: false },
};

export default async function SearchPage() {
  const products = await getAllProducts();
  return (
    <div className="w-full bg-white">
      <SearchClient products={products} />
    </div>
  );
}
