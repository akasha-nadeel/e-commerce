"use client";

import { useEffect } from "react";
import { activeFilterCount, type Facets, type FilterState } from "@/lib/filters";
import { FilterControls } from "./filter-controls";

/** Mobile-only slide-in filter panel. Desktop uses the persistent sidebar. */
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
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Filters"
        aria-hidden={!open}
        className={`fixed left-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-white shadow-[20px_0_60px_rgba(0,0,0,0.25)] transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e7e6e9] px-6 py-5">
          <h2 className="m-0 text-[18px] font-semibold tracking-[0.04em]">
            Filters{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#0c0c0d] transition-colors hover:text-[#eec449]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FilterControls
            facets={facets}
            filters={filters}
            onChange={onChange}
            showCategory={showCategory}
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[#e7e6e9] px-6 py-4">
          <button
            type="button"
            onClick={onClear}
            disabled={count === 0}
            className="flex-1 cursor-pointer rounded-none border border-[#d7d6d9] py-3.5 text-[13px] font-semibold text-[#0c0c0d] transition-colors hover:border-[#0c0c0d] disabled:cursor-default disabled:opacity-40"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[1.4] cursor-pointer rounded-none bg-[#0c0c0d] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
          >
            Show {resultCount} {resultCount === 1 ? "Result" : "Results"}
          </button>
        </div>
      </aside>
    </>
  );
}
