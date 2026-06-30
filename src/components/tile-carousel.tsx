"use client";

import { useRef, type ReactNode } from "react";
import { ArrowButton } from "./carousel-row";

/**
 * Section header that stacks on mobile — heading on its own line, then a row
 * with an optional left control (toggle / button) and prev/next arrows — above
 * a horizontal scroll-snap row of tiles. Used by Shop By Category and the
 * activity section so they read as a swipeable row on phones (and a full row of
 * tiles on desktop, where everything fits without scrolling).
 */
export function TileCarousel({
  title,
  eyebrow,
  control,
  children,
}: {
  title: string;
  eyebrow?: string;
  control?: ReactNode;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (el) {
      el.scrollBy({
        left: dir * Math.min(el.clientWidth * 0.85, 600),
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-2 pt-14 sm:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.24em] text-[#8a8a8e]">
              {eyebrow}
            </div>
          )}
          <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {control}
          <div className="flex shrink-0 gap-2.5">
            <ArrowButton dir="prev" onClick={() => scroll(-1)} />
            <ArrowButton dir="next" onClick={() => scroll(1)} />
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>
    </section>
  );
}
