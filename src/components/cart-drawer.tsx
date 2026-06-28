"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { formatLKR } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 20000;

export function CartDrawer() {
  const { isOpen, close, lines, count, subtotal, setQty, remove } = useCart();

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping bag"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-[420px] flex-col bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e7e6e9] px-6 py-5">
          <h2 className="m-0 text-[18px] font-semibold tracking-[0.04em]">
            Your Bag{count > 0 ? ` (${count})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close bag"
            onClick={close}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-[#0c0c0d] transition-colors hover:text-[#c79a4b]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d7d6d9" strokeWidth={1.6}>
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <p className="m-0 text-[15px] text-[#8a8a8e]">Your bag is empty.</p>
            <Link
              href="/collections/all"
              onClick={close}
              className="rounded-full bg-[#0c0c0d] px-8 py-4 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="border-b border-[#f0eff1] px-6 py-4">
              <p className="m-0 mb-2 text-[12px] text-[#0c0c0d]">
                {remaining > 0 ? (
                  <>
                    You&apos;re{" "}
                    <span className="font-semibold">{formatLKR(remaining)}</span> away
                    from free standard shipping.
                  </>
                ) : (
                  <span className="font-semibold text-[#c79a4b]">
                    You&apos;ve unlocked free standard shipping.
                  </span>
                )}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eeedef]">
                <div
                  className="h-full rounded-full bg-[#c79a4b] transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map((l) => (
                <div key={l.id} className="flex gap-4 border-b border-[#f0eff1] py-4">
                  <Link
                    href={`/products/${l.slug}`}
                    onClick={close}
                    className="relative block aspect-[3/4] w-[72px] shrink-0 overflow-hidden bg-[#eeedef]"
                  >
                    {l.image && (
                      <Image src={l.image} alt={l.name} fill sizes="72px" className="object-cover" />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${l.slug}`}
                        onClick={close}
                        className="text-[14px] font-bold text-[#0c0c0d] no-underline hover:text-[#c79a4b]"
                      >
                        {l.name}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${l.name}`}
                        onClick={() => remove(l.id)}
                        className="cursor-pointer text-[#8a8a8e] transition-colors hover:text-[#0c0c0d]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#8a8a8e]">
                      {l.colorName}
                      {l.size !== "OS" ? ` · Size ${l.size}` : ""}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-[#d7d6d9]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(l.id, l.qty - 1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-[16px] leading-none hover:text-[#c79a4b]"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-[13px] font-bold">{l.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(l.id, l.qty + 1)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-[16px] leading-none hover:text-[#c79a4b]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[14px] font-semibold">
                        {formatLKR(l.priceLKR * l.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e7e6e9] px-6 py-5">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[14px] font-bold uppercase tracking-[0.1em]">Subtotal</span>
                <span className="text-[18px] font-semibold">{formatLKR(subtotal)}</span>
              </div>
              <p className="mb-4 mt-0 text-[12px] text-[#8a8a8e]">
                Shipping &amp; taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={close}
                className="flex w-full items-center justify-center rounded-full bg-[#0c0c0d] px-5 py-[18px] text-[14px] font-semibold uppercase tracking-[0.12em] text-white no-underline transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
              >
                Checkout
              </Link>
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full cursor-pointer bg-transparent text-[13px] font-bold uppercase tracking-[0.1em] text-[#0c0c0d] underline-offset-4 hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
