"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useIntroPlayed } from "@/components/motion-gate";

/** apple.com-style reveal easing — a soft, non-bouncy ease-out. */
export const APPLE_EASE = [0.28, 0.11, 0.32, 1] as const;
/** Distance the element rises from as it fades in (px). */
const RISE = 30;

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait before animating (light stagger between siblings). */
  delay?: number;
  className?: string;
  // Kept for source-compatibility with existing call sites, but ignored: the
  // Apple reveal is a single uniform vertical fade-up — no horizontal or custom
  // travel, no per-call directional choreography.
  y?: number;
  x?: number;
  duration?: number;
};

/**
 * Scroll-triggered reveal, apple.com style: children fade in while rising a
 * short distance the first time they scroll into view, with one understated
 * easing used everywhere (no directional slides or heavy stagger). Renders
 * statically under prefers-reduced-motion, or once the scroll intro has already
 * played this session (see `MotionGate`).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  const played = useIntroPlayed();

  if (reduce || played) {
    return <div className={className}>{children}</div>;
  }

  // Compress any large legacy stagger values so nothing lags ~1s behind the
  // scroll; small intra-section staggers still read.
  const staggered = Math.min(delay, 0.22);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: RISE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.8, delay: staggered, ease: APPLE_EASE }}
    >
      {children}
    </motion.div>
  );
}
