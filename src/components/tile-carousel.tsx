"use client";

import { useRef, type ReactNode } from "react";
import { ArrowButton } from "./carousel-row";
import { ViewAll } from "./ui/button";
import { Reveal } from "./ui/reveal";
import { glideBy, useCarouselDrag } from "@/lib/use-carousel-drag";

/**
 * Section header (optional eyebrow + title, prev/next arrows) above a
 * horizontal scroll-snap row of tiles, with an optional bottom-centred
 * "View All", the same layout as `CarouselRow`. Used by Shop By Category, so it
 * reads as a swipeable row on phones and a full row of tiles on desktop.
 */
export function TileCarousel({
  id,
  title,
  eyebrow,
  shopAllHref,
  children,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  shopAllHref?: string;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  useCarouselDrag(rowRef);

  // Arrows ride the same ease-out glide as touch flings (see glideBy) so the
  // tiles move with one consistent, soft animation everywhere.
  const scroll = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (el) glideBy(el, dir * Math.min(el.clientWidth * 0.85, 600));
  };

  return (
    <section
      id={id}
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 pb-2 pt-14 sm:px-8"
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <Reveal x={-30} y={0} duration={0.9}>
          {eyebrow && (
            <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.24em] text-muted">
              {eyebrow}
            </div>
          )}
          <h2 className="m-0 text-[clamp(26px,4vw,46px)] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
        </Reveal>
        <Reveal
          x={-30}
          y={0}
          duration={0.9}
          delay={0.15}
          className="flex shrink-0 gap-2.5"
        >
          <ArrowButton dir="prev" onClick={() => scroll(-1)} />
          <ArrowButton dir="next" onClick={() => scroll(1)} />
        </Reveal>
      </div>

      {/* Negative horizontal margins cancel the section's side padding so the
          row bleeds to both viewport edges (cards run off-screen on both sides
          like a long carousel); the matching horizontal padding keeps the first
          card aligned with the header and leaves end-spacing after the last.
          touch-pan-y hands vertical swipes to the browser (native page scroll);
          useCarouselDrag drives horizontal finger drags with an axis lock so
          the row never wanders diagonally. */}
      <div
        ref={rowRef}
        className="no-scrollbar -mx-5 flex touch-pan-y snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain px-5 pb-2 sm:-mx-8 sm:px-8"
      >
        {children}
      </div>

      {shopAllHref && <ViewAll href={shopAllHref} />}
    </section>
  );
}
