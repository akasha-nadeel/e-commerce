/**
 * Light/dark theme. Light is the default for every visitor; dark is opt-in via
 * the header toggle and remembered per device in localStorage.
 *
 * The theme is a `data-theme` attribute on <html>, and every theme-aware colour
 * is a CSS variable keyed off it (see globals.css). Nothing here touches React
 * state, so switching never re-renders the tree — the browser just restyles.
 *
 * Server-safe on purpose: `layout.tsx` (a Server Component) imports the init
 * script from here. The React hook lives in `use-theme.ts`.
 */

export type Theme = "light" | "dark";

/** localStorage key — namespaced like `ge:intro-played` and `ge_cart_v1`. */
export const THEME_KEY = "ge:theme";

/**
 * Inline <head> script. It runs while the HTML is still parsing, before first
 * paint, so a returning dark-mode visitor never sees a white flash. A
 * `useEffect` would be too late: on a slow connection the browser paints the
 * server HTML long before React loads. See Next's "preventing flash before
 * hydration" guide (node_modules/next/dist/docs/01-app/02-guides/).
 */
export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)})==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}})()`;

export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/**
 * Switch theme and remember it. Crossfades the whole page with the View
 * Transitions API where available; otherwise, or under reduced motion, it
 * swaps instantly.
 *
 * Per-element colour transitions are suppressed for the swap either way.
 * Without that, every `transition-colors` element would animate at its own
 * speed and the page would change colour in a ragged wave. Elements marked
 * `.theme-anim` (the toggle's own icons) are exempt.
 */
export function setTheme(next: Theme): void {
  const apply = () =>
    withoutTransitions(() => {
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Private mode / blocked storage: the switch still works for this page.
      }
    });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && typeof document.startViewTransition === "function") {
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

function withoutTransitions(fn: () => void): void {
  const style = document.createElement("style");
  style.textContent =
    "*:not(.theme-anim),*:not(.theme-anim)::before,*:not(.theme-anim)::after{transition:none!important}";
  document.head.appendChild(style);
  fn();
  // Force a style recalc so the new colours commit while transitions are off,
  // then restore them on the next tick.
  void window.getComputedStyle(document.body).color;
  setTimeout(() => style.remove(), 1);
}
