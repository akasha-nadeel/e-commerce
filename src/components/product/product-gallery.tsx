"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/catalog";
import { MediaTile } from "@/components/media-tile";

/**
 * VELORA-style gallery: a vertical thumbnail rail beside a large main image,
 * with a scroll-down control and a zoom lightbox. On mobile the thumbnails
 * drop into a horizontal row beneath the main image.
 */
export function ProductGallery({
  images,
  name,
  activeColorImage,
  onImageChange,
}: {
  images: ProductImage[];
  name: string;
  /** When set, the gallery jumps to this colour's image on selection. */
  activeColorImage?: string;
  /** Called with the image src when the shopper picks an image directly. */
  onImageChange?: (src: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  // Switch the main image when the selected colour has its own photo. Adjusting
  // state during render (React's reset-on-prop-change pattern) avoids an effect
  // and the cascading-render it would cause.
  const [prevColorImage, setPrevColorImage] = useState(activeColorImage);
  if (activeColorImage !== prevColorImage) {
    setPrevColorImage(activeColorImage);
    if (activeColorImage) {
      const idx = images.findIndex((img) => img.src === activeColorImage);
      if (idx >= 0) setActive(idx);
    }
  }

  const current = images[active] ?? images[0];

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Thumbnail rail */}
      <div className="order-2 flex flex-row gap-3 lg:order-1 lg:w-[84px] lg:flex-col">
        {images.map((img, i) => (
          <button
            key={img.src ?? `img-${i}`}
            type="button"
            aria-label={`View image ${i + 1}`}
            aria-pressed={i === active}
            onClick={() => {
              setActive(i);
              if (img.src) onImageChange?.(img.src);
            }}
            className="w-[72px] shrink-0 overflow-hidden rounded-none border-2 transition-colors lg:w-full"
            style={{ borderColor: i === active ? "#0c0c0d" : "#e7e6e9" }}
          >
            <MediaTile src={img.src} alt={`${name} thumbnail ${i + 1}`} aspect="3/4" />
          </button>
        ))}

        {/* Scroll-down / next control (matches the reference's circular arrow) */}
        <button
          type="button"
          aria-label="Next image"
          onClick={() => {
            const next = (active + 1) % images.length;
            setActive(next);
            const src = images[next]?.src;
            if (src) onImageChange?.(src);
          }}
          className="mx-auto hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#d7d6d9] text-[#0c0c0d] transition-colors hover:border-[#0c0c0d] lg:flex"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14" />
            <path d="M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>

      {/* Main image */}
      <div className="relative order-1 flex-1 lg:order-2">
        <MediaTile
          src={current?.src}
          label={current?.label}
          alt={name}
          aspect="4/5"
          className="rounded-none"
          priority
        />
        <button
          type="button"
          aria-label="Zoom image"
          onClick={() => setZoom(true)}
          className="absolute bottom-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#0c0c0d] shadow-md backdrop-blur transition-colors hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>

      {/* Zoom lightbox */}
      {zoom && current?.src && (
        <div
          role="dialog"
          aria-label={`${name} enlarged`}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setZoom(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <div className="relative h-[86vh] w-full max-w-[760px]">
            <Image src={current.src} alt={name} fill className="object-contain" sizes="760px" />
          </div>
        </div>
      )}
    </div>
  );
}
