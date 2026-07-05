"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds to wait before animating (use to stagger siblings). */
  delay?: number;
  /** Pixels to travel vertically from (positive = rise up, negative = drop in). */
  y?: number;
  /** Pixels to travel horizontally from (negative = slide in from the left). */
  x?: number;
  /** Animation length in seconds. */
  duration?: number;
  className?: string;
};

/**
 * Scroll-triggered reveal — fades + slides its children into view the first time
 * they enter the viewport, then leaves them put. Built on `motion` (the engine
 * Animate UI uses). Honours prefers-reduced-motion by rendering statically.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  x = 0,
  duration = 0.6,
  className,
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
