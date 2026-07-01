"use client";

import { useState } from "react";
import {
  COLOR_FAMILIES,
  PRICE_BUCKETS,
  SIZE_DISPLAY,
  type ColorFamily,
  type Facets,
  type FilterState,
  type PriceBucketKey,
} from "@/lib/filters";

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * The facet controls (Category / Size / Colour / Price) as collapsible
 * accordions. Shared by the desktop sidebar (CollectionBrowser) and the mobile
 * FilterDrawer so both stay identical.
 */
export function FilterControls({
  facets,
  filters,
  onChange,
  showCategory,
}: {
  facets: Facets;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  showCategory: boolean;
}) {
  return (
    <div>
      {showCategory && facets.categories.length > 1 && (
        <Accordion title="Category">
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
        </Accordion>
      )}

      {facets.sizes.length > 0 && (
        <Accordion title="Size">
          <div className="flex flex-wrap gap-2.5">
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...filters, sizes: toggle(filters.sizes, s) })}
                  className="min-w-[46px] cursor-pointer px-3 py-2.5 text-[13px] font-bold transition-colors"
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
        </Accordion>
      )}

      {facets.colors.length > 0 && (
        <Accordion title="Colour">
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
                  className="flex cursor-pointer items-center gap-3 text-left"
                >
                  <span
                    className="inline-block h-6 w-6 rounded-full border"
                    style={{
                      background: c.hex,
                      borderColor: on ? "#0c0c0d" : "rgba(0,0,0,0.18)",
                      outline: on ? "2px solid #0c0c0d" : "none",
                      outlineOffset: 1,
                    }}
                  />
                  <span className="text-[14px]" style={{ fontWeight: on ? 700 : 400 }}>
                    {c.key}
                  </span>
                </button>
              );
            })}
          </div>
        </Accordion>
      )}

      {facets.prices.length > 0 && (
        <Accordion title="Price">
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
        </Accordion>
      )}
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#e7e6e9]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0c0c0d]">
          {title}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0c0c0d"
          strokeWidth={2}
          className="shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="pb-5">{children}</div>}
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
