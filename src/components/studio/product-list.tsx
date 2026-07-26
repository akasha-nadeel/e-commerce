"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatLKR } from "@/lib/format";
import type { StudioListItem } from "@/lib/studio/types";
import { Chip, ChevronIcon, SearchIcon, StatusPill } from "./ui";

/**
 * The product list.
 *
 * Three things a store owner actually does here, in priority order: find a
 * product, see what state it's in, and spot what needs attention. So: a search
 * box, status filters, and a summary strip that surfaces drafts and sold-out
 * lines rather than making him scan every row.
 *
 * Filtering is client-side over the full list. At this catalogue's size that is
 * instant and avoids a server round-trip per keystroke; if the store ever runs
 * to thousands of products this becomes a Shopify `query:` instead.
 */

type StatusFilter = "all" | "live" | "draft" | "hidden";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "hidden", label: "Hidden" },
];

function statusOf(item: StudioListItem): StatusFilter {
  if (item.status === "ACTIVE") return "live";
  if (item.status === "DRAFT") return "draft";
  return "hidden";
}

/** `gid://shopify/Product/123` → `123`, for a clean edit URL. */
function numericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

export function ProductList({ products }: { products: StudioListItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const counts = useMemo(
    () => ({
      all: products.length,
      live: products.filter((p) => statusOf(p) === "live").length,
      draft: products.filter((p) => statusOf(p) === "draft").length,
      hidden: products.filter((p) => statusOf(p) === "hidden").length,
      empty: products.filter((p) => p.totalInventory <= 0).length,
    }),
    [products],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== "all" && statusOf(p) !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q)
      );
    });
  }, [products, query, filter]);

  return (
    <>
      {/* Summary — the two numbers worth acting on sit next to the total. */}
      <div className="mb-7 grid grid-cols-2 gap-px border border-[#e7e6e9] bg-[#e7e6e9] sm:grid-cols-4">
        <Stat label="Products" value={counts.all} />
        <Stat label="Live" value={counts.live} />
        <Stat label="Drafts" value={counts.draft} muted={counts.draft === 0} />
        <Stat
          label="Out of stock"
          value={counts.empty}
          tone={counts.empty > 0 ? "warn" : undefined}
          muted={counts.empty === 0}
        />
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-[300px] sm:flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8e]">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full rounded-xl border border-transparent bg-[#f7f7f8] py-3 pl-11 pr-4 text-[15px] outline-none transition-colors placeholder:text-[#a3a3a8] focus:border-[#0c0c0d] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              on={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value !== "all" && counts[f.value] > 0 && (
                <span className="ml-1.5 opacity-60">{counts[f.value]}</span>
              )}
            </Chip>
          ))}
        </div>
      </div>

      {/* Rows */}
      {shown.length === 0 ? (
        <EmptyState searching={Boolean(query.trim()) || filter !== "all"} />
      ) : (
        <ul className="divide-y divide-[#e7e6e9] border-y border-[#e7e6e9]">
          {shown.map((p) => (
            <li key={p.id}>
              <Link
                href={`/studio/${numericId(p.id)}`}
                className="group flex items-center gap-4 py-3.5 no-underline transition-colors hover:bg-[#fafafa]"
              >
                <div className="relative h-[68px] w-[54px] shrink-0 overflow-hidden rounded-[6px] bg-[#f5f5f6]">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      quality={100}
                      sizes="54px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold text-[#0c0c0d] transition-colors group-hover:text-[#eec449]">
                      {p.title}
                    </p>
                    {p.status !== "ACTIVE" && <StatusPill status={p.status} />}
                  </div>
                  <p className="mt-1 text-[13px] capitalize text-[#8a8a8e]">
                    {p.productType || "—"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-semibold tabular-nums">
                    {formatLKR(p.priceLKR)}
                  </p>
                  <p
                    className={`mt-1 text-[13px] tabular-nums ${
                      p.totalInventory <= 0 ? "text-[#9a7322]" : "text-[#8a8a8e]"
                    }`}
                  >
                    {p.totalInventory <= 0
                      ? "Out of stock"
                      : `${p.totalInventory} in stock`}
                  </p>
                </div>

                <span
                  className="hidden shrink-0 text-[#d7d6d9] transition-colors group-hover:text-[#0c0c0d] sm:block"
                  aria-hidden
                >
                  <ChevronIcon />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {shown.length > 0 && shown.length !== products.length && (
        <p className="mt-4 text-[13px] text-[#8a8a8e]">
          Showing {shown.length} of {products.length}.
        </p>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: number;
  tone?: "warn";
  muted?: boolean;
}) {
  return (
    <div className="bg-white px-4 py-3.5">
      <p
        className={`m-0 text-[24px] font-semibold tabular-nums leading-none ${
          tone === "warn" ? "text-[#9a7322]" : muted ? "text-[#c9c9cc]" : "text-[#0c0c0d]"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#8a8a8e]">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="border border-dashed border-[#d7d6d9] px-6 py-16 text-center">
      <p className="text-[16px] font-semibold">
        {searching ? "Nothing matches" : "No products yet"}
      </p>
      <p className="mx-auto mt-2 max-w-[340px] text-[14px] leading-relaxed text-[#8a8a8e]">
        {searching
          ? "Try a different word, or clear the filters to see everything."
          : "Add your first product and it'll appear on the website straight away."}
      </p>
      {!searching && (
        <Link
          href="/studio/new"
          className="mt-6 inline-block rounded-none bg-[#0c0c0d] px-7 py-3.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
        >
          Add a product
        </Link>
      )}
    </div>
  );
}
