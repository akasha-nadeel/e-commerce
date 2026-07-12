"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useIntroPlayed } from "@/components/motion-gate";
import { formatLKR } from "@/lib/format";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Price that counts up from 0 to `value` (LKR-formatted) the first time it
 * scrolls into view.
 *
 * Correctness first: the JSX always renders the REAL price, so SSR ships the
 * correct value and any React re-render safely falls back to it — the price can
 * never get stuck at "LKR 0.00". Before the count starts we set the visible text
 * to 0 imperatively (pre-paint, so there's no flash); the count then writes the
 * text imperatively each frame (no per-frame re-render, no reflow — an invisible
 * sizer reserves the final width). Honours prefers-reduced-motion.
 */
export function CountUpPrice({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const played = useIntroPlayed();
  // Skip the count entirely for reduced motion, or once the scroll intro has
  // already played this session (see `MotionGate`) — the real value just stands.
  const skip = reduce || played;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const started = useRef(false);

  // Before the count begins, show 0 (imperatively, pre-paint). Once started (or
  // when skipping) this no-ops, so the real value from JSX stands.
  useIsoLayoutEffect(() => {
    if (skip || started.current) return;
    if (ref.current) ref.current.textContent = formatLKR(0);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || skip || !inView || started.current) return;
    started.current = true;
    const controls = animate(0, value, {
      duration: 1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formatLKR(Math.round(v));
      },
      onComplete: () => {
        el.textContent = formatLKR(value);
      },
    });
    return () => controls.stop();
  }, [inView, value, delay, skip]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Reserves the final width so the counting text never reflows. */}
      <span aria-hidden className="invisible">
        {formatLKR(value)}
      </span>
      <span ref={ref} className="absolute left-0 top-0">
        {formatLKR(value)}
      </span>
    </span>
  );
}
