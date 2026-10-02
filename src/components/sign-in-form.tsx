"use client";

import { useState } from "react";

export function SignInForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="border border-line bg-surface p-6 text-[14px] leading-relaxed text-fg">
        Check your inbox — if an account exists we&apos;ve sent a secure sign-in
        link. (Passwordless accounts go live with the Shopify customer-accounts
        integration.)
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor="signin-email" className="text-[13px] font-bold uppercase tracking-[0.14em]">
        Email address
      </label>
      <input
        id="signin-email"
        type="email"
        required
        placeholder="you@email.com"
        className="border border-line-strong px-4 py-3.5 text-[15px] outline-none focus:border-fg"
      />
      <button
        type="submit"
        className="mt-1 cursor-pointer rounded-none bg-fg px-5 py-4 text-[14px] font-semibold uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-[#eec449] hover:text-ink"
      >
        Email Me A Sign-In Link
      </button>
    </form>
  );
}
