import { useSyncExternalStore } from "react";
import { getTheme, type Theme } from "./theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

/**
 * The current theme, read from <html data-theme>. Hydration always renders
 * "light" (the server snapshot) and then corrects to the real value, so a
 * dark-mode visitor gets no hydration mismatch.
 *
 * Only use this for state that can't be expressed in CSS, such as ARIA
 * attributes. Anything visual should key off the CSS variables, which are
 * already right on first paint, before hydration.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}
