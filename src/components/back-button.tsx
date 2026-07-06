"use client";

import { useRouter } from "next/navigation";

/**
 * "Back" that returns to the previous page via browser history, falling back to
 * a provided href (e.g. the collection) when the product page was opened directly.
 */
export function BackButton({
  fallbackHref = "/",
  to,
  label = "Back",
}: {
  fallbackHref?: string;
  /** When set, always navigate here (deterministic) instead of browser history —
   *  e.g. category pages return to the home "Shop By Category" section. */
  to?: string;
  label?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (to) {
      router.push(to);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex cursor-pointer items-center gap-1 rounded-none bg-[#0c0c0d] px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#eec449] hover:text-[#0c0c0d]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {label}
    </button>
  );
}
