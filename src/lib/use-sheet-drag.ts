"use client";

import { useRef, useState } from "react";

/**
 * Swipe-down-to-close for mobile bottom sheets. Attach `handlers` to the sheet's
 * top region (grip + header) and apply `dragY` as a translateY on the sheet so
 * it follows the finger; past `threshold` px it closes, otherwise it snaps back.
 */
export function useSheetDrag(onClose: () => void, threshold = 90) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      startY.current = e.touches[0].clientY;
      currentY.current = 0;
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      currentY.current = dy > 0 ? dy : 0;
      setDragY(currentY.current);
    },
    onTouchEnd: () => {
      if (currentY.current > threshold) onClose();
      startY.current = null;
      currentY.current = 0;
      setDragY(0);
    },
  };

  // Inline style for the sheet root: follow the finger with no transition while
  // dragging, then let the class-based transition snap it back on release.
  const style: React.CSSProperties =
    dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: "none" } : {};

  return { dragY, style, handlers };
}
