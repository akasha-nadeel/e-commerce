"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** sessionStorage flag: set once the scroll-in animations have played. */
const PLAYED_KEY = "ge:intro-played";

// false = animations should play (the SSR default, and a genuine first visit).
// true  = they've already played this browser session, so render statically.
const IntroPlayedContext = createContext(false);

/** True once the scroll-reveal intro has already played this browser session. */
export function useIntroPlayed() {
  return useContext(IntroPlayedContext);
}

/**
 * Gates the site's scroll-triggered entrance animations (Reveal, product-card
 * fades, price count-ups) so they run only on the FIRST page a visitor opens in
 * a browser session. On any later navigation or refresh within that session the
 * content just appears — the intro isn't re-played every time the page reloads.
 *
 * We flag "played" in sessionStorage (not localStorage) so the animation still
 * greets a visitor again on a brand-new session, just never on a mere refresh.
 * The flag is read in a layout effect (pre-paint), so an already-played page
 * shows no flash; and both SSR and the first client render start from `false`,
 * so hydration stays in sync before the effect flips it.
 */
export function MotionGate({ children }: { children: ReactNode }) {
  const [played, setPlayed] = useState(false);

  useIsoLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(PLAYED_KEY) === "1";
      if (!seen) sessionStorage.setItem(PLAYED_KEY, "1");
    } catch {
      // Private mode / storage disabled — just let the animations play.
    }
    if (seen) setPlayed(true);
  }, []);

  return (
    <IntroPlayedContext.Provider value={played}>
      {children}
    </IntroPlayedContext.Provider>
  );
}
