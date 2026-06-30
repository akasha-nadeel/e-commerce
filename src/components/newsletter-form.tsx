"use client";

import { useState } from "react";

/**
 * Footer email capture. Pill input with a circular arrow submit (white → gold on
 * hover) sitting inside the field. Optimistic success state swaps the placeholder.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="relative w-full max-w-[460px]"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        disabled={done}
        aria-label="Email address"
        placeholder={done ? "You're on the list ✓" : "Enter your email"}
        className="h-14 w-full rounded-xl border border-white/15 bg-white/[0.04] pl-5 pr-16 text-[15px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-white/35 disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={done}
        aria-label="Subscribe to the newsletter"
        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[#0c0c0d] transition-colors hover:bg-[#c79a4b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c79a4b] disabled:cursor-default disabled:opacity-60"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="4" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  );
}
