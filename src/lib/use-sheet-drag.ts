"use client";

import { useRef, useState } from "react";

/**
 * Swipe-down-to-close for mobile bottom sheets — works anywhere on the sheet.
 * Spread `handlers` on the whole sheet and attach `scrollRef` to its scrollable
 * content. A downward drag closes the sheet only when that content is scrolled
 * to the top (so normal scrolling still works elsewhere); past `threshold` it
 * closes, otherwise it snaps back.
 */
export function useSheetDrag(onClose: () => void, threshold = 90) {
  const [dragY, setDragY] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);
  const dragging = useRef(false);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      startY.current = e.touches[0].clientY;
      currentY.current = 0;
      dragging.current = false;
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      const atTop = !scrollRef.current || scrollRef.current.scrollTop <= 0;
      // Start/continue a drag only while pulling down from the top of content.
      if (dy > 0 && (dragging.current || atTop)) {
        dragging.current = true;
        currentY.current = dy;
        setDragY(dy);
      } else if (dragging.current) {
        // Dragged back up past the start — reset.
        currentY.current = 0;
        setDragY(0);
      }
    },
    onTouchEnd: () => {
      if (currentY.current > threshold) onClose();
      startY.current = null;
      currentY.current = 0;
      dragging.current = false;
      setDragY(0);
    },
  };

  const style: React.CSSProperties =
    dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: "none" } : {};

  return { dragY, style, handlers, scrollRef };
}
