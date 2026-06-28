"use client";

import { useEffect } from "react";
import {
  COLOR_FAMILIES,
  PRICE_BUCKETS,
  SIZE_DISPLAY,
  activeFilterCount,
  type ColorFamily,
  type Facets,
  type FilterState,
  type PriceBucketKey,
} from "@/lib/filters";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

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
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Filters"
        aria-hidden={!open}
        className={`fixed left-0 top-0 z-[70] flex h-full w-full max-w-[400px] flex-col bg-white shadow-[20px_0_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
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
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#0c0c0d] transition-colors hover:text-[#c79a4b]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {showCategory && facets.categories.length > 1 && (
            <Section title="Category">
              <div className="flex flex-col gap-2.5">
                {facets.categories.map((c) => (
                  <Check
                    key={c}
                    label={c}
                    checked={filters.categories.includes(c)}
                    onChange={() =>
                      onChange({ ...filters, categories: toggle(filters.categories, c) })
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          {facets.sizes.length > 0 && (
            <Section title="Size">
              <div className="flex flex-wrap gap-2.5">
                {facets.sizes.map((s) => {
                  const on = filters.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, s) })}
                      className="min-w-[52px] px-3 py-3 text-[13px] font-bold transition-colors"
                      style={{
                        background: on ? "#0c0c0d" : "#fff",
                        color: on ? "#fff" : "#0c0c0d",
                        border: `1.5px solid ${on ? "#0c0c0d" : "#d7d6d9"}`,
                      }}
                    >
                      {SIZE_DISPLAY[s] ?? s}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {facets.colors.length > 0 && (
            <Section title="Colour">
              <div className="flex flex-col gap-2.5">
                {COLOR_FAMILIES.filter((c) => facets.colors.includes(c.key)).map((c) => {
                  const on = filters.colors.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        onChange({
                          ...filters,
                          colors: toggle<ColorFamily>(filters.colors, c.key),
                        })
                      }
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className="inline-block h-6 w-6 rounded-full border"
                        style={{
                          background: c.hex,
                          borderColor: on ? "#0c0c0d" : "rgba(0,0,0,0.18)",
                          boxShadow: on ? "0 0 0 2px #0c0c0d inset, 0 0 0 2px #fff" : "none",
                          outline: on ? "2px solid #0c0c0d" : "none",
                          outlineOffset: 1,
                        }}
                      />
                      <span
                        className="text-[14px]"
                        style={{ fontWeight: on ? 700 : 400 }}
                      >
                        {c.key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {facets.prices.length > 0 && (
            <Section title="Price">
              <div className="flex flex-col gap-2.5">
                {PRICE_BUCKETS.filter((b) => facets.prices.includes(b.key)).map((b) => (
                  <Check
                    key={b.key}
                    label={b.label}
                    checked={filters.prices.includes(b.key)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        prices: toggle<PriceBucketKey>(filters.prices, b.key),
                      })
                    }
                  />
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-[#e7e6e9] px-6 py-4">
          <button
            type="button"
            onClick={onClear}
            disabled={count === 0}
            className="flex-1 cursor-pointer rounded-full border border-[#d7d6d9] py-3.5 text-[13px] font-semibold text-[#0c0c0d] transition-colors hover:border-[#0c0c0d] disabled:cursor-default disabled:opacity-40"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-[1.4] cursor-pointer rounded-full bg-[#0c0c0d] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
          >
            Show {resultCount} {resultCount === 1 ? "Result" : "Results"}
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 border-b border-[#f0eff1] pb-8 last:mb-0 last:border-0 last:pb-0">
      <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.14em]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[14px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#0c0c0d]"
      />
      <span style={{ fontWeight: checked ? 700 : 400 }}>{label}</span>
    </label>
  );
}
