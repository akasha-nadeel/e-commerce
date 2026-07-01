"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatLKR } from "@/lib/format";

const QUICK_LINKS = [
  { label: "NEW IN", href: "/collections/new" },
  { label: "MEN", href: "/collections/men" },
  { label: "WOMEN", href: "/collections/women" },
  { label: "ACCESSORIES", href: "/collections/accessories" },
];

interface SearchItem {
  slug: string;
  name: string;
  category: string;
  colorName: string;
  colors: { name: string; image: string | null }[];
  priceLKR: number;
  compareAtLKR: number | null;
  image: string | null;
}

/**
 * Search overlay: desktop right slide-over, mobile bottom-sheet. The catalog is
 * fetched once (lazily, on first open) and searched client-side, so results are
 * instant on every keystroke — ranked by relevance (name-prefix > name > type >
 * colour), with data-driven suggestions and a "See all results" hand-off.
 */
export function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the catalog once, on first open.
  useEffect(() => {
    if (!open || items) return;
    let active = true;
    fetch("/api/search-products")
      .then((r) => r.json())
      .then((data: SearchItem[]) => active && setItems(data))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query || !items) return [];
    const terms = query.split(/\s+/);
    return items
      .map((p) => {
        const name = p.name.toLowerCase();
        const colorNames = p.colors.map((c) => c.name.toLowerCase());
        const hay = `${name} ${p.category} ${p.colorName} ${colorNames.join(" ")}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return null;
        let score = name.startsWith(query) ? 100 : name.includes(query) ? 60 : 0;
        if (p.category.toLowerCase().includes(query)) score += 25;
        if (colorNames.some((c) => c.includes(query))) score += 15;
        return { p, score };
      })
      .filter((x): x is { p: SearchItem; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((r) => r.p);
  }, [query, items]);

  const suggestions = useMemo(() => {
    if (!query || !items) return [];
    const set = new Set<string>();
    for (const p of items) {
      for (const c of [
        p.category,
        p.colorName,
        ...p.colors.map((x) => x.name),
        ...p.name.split(/\s+/),
      ]) {
        const cl = c.toLowerCase();
        if (cl.length > 1 && cl.includes(query) && cl !== query) set.add(cl);
      }
    }
    return [...set].slice(0, 5);
  }, [query, items]);

  function goToSearch() {
    const term = q.trim();
    onClose();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

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
        aria-label="Search"
        aria-hidden={!open}
        className={`fixed z-[90] flex flex-col bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out
          inset-x-0 bottom-0 h-[86vh] rounded-t-[22px]
          sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[440px] sm:rounded-none sm:shadow-[-20px_0_60px_rgba(0,0,0,0.22)]
          ${
            open
              ? "translate-y-0 sm:translate-x-0"
              : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          }`}
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-[#d7d6d9] sm:hidden" />

        <div className="flex items-center justify-between px-6 py-5 sm:border-b sm:border-[#e7e6e9]">
          <h2 className="m-0 text-[22px] font-semibold tracking-[0.01em]">Search</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e7e6e9] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Input */}
        <div className="px-6 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToSearch();
            }}
          >
            <div className="flex items-center gap-3 bg-[#f5f5f6] px-4 focus-within:bg-[#efeff0]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8a8e" strokeWidth={2} className="shrink-0">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for ..."
                aria-label="Search for products"
                className="flex-1 bg-transparent py-4 text-[15px] text-[#0c0c0d] outline-none placeholder:text-[#8a8a8e]"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 cursor-pointer text-[13px] font-semibold text-[#6a6a6e] transition-colors hover:text-[#0c0c0d]"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          {!query ? (
            <nav className="flex flex-col">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={onClose}
                  className="border-b border-[#f0eff1] py-4 text-[16px] font-medium tracking-[0.03em] text-[#0c0c0d] no-underline transition-colors hover:text-[#eec449]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          ) : (
            <>
              {suggestions.length > 0 && (
                <section className="mb-7">
                  <SectionTitle>Suggestions</SectionTitle>
                  <div className="flex flex-col gap-3">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQ(s)}
                        className="cursor-pointer text-left text-[17px] capitalize text-[#0c0c0d]"
                      >
                        <Highlight text={s} query={query} />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <SectionTitle>Products</SectionTitle>
                {items === null ? (
                  <p className="py-4 text-[14px] text-[#8a8a8e]">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="py-4 text-[14px] text-[#8a8a8e]">
                    No products match “{q.trim()}”.
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {results.map((p) => {
                      const onSale =
                        p.compareAtLKR != null && p.compareAtLKR > p.priceLKR;
                      // If the query names a colour, show that colour's photo.
                      const colorMatch = p.colors.find(
                        (c) => c.image && c.name.toLowerCase().includes(query),
                      );
                      const img = colorMatch?.image ?? p.image;
                      return (
                        <Link
                          key={p.slug}
                          href={`/products/${p.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 border-b border-[#f0eff1] py-3 no-underline"
                        >
                          <div className="relative h-[76px] w-[58px] shrink-0 overflow-hidden bg-[#eeedef]">
                            {img && (
                              <Image
                                src={img}
                                alt={p.name}
                                fill
                                quality={100}
                                sizes="58px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] font-semibold uppercase tracking-[0.01em] text-[#0c0c0d]">
                              {p.name}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[13px]">
                              {onSale && (
                                <span className="text-[#9a9a9e] line-through">
                                  {formatLKR(p.compareAtLKR!)}
                                </span>
                              )}
                              <span className="font-medium text-[#0c0c0d]">
                                {formatLKR(p.priceLKR)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* See all results */}
        {query && (
          <button
            type="button"
            onClick={goToSearch}
            className="flex shrink-0 items-center justify-center gap-2 bg-[#0c0c0d] py-[18px] text-[14px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
          >
            See all results
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="4" y1="12" x2="20" y2="12" />
              <path d="M14 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </aside>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 border-b border-[#f0eff1] pb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8e]">
      {children}
    </h3>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-[#b3b3b8]">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}
