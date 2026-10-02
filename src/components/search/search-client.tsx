"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const SUGGESTIONS = ["Oversized", "Jersey", "Black", "Tee", "Cap", "Tank"];

export function SearchClient({
  products,
  initialQuery = "",
}: {
  products: Product[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    const terms = query.split(/\s+/);
    return products.filter((p) => {
      const haystack = [
        p.name,
        p.category,
        p.colorName,
        ...p.colors.map((c) => c.name),
        p.description,
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [products, query]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-12 sm:px-8">
      <h1 className="display-tight m-0 mb-6 text-[clamp(34px,5vw,64px)] font-semibold leading-[0.95]">
        Search
      </h1>

      <div className="relative max-w-[680px]">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for tees, jerseys, colours…"
          aria-label="Search products"
          className="w-full border-b-2 border-fg py-4 pl-12 pr-10 text-[18px] outline-none placeholder:text-faint-soft"
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center text-muted hover:text-fg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {!query ? (
        <div className="mt-8">
          <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-muted">
            Popular searches
          </div>
          <div className="flex flex-wrap gap-2.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQ(s)}
                className="cursor-pointer border border-line-strong px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.08em] transition-colors hover:border-fg"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="mb-7 mt-8 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
            {results.length} {results.length === 1 ? "result" : "results"} for “{q.trim()}”
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.slug} product={p} inGrid />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="m-0 text-[18px] font-bold">No results for “{q.trim()}”.</p>
          <p className="m-0 max-w-[360px] text-[14px] text-muted">
            Check the spelling or try a broader term.
          </p>
          <Link
            href="/collections/all"
            className="mt-2 rounded-none bg-fg px-8 py-3.5 text-[13px] font-semibold text-canvas no-underline transition-colors hover:bg-[#eec449] hover:text-ink"
          >
            Browse All
          </Link>
        </div>
      )}
    </div>
  );
}
