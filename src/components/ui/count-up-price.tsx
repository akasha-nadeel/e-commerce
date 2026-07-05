"use client";

import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef } from "react";
import { formatLKR } from "@/lib/format";

/**
 * Price that counts up from 0 to `value` (LKR-formatted) the first time it
 * scrolls into view.
 *
 * Performance: the count is driven by a MotionValue that writes the text
 * imperatively (no React re-render), skips frames whose rounded value is
 * unchanged, and an invisible sizer reserves the final width so the changing
 * text never reflows the layout — otherwise the counter janks the scroll.
 * Detects its own visibility; honours prefers-reduced-motion.
 */
export function CountUpPrice({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const count = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !inView) return;
    let last = -1;
    const unsub = count.on("change", (v) => {
      const r = Math.round(v);
      if (r === last) return;
      last = r;
      el.textContent = formatLKR(r);
    });
    const controls = animate(count, value, {
      duration: 1,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      unsub();
      controls.stop();
    };
  }, [inView, value, delay, reduce, count]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Reserves the final width so the counting text never reflows. */}
      <span aria-hidden className="invisible">
        {formatLKR(value)}
      </span>
      <span ref={ref} className="absolute left-0 top-0">
        {formatLKR(reduce ? value : 0)}
      </span>
    </span>
  );
}
