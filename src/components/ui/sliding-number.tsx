"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Animated counter — the value rolls vertically (odometer style) whenever it
 * changes. A lightweight take on Animate UI's SlidingNumber, sized for small
 * badge counts. Honours prefers-reduced-motion.
 */
export function SlidingNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      className={`relative inline-grid overflow-hidden leading-none ${
        className ?? ""
      }`}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="col-start-1 row-start-1"
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
