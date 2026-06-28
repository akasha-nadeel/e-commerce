import type { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { PRODUCTS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Golden Egal collection.",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <div className="w-full bg-white">
      <SearchClient products={PRODUCTS} />
    </div>
  );
}
