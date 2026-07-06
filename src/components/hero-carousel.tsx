"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";

export type HeroCta = {
  label: string;
  href: string;
  variant?: "solid" | "outline";
};

export type HeroSlide = {
  image: string;
  imageClassName?: string;
  titleLines: string[];
  subtitle: string;
  ctas: HeroCta[];
};

const AUTOPLAY_MS = 6000;

/**
 * Nike-style full-screen hero slideshow: auto-rotating image slides with a
 * crossfade, per-slide copy that does a staggered entrance on each change, dot
 * indicators (bottom-left), and pause/prev/next controls (bottom-right). Fully
 * responsive and honours prefers-reduced-motion (no autoplay, no entrance).
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Paused by default — the slideshow only rotates once the user hits play.
  const [playing, setPlaying] = useState(false);

  const go = useCallback(
    (i: number) =>
      setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  // Toggle play/pause. When starting, advance one slide immediately so the
  // click gives instant feedback instead of waiting a full interval.
  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p) setIndex((i) => (i + 1) % slides.length);
      return !p;
    });
  }, [slides.length]);

  useEffect(() => {
    if (reduce || !playing || slides.length < 2) return;
    const id = setInterval(
      () => setIndex((p) => (p + 1) % slides.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [reduce, playing, slides.length]);

  const active = slides[index];

  return (
    <section className="relative -mt-[74px] flex min-h-screen items-end overflow-hidden bg-[#17120f] pt-[74px]">
      {/* Image layers — crossfade between slides */}
      {slides.map((s, i) => (
        <div
          key={s.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            quality={100}
            /* A landscape image cropped into the tall mobile hero is scaled up,
               so request a larger candidate there to stay sharp. */
            sizes="(max-width: 1024px) 200vw, 100vw"
            className={s.imageClassName ?? "object-cover object-center"}
          />
        </div>
      ))}

      {/* Bottom scrim keeps the white copy legible where it sits (bottom band) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
      />

      {/* Copy — title bottom-left; controls + subtitle + CTAs bottom-right. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-5 pb-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pb-14">
        <h1
          key={index}
          className="display-tight m-0 max-w-[720px] text-[clamp(38px,7.2vw,108px)] font-semibold leading-[0.95] text-white"
        >
          {active.titleLines.map((line, li) => (
            <span
              key={li}
              className="block animate-rise"
              style={{ animationDelay: `${0.1 + li * 0.08}s` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <div className="flex shrink-0 flex-col gap-5 lg:max-w-[440px] lg:items-end">
          {/* Playback controls — tablet & desktop only, above the subtitle.
              (Mobile uses the single play button pinned bottom-right below.) */}
          <div className="hidden items-center gap-2.5 sm:flex">
            <CtrlButton
              white
              label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={togglePlay}
            >
              {playing ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 5l12 7-12 7z" />
                </svg>
              )}
            </CtrlButton>
            <CtrlButton label="Previous slide" onClick={() => go(index - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </CtrlButton>
            <CtrlButton label="Next slide" onClick={() => go(index + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </CtrlButton>
          </div>

          {/* Subtitle + CTAs — re-mount per slide so they replay the entrance */}
          <div
            key={index}
            className="flex flex-col gap-5 lg:items-end lg:text-right"
          >
            <p
              className="animate-rise max-w-[440px] text-[clamp(15px,1.4vw,19px)] text-white/85"
              style={{ animationDelay: "0.3s" }}
            >
              {active.subtitle}
            </p>
            <div className="flex flex-wrap gap-3.5 lg:justify-end">
              {active.ctas.map((c, ci) => (
                <Link
                  key={c.href + c.label}
                  href={c.href}
                  className={`animate-rise rounded-none px-6 py-3 text-[12px] font-semibold no-underline transition-colors sm:px-9 sm:py-4 sm:text-[13px] ${
                    c.variant === "outline"
                      ? "border border-white bg-transparent text-white hover:bg-white hover:text-[#0c0c0d]"
                      : "bg-[#eec449] text-[#0c0c0d] hover:bg-[#b3863a]"
                  }`}
                  style={{ animationDelay: `${0.44 + ci * 0.1}s` }}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators — bottom-center */}
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Play / pause — bottom-right, mobile only (tablet+ show the full
          controls above the subtitle). */}
      <div className="absolute bottom-6 right-5 z-20 sm:hidden">
        <CtrlButton
          white
          label={playing ? "Pause slideshow" : "Play slideshow"}
          onClick={togglePlay}
        >
          {playing ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 5l12 7-12 7z" />
            </svg>
          )}
        </CtrlButton>
      </div>
    </section>
  );
}

function CtrlButton({
  label,
  onClick,
  white = false,
  children,
}: {
  label: string;
  onClick: () => void;
  /** Solid white background with a dark icon (used for the play/pause button). */
  white?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-colors sm:h-11 sm:w-11 ${
        white
          ? "border-white bg-white text-[#0c0c0d] hover:bg-white/85"
          : "border-white/60 bg-black/20 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-[#0c0c0d]"
      }`}
    >
      {children}
    </button>
  );
}
