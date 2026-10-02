"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/catalog";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  computeFacets,
  filterAndSort,
  filtersFromParams,
  filtersToParams,
  type FilterState,
} from "@/lib/filters";
import { ProductCard } from "@/components/product-card";
import { FilterDrawer } from "./filter-drawer";

export function CollectionBrowser({
  products,
  showCategory = false,
}: {
  products: Product[];
  /** Mixed collections (All / New) expose the Category facet; gendered ones don't. */
  showCategory?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const facets = useMemo(() => computeFacets(products), [products]);
  const results = useMemo(() => filterAndSort(products, filters), [products, filters]);
  const count = activeFilterCount(filters);

  const apply = useCallback(
    (next: FilterState) => {
      const qs = filtersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const clearAll = useCallback(
    () => apply({ ...EMPTY_FILTERS, sort: filters.sort }),
    [apply, filters.sort],
  );

  return (
    <div>
      {/* Toolbar: Show filters (left) · Sort by (right) */}
      <div className="mb-8 flex items-center justify-between gap-4 border-y border-line py-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex cursor-pointer items-center gap-2.5 border border-fg px-5 py-3 text-[13px] font-medium tracking-[0.02em] text-fg transition-colors hover:bg-fg hover:text-canvas"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="17" x2="14" y2="17" />
          </svg>
          Show filters{count > 0 ? ` (${count})` : ""}
        </button>

        <label className="flex items-center gap-3">
          <span className="hidden text-[13px] text-muted sm:inline">Sort by:</span>
          <select
            value={filters.sort}
            onChange={(e) => apply({ ...filters, sort: e.target.value as FilterState["sort"] })}
            className="cursor-pointer border border-line-strong bg-canvas px-4 py-3 text-[13px] font-medium outline-none focus:border-fg"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Grid / empty state */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-1 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p, i) => (
            <ProductCard
              key={p.slug}
              product={p}
              inGrid
              delay={(i % 4) * 0.1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="m-0 text-[18px] font-bold">No products match those filters.</p>
          <p className="m-0 max-w-[360px] text-[14px] text-muted">
            Try removing a filter or two to see more of the collection.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-2 cursor-pointer rounded-none bg-fg px-8 py-3.5 text-[13px] font-semibold text-canvas transition-colors hover:bg-[#eec449] hover:text-ink"
          >
            Clear Filters
          </button>
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        facets={facets}
        filters={filters}
        onChange={apply}
        onClear={clearAll}
        resultCount={results.length}
        showCategory={showCategory}
      />
    </div>
  );
}
