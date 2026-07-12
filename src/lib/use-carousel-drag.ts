"use client";

import { useEffect, type RefObject } from "react";

/**
 * Axis-locked touch dragging for horizontal carousels.
 *
 * Mobile browsers pan a horizontal scroller freely in both directions at once,
 * so a sideways swipe also creeps vertically (and a vertical one drags the row
 * sideways) — the "cards wander diagonally" jank. The row therefore declares
 * `touch-action: pan-y` (vertical swipes scroll the PAGE natively, untouched)
 * and this hook re-implements the horizontal half, the same way carousel
 * libraries like Embla do: the first ~6px of movement lock the gesture's axis;
 * a horizontal drag then drives `scrollLeft` 1:1 with the finger and ends with
 * a momentum fling that settles on the nearest card edge. CSS scroll-snap is
 * suspended during the drag so it can't fight the finger mid-gesture.
 *
 * A click right after a real drag is suppressed so a swipe never activates the
 * card under the finger. Mouse/pen pointers are ignored — desktop behaviour
 * (trackpad scroll + arrow buttons) is unchanged.
 */
export function useCarouselDrag(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let axis: "x" | "y" | null = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0; // px/ms in finger direction (right = positive)
    let suppressClick = false;
    let restore: number | undefined;

    const setSnap = (on: boolean) => {
      // Inline style overrides the Tailwind snap classes; "" restores them.
      el.style.scrollSnapType = on ? "" : "none";
    };

    /** Scroll positions that snap-align each card (start or center), clamped. */
    const snapTargets = (): { targets: number[]; max: number } => {
      const rowRect = el.getBoundingClientRect();
      const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const max = el.scrollWidth - el.clientWidth;
      const targets = Array.from(el.children, (child) => {
        const r = child.getBoundingClientRect();
        const centered = getComputedStyle(child).scrollSnapAlign.includes(
          "center",
        );
        const left = centered
          ? el.scrollLeft +
            (r.left + r.width / 2) -
            (rowRect.left + el.clientWidth / 2)
          : el.scrollLeft + r.left - rowRect.left - padLeft;
        return Math.min(Math.max(left, 0), max);
      });
      return { targets, max };
    };

    /** Fling with momentum, then land on the nearest card edge. */
    const settle = () => {
      const { targets, max } = snapTargets();
      if (targets.length === 0) return setSnap(true);
      const projected = Math.min(
        Math.max(el.scrollLeft - velocity * 180, 0),
        max,
      );
      const best = targets.reduce((a, b) =>
        Math.abs(b - projected) < Math.abs(a - projected) ? b : a,
      );
      el.scrollTo({ left: best, behavior: "smooth" });
      window.clearTimeout(restore);
      restore = window.setTimeout(() => setSnap(true), 600);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      window.clearTimeout(restore);
      axis = null;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = e.timeStamp;
      velocity = 0;
      suppressClick = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || axis === "y") return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (axis === null) {
        // Lock the axis on the first real movement; vertical gestures are
        // left entirely to the browser (touch-action: pan-y).
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") return;
        setSnap(false);
        el.setPointerCapture?.(e.pointerId);
      }
      const delta = e.clientX - lastX;
      el.scrollLeft -= delta;
      const dt = e.timeStamp - lastT;
      if (dt > 0) velocity = 0.8 * velocity + 0.2 * (delta / dt);
      lastX = e.clientX;
      lastT = e.timeStamp;
      if (Math.abs(dx) > 8) suppressClick = true;
    };

    const onEnd = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (axis === "x") settle();
      axis = null;
    };

    // A swipe must never activate the link/button under the finger.
    const onClick = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    el.addEventListener("click", onClick, true);
    return () => {
      window.clearTimeout(restore);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}
