"use client";

import { useState } from "react";

/**
 * Footer email capture — a single underlined field with an inline "Sign up"
 * text button (white → gold on hover). Optimistic success state swaps the
 * placeholder.
 */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="w-full max-w-[460px]"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <div className="flex items-center gap-4 border-b border-white/25 pb-3 transition-colors focus-within:border-white/60">
        <input
          type="email"
          required
          disabled={done}
          aria-label="Email address"
          placeholder={done ? "You're on the list ✓" : "Email address"}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/45 disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={done}
          className="shrink-0 cursor-pointer text-[14px] font-semibold text-white transition-colors hover:text-[#eec449] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#eec449] disabled:cursor-default disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
