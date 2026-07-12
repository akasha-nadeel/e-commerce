"use client";

import { useEffect, type RefObject } from "react";

/* ------------------------------ glide engine ------------------------------ */

/** In-flight glide (rAF id) per row, so a new glide or a touch can cancel it. */
const glides = new WeakMap<HTMLElement, number>();

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ease-out quart — brisk start, long soft landing. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

function stopGlide(el: HTMLElement) {
  const raf = glides.get(el);
  if (raf !== undefined) cancelAnimationFrame(raf);
  glides.delete(el);
}

/** Scroll positions that snap-align each card (start or center), clamped. */
function snapTargetsOf(el: HTMLElement): { targets: number[]; max: number } {
  const rowRect = el.getBoundingClientRect();
  const padLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  const max = el.scrollWidth - el.clientWidth;
  const targets = Array.from(el.children, (child) => {
    const r = child.getBoundingClientRect();
    const centered = getComputedStyle(child).scrollSnapAlign.includes("center");
    const left = centered
      ? el.scrollLeft + (r.left + r.width / 2) - (rowRect.left + el.clientWidth / 2)
      : el.scrollLeft + r.left - rowRect.left - padLeft;
    return Math.min(Math.max(left, 0), max);
  });
  return { targets, max };
}

/**
 * Animated horizontal scroll with a soft ease-out glide. rAF-driven because
 * native `behavior: "smooth"` is abrupt and wildly inconsistent on mobile.
 * CSS snap is suspended for the ride and restored on landing (the targets we
 * glide to are snap positions anyway, so restoring never jumps).
 */
export function glideTo(el: HTMLElement, left: number) {
  stopGlide(el);
  const max = el.scrollWidth - el.clientWidth;
  const target = Math.min(Math.max(left, 0), max);
  const from = el.scrollLeft;
  const dist = target - from;
  if (Math.abs(dist) < 1 || reduceMotion()) {
    el.scrollLeft = target;
    el.style.scrollSnapType = "";
    return;
  }
  const duration = Math.min(820, 380 + Math.abs(dist) * 0.4);
  el.style.scrollSnapType = "none";
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    el.scrollLeft = from + dist * easeOut(t);
    if (t < 1) {
      glides.set(el, requestAnimationFrame(step));
    } else {
      glides.delete(el);
      el.style.scrollSnapType = "";
    }
  };
  glides.set(el, requestAnimationFrame(step));
}

/**
 * Page the row by ~`delta`px (arrow buttons), landing exactly on a card edge.
 * If rounding to the nearest card would leave us where we are, advance one
 * card in the requested direction instead.
 */
export function glideBy(el: HTMLElement, delta: number) {
  const { targets, max } = snapTargetsOf(el);
  const raw = Math.min(Math.max(el.scrollLeft + delta, 0), max);
  if (targets.length === 0) return glideTo(el, raw);
  let best = targets.reduce((a, b) =>
    Math.abs(b - raw) < Math.abs(a - raw) ? b : a,
  );
  if (Math.abs(best - el.scrollLeft) < 2) {
    const dir = Math.sign(delta);
    const onward = targets.filter((t) =>
      dir > 0 ? t > el.scrollLeft + 2 : t < el.scrollLeft - 2,
    );
    if (onward.length) best = dir > 0 ? Math.min(...onward) : Math.max(...onward);
  }
  glideTo(el, best);
}

/* ------------------------------- drag + feel ------------------------------ */

/**
 * Axis-locked touch dragging for horizontal carousels.
 *
 * Mobile browsers pan a horizontal scroller freely in both directions at once,
 * so a sideways swipe also creeps vertically (and a vertical one drags the row
 * sideways). The row therefore declares `touch-action: pan-y` (vertical swipes
 * scroll the PAGE natively, untouched) and this hook re-implements the
 * horizontal half, the way carousel libraries like Embla do: the first ~6px of
 * movement lock the gesture's axis; a horizontal drag then drives `scrollLeft`
 * 1:1 with the finger and releases into a momentum glide (ease-out, rAF) that
 * settles on the nearest card edge. CSS snap is suspended mid-gesture so it
 * can't fight the finger.
 *
 * A click right after a real drag is suppressed so a swipe never activates the
 * card under the finger. Mouse/pen pointers are ignored — desktop behaviour
 * (trackpad scroll + arrow buttons) is unchanged.
 */
export function useCarouselDrag(ref: RefObject<HTMLElement | null>) {
  // Touch drag with axis lock + momentum glide.
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

    /** Momentum fling onto the nearest card edge. */
    const settle = () => {
      const { targets, max } = snapTargetsOf(el);
      if (targets.length === 0) return glideTo(el, el.scrollLeft);
      const projected = Math.min(
        Math.max(el.scrollLeft - velocity * 200, 0),
        max,
      );
      const best = targets.reduce((a, b) =>
        Math.abs(b - projected) < Math.abs(a - projected) ? b : a,
      );
      glideTo(el, best);
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      stopGlide(el); // grabbing a gliding row hands it to the finger
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
        el.style.scrollSnapType = "none";
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
      if (axis === "x") {
        settle();
      } else if (el.style.scrollSnapType === "none") {
        // A tap interrupted a glide mid-flight — finish it gently instead of
        // letting the restored CSS snap yank the row into place.
        velocity = 0;
        settle();
      }
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
      stopGlide(el);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}
