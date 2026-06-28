"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/**
 * Section header (italic title + optional "Shop All" + prev/next arrows) wrapping
 * a horizontal scroll-snap row of product cards. Arrows scroll by ~90% of width.
 */
export function CarouselRow({
  title,
  id,
  shopAllHref,
  children,
}: {
  title: string;
  id?: string;
  shopAllHref?: string;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (el) {
      el.scrollBy({
        left: dir * Math.min(el.clientWidth * 0.9, 720),
        behavior: "smooth",
      });
    }
  };

  return (
    <section id={id} className="mx-auto max-w-[1400px] px-5 sm:px-8">
      <div className="mb-7 flex items-center justify-between gap-4">
        <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        <div className="flex items-center gap-[18px]">
          {shopAllHref && (
            <Link
              href={shopAllHref}
              className="hidden border-b-2 border-[#0c0c0d] pb-[3px] text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0c0c0d] no-underline sm:inline-block"
            >
              Shop All
            </Link>
          )}
          <div className="flex gap-2.5">
            <ArrowButton dir="prev" onClick={() => scroll(-1)} />
            <ArrowButton dir="next" onClick={() => scroll(1)} />
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-[18px] overflow-x-auto pb-2"
      >
        {children}
      </div>
    </section>
  );
}

function ArrowButton({
  dir,
  onClick,
}: {
  dir: "prev" | "next";
  onClick: () => void;
}) {
  const next = dir === "next";
  return (
    <button
      type="button"
      aria-label={next ? "Next" : "Previous"}
      onClick={onClick}
      className={`flex h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-full border-[1.5px] transition-colors ${
        next
          ? "border-[#0c0c0d] bg-[#0c0c0d] hover:border-[#c79a4b] hover:bg-[#c79a4b]"
          : "border-[#d7d6d9] bg-white hover:border-[#0c0c0d]"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={next ? "#fff" : "#0c0c0d"}
        strokeWidth={2.4}
      >
        {next ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
      </svg>
    </button>
  );
}
