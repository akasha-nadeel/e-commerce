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
  const [playing, setPlaying] = useState(true);

  const go = useCallback(
    (i: number) =>
      setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

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
    <section className="relative -mt-[74px] flex min-h-screen items-end overflow-hidden bg-[#17120f] pt-[74px] lg:items-center">
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

      {/* Left scrim keeps the white copy legible over bright images */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
      />

      {/* Copy — re-mounts per slide (key) so it replays the staggered entrance */}
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-32 sm:px-8 lg:pb-0">
        <div key={index} className="max-w-[560px]">
          <h1 className="display-tight m-0 text-[clamp(40px,7vw,104px)] font-semibold leading-[0.95] text-white">
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
          <p
            className="animate-rise mb-8 mt-5 max-w-[440px] text-[clamp(15px,1.4vw,20px)] text-white/80"
            style={{ animationDelay: "0.32s" }}
          >
            {active.subtitle}
          </p>
          <div className="flex flex-wrap gap-3.5">
            {active.ctas.map((c, ci) => (
              <Link
                key={c.href + c.label}
                href={c.href}
                className={`animate-rise rounded-none px-9 py-4 text-[13px] font-semibold no-underline transition-colors ${
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

      {/* Dot indicators — bottom-left */}
      <div className="absolute bottom-7 left-5 z-20 flex items-center gap-2 sm:left-8">
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

      {/* Controls — bottom-right */}
      <div className="absolute bottom-6 right-5 z-20 flex items-center gap-2.5 sm:right-8">
        <CtrlButton
          label={playing ? "Pause slideshow" : "Play slideshow"}
          onClick={() => setPlaying((p) => !p)}
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
    </section>
  );
}

function CtrlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-[#0c0c0d] sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}
