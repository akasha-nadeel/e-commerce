"use client";

import { useEffect } from "react";
import {
  SORT_OPTIONS,
  activeFilterCount,
  type Facets,
  type FilterState,
} from "@/lib/filters";
import { FilterControls } from "./filter-controls";

/**
 * Filter panel opened by the "Show filters" button: a right slide-over on
 * desktop, a rounded bottom-sheet on mobile. Holds Sort + the facet accordions
 * and a "View results (N)" action.
 */
export function FilterDrawer({
  open,
  onClose,
  facets,
  filters,
  onChange,
  onClear,
  resultCount,
  showCategory,
}: {
  open: boolean;
  onClose: () => void;
  facets: Facets;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
  resultCount: number;
  showCategory: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const count = activeFilterCount(filters);

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Filters"
        aria-hidden={!open}
        className={`fixed z-[90] flex flex-col bg-white transition-transform duration-300 ease-out
          inset-x-0 bottom-0 h-[86vh] rounded-t-[22px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]
          sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[420px] sm:rounded-none sm:shadow-[-20px_0_60px_rgba(0,0,0,0.22)]
          ${
            open
              ? "translate-y-0 sm:translate-x-0"
              : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          }`}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[#d7d6d9] sm:hidden" />

        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="m-0 text-[24px] font-semibold tracking-[0.01em]">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e7e6e9] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Sort by */}
          <div className="relative mb-2 bg-[#f5f5f6] px-4 py-2.5">
            <span className="pointer-events-none absolute left-4 top-2 text-[11px] text-[#8a8a8e]">
              Sort by
            </span>
            <select
              value={filters.sort}
              onChange={(e) =>
                onChange({ ...filters, sort: e.target.value as FilterState["sort"] })
              }
              aria-label="Sort products"
              className="w-full cursor-pointer appearance-none bg-transparent pt-4 text-[14px] font-medium text-[#0c0c0d] outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c0c0d" strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <FilterControls
            facets={facets}
            filters={filters}
            onChange={onChange}
            showCategory={showCategory}
          />
        </div>

        <div className="flex items-center gap-4 border-t border-[#e7e6e9] px-6 py-4">
          <button
            type="button"
            onClick={onClear}
            disabled={count === 0}
            className="shrink-0 cursor-pointer text-[13px] font-semibold text-[#8a8a8e] underline-offset-4 transition-colors hover:text-[#0c0c0d] hover:underline disabled:cursor-default disabled:opacity-40"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer bg-[#0c0c0d] py-4 text-[14px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
          >
            View results ({resultCount})
          </button>
        </div>
      </aside>
    </>
  );
}
