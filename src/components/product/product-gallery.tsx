"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { ProductImage } from "@/lib/catalog";
import { MediaTile } from "@/components/media-tile";

/**
 * Editorial gallery (SPD / Gymshark style): a two-column image grid on desktop
 * showing every product shot, and a swipeable carousel on mobile. The image
 * matching the selected colour gets a highlight ring; clicking any image opens
 * a zoom lightbox with prev/next.
 */
export function ProductGallery({
  images,
  name,
  activeColor,
}: {
  images: ProductImage[];
  name: string;
  /** Show only this colour's photos (falls back to all if none are tagged). */
  activeColor?: string;
}) {
  const [zoom, setZoom] = useState<number | null>(null);

  // Only the selected colour's shots; if that colour has none tagged, show all.
  const forColor = activeColor
    ? images.filter((img) => img.color === activeColor)
    : [];
  const shown = forColor.length > 0 ? forColor : images;
  const count = shown.length;

  // Reset zoom when the shown set changes (colour switch) — no effect needed.
  const [prevColor, setPrevColor] = useState(activeColor);
  if (activeColor !== prevColor) {
    setPrevColor(activeColor);
    setZoom(null);
  }

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((z) => (z === null ? z : (z + 1) % count));
      if (e.key === "ArrowLeft")
        setZoom((z) => (z === null ? z : (z - 1 + count) % count));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom, count]);

  return (
    <div>
      {/* Mobile: swipeable carousel */}
      <div className="-mx-5 flex touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden">
        {shown.map((img, i) => (
          <button
            key={img.src ?? `img-${i}`}
            type="button"
            aria-label={`Zoom ${name} image ${i + 1}`}
            onClick={() => setZoom(i)}
            className="relative w-[86%] shrink-0 snap-center overflow-hidden"
          >
            <MediaTile src={img.src} label={img.label} alt={name} aspect="4/5" priority={i === 0} />
          </button>
        ))}
      </div>

      {/* Desktop: two-column grid */}
      <div className="hidden grid-cols-2 gap-3 lg:grid">
        {shown.map((img, i) => (
          <button
            key={img.src ?? `img-${i}`}
            type="button"
            aria-label={`Zoom ${name} image ${i + 1}`}
            onClick={() => setZoom(i)}
            className="group relative overflow-hidden outline-none"
          >
            <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
              <MediaTile src={img.src} label={img.label} alt={name} aspect="4/5" priority={i === 0} />
            </div>
            <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0c0c0d] opacity-0 shadow-md backdrop-blur transition-opacity duration-200 group-hover:opacity-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {/* Zoom lightbox — portalled to <body> so it escapes the sticky
          gallery's stacking context and covers the header. */}
      {zoom !== null &&
        shown[zoom]?.src &&
        createPortal(
          <div
            role="dialog"
            aria-label={`${name} enlarged`}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white p-4 sm:p-8"
          >
            {/* Counter */}
            {count > 1 && (
              <span className="absolute left-5 top-5 rounded-full border border-[#e2e1e4] px-5 py-2.5 text-[15px] font-medium text-[#0c0c0d]">
                {zoom + 1} / {count}
              </span>
            )}

            {/* Close */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setZoom(null)}
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#e2e1e4] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((z) => (z === null ? z : (z - 1 + count) % count));
                  }}
                  className="absolute left-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e1e4] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d]"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((z) => (z === null ? z : (z + 1) % count));
                  }}
                  className="absolute right-5 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e1e4] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d]"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </>
            )}

            <div
              className="relative h-[92vh] w-full max-w-[900px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={shown[zoom].src as string}
                alt={name}
                fill
                quality={100}
                className="object-contain"
                sizes="900px"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
