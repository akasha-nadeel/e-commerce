"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [done, setDone] = useState(false);

  return (
    <form
      className="flex border border-white/25"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder={done ? "You're on the list ✓" : "Email address"}
        aria-label="Email address"
        disabled={done}
        className="flex-1 bg-transparent px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-white/50"
      />
      <button
        type="submit"
        className="cursor-pointer bg-[#c79a4b] px-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#0c0c0d]"
      >
        Join
      </button>
    </form>
  );
}
