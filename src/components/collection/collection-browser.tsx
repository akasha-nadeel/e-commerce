"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/catalog";
import {
  COLOR_FAMILIES,
  EMPTY_FILTERS,
  PRICE_BUCKETS,
  SIZE_DISPLAY,
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
      {/* Toolbar */}
      <div className="sticky top-[74px] z-30 -mx-5 mb-6 flex items-center justify-between gap-4 border-y border-[#e7e6e9] bg-white/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#0c0c0d]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="17" x2="14" y2="17" />
          </svg>
          Filter
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0c0c0d] px-1 text-[11px] font-semibold text-white">
              {count}
            </span>
          )}
        </button>

        <span className="hidden text-[13px] font-bold uppercase tracking-[0.12em] text-[#8a8a8e] sm:block">
          {results.length} {results.length === 1 ? "item" : "items"}
        </span>

        <label className="flex items-center gap-2">
          <span className="hidden text-[12px] font-bold uppercase tracking-[0.12em] text-[#8a8a8e] sm:inline">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => apply({ ...filters, sort: e.target.value as FilterState["sort"] })}
            className="cursor-pointer border border-[#d7d6d9] bg-white px-3 py-2 text-[13px] font-bold outline-none focus:border-[#0c0c0d]"
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

      {/* Active filter chips */}
      {count > 0 && (
        <div className="mb-7 flex flex-wrap items-center gap-2.5">
          {filters.categories.map((c) => (
            <Chip key={`cat-${c}`} label={c} onRemove={() => apply({ ...filters, categories: filters.categories.filter((x) => x !== c) })} />
          ))}
          {filters.sizes.map((s) => (
            <Chip key={`size-${s}`} label={`Size ${SIZE_DISPLAY[s] ?? s}`} onRemove={() => apply({ ...filters, sizes: filters.sizes.filter((x) => x !== s) })} />
          ))}
          {filters.colors.map((c) => (
            <Chip
              key={`color-${c}`}
              label={c}
              swatch={COLOR_FAMILIES.find((f) => f.key === c)?.hex}
              onRemove={() => apply({ ...filters, colors: filters.colors.filter((x) => x !== c) })}
            />
          ))}
          {filters.prices.map((p) => (
            <Chip
              key={`price-${p}`}
              label={PRICE_BUCKETS.find((b) => b.key === p)?.label ?? p}
              onRemove={() => apply({ ...filters, prices: filters.prices.filter((x) => x !== p) })}
            />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a8a8e] underline-offset-4 hover:text-[#0c0c0d] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Grid / empty state */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} quickAdd inGrid />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="m-0 text-[18px] font-bold">No products match those filters.</p>
          <p className="m-0 max-w-[360px] text-[14px] text-[#8a8a8e]">
            Try removing a filter or two to see more of the collection.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-2 cursor-pointer rounded-full bg-[#0c0c0d] px-8 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
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

function Chip({
  label,
  onRemove,
  swatch,
}: {
  label: string;
  onRemove: () => void;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="flex cursor-pointer items-center gap-2 border border-[#d7d6d9] py-2 pl-3 pr-2.5 text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:border-[#0c0c0d]"
    >
      {swatch && (
        <span className="h-3 w-3 rounded-full border border-black/20" style={{ background: swatch }} />
      )}
      {label}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>
  );
}
