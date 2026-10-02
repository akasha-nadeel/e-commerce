"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Logo } from "@/components/logo";
import { formatLKR } from "@/lib/format";
import { COD_COUNTRY, SHIPPING, shippingCost } from "@/lib/shipping";
import {
  AcceptedPayments,
  VisaMark,
  MastercardMark,
  AmexMark,
  PaypalMark,
  PayHereMark,
} from "./payment-marks";

/**
 * Golden Eagle checkout — modelled on world-class checkout flows (Shopify,
 * Stripe, Apple): a distraction-free header, clearly numbered steps, a
 * country-aware shipping + payment engine, real payment-brand marks, a discount
 * field and a collapsible mobile order summary.
 *
 * Conditional payments mirror the Sri Lanka reality: Cash on Delivery is offered
 * for local addresses only; cards settle through PayHere; PayPal covers
 * international wallets. In production this hands off to the hosted gateway and
 * the COD rule is enforced by a payment-customization app.
 */

const COUNTRIES = [
  "Sri Lanka",
  "India",
  "United Kingdom",
  "United States",
  "Australia",
  "United Arab Emirates",
  "Canada",
  "Singapore",
];

const DISCOUNTS: Record<string, number> = { WELCOME10: 0.1, GOLDEN15: 0.15 };

type Payment = "cod" | "card" | "paypal";
type ShipMethod = "standard" | "express";

export function CheckoutClient() {
  const { lines, subtotal, count } = useCart();

  const [country, setCountry] = useState("Sri Lanka");
  const [payment, setPayment] = useState<Payment>("cod");
  const [shipMethod, setShipMethod] = useState<ShipMethod>("standard");
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Discount code
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [codeError, setCodeError] = useState("");

  const [placed, setPlaced] = useState(false);

  const isLocal = country === COD_COUNTRY;
  const rates = SHIPPING[isLocal ? "local" : "international"];

  const shipping = useMemo(() => {
    if (count === 0) return 0;
    return shippingCost(isLocal, shipMethod, subtotal);
  }, [isLocal, subtotal, count, shipMethod]);

  const discount = useMemo(
    () => (applied ? Math.round(subtotal * DISCOUNTS[applied]) : 0),
    [applied, subtotal],
  );

  const total = Math.max(0, subtotal - discount) + shipping;

  // COD is local-only; keep the selected method valid.
  const codAllowed = isLocal;
  const effectivePayment: Payment =
    payment === "cod" && !codAllowed ? "card" : payment;

  function onCountryChange(next: string) {
    setCountry(next);
    if (next !== "Sri Lanka" && payment === "cod") setPayment("card");
  }

  function applyCode() {
    const key = codeInput.trim().toUpperCase();
    if (!key) return;
    if (DISCOUNTS[key]) {
      setApplied(key);
      setCodeError("");
      setCodeInput("");
    } else {
      setCodeError("That code isn’t valid.");
    }
  }

  const summaryProps = {
    lines,
    subtotal,
    shipping,
    discount,
    applied,
    total,
    codeInput,
    codeError,
    onCodeInput: (v: string) => {
      setCodeInput(v);
      if (codeError) setCodeError("");
    },
    onApplyCode: applyCode,
    onRemoveCode: () => setApplied(null),
  };

  /* ----------------------------- empty bag ----------------------------- */
  if (count === 0 && !placed) {
    return (
      <Shell>
        <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
          <h1 className="m-0 text-[clamp(28px,4vw,44px)] font-semibold">
            Your bag is empty
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            Add a few pieces before checking out.
          </p>
          <Link
            href="/collections/all"
            className="mt-7 inline-block rounded-none bg-fg px-9 py-4 text-[13px] font-semibold text-canvas no-underline transition-colors hover:bg-[#eec449] hover:text-ink"
          >
            Continue Shopping
          </Link>
        </div>
      </Shell>
    );
  }

  /* --------------------------- order placed ---------------------------- */
  if (placed) {
    const backorderLines = lines.filter((l) => l.backorder);
    return (
      <Shell>
        <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eec449]">
            <CheckIcon />
          </div>
          <h1 className="m-0 text-[clamp(28px,4vw,44px)] font-semibold">
            Order Confirmed
          </h1>
          <p className="mx-auto mt-3 max-w-[460px] text-[15px] text-muted">
            Thanks for shopping Golden Eagle. A confirmation is on its way and our
            warehouse has been notified to pack your order
            {effectivePayment === "cod" ? " for cash on delivery" : ""}.
          </p>

          {backorderLines.length > 0 && (
            <div className="mt-8 border border-[#eec449]/45 bg-[#eec449]/10 p-5 text-left">
              <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-gold-deep">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                On Backorder
              </div>
              <p className="mt-2 text-[13px] leading-[1.6] text-fg-1">
                These items ship separately as soon as they&apos;re back in stock.
                We&apos;ll email you at each step — no action needed.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {backorderLines.map((l) => (
                  <li
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px]"
                  >
                    <span className="text-fg">
                      {l.name}
                      {l.size !== "OS" ? ` · ${l.size}` : ""}
                    </span>
                    <span className="shrink-0 font-semibold text-gold-deep">
                      You&apos;re #{l.queuePosition} in the queue
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/"
            className="mt-7 inline-block rounded-none bg-fg px-9 py-4 text-[13px] font-semibold text-canvas no-underline transition-colors hover:bg-[#eec449] hover:text-ink"
          >
            Back To Home
          </Link>
        </div>
      </Shell>
    );
  }

  /* ------------------------------ checkout ----------------------------- */
  return (
    <Shell>
      {/* Mobile order-summary accordion */}
      <div className="border-b border-line bg-surface lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-5 py-3.5"
        >
          <span className="flex items-center gap-2 text-[14px] font-medium text-fg">
            <BagIcon />
            {summaryOpen ? "Hide order summary" : "Show order summary"}
            <ChevronIcon open={summaryOpen} />
          </span>
          <span className="text-[16px] font-semibold">{formatLKR(total)}</span>
        </button>
        {summaryOpen && (
          <div className="mx-auto max-w-[1100px] px-5 pb-6">
            <OrderSummary {...summaryProps} />
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-y-10 px-5 pb-24 pt-8 sm:px-8 lg:grid-cols-[1.25fr_0.95fr] lg:gap-x-16">
        {/* LEFT — details */}
        <div className="lg:pr-2">
          <Step n={1} title="Contact">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] text-muted">
                Have an account?
              </span>
              <Link
                href="/login"
                className="text-[13px] font-semibold text-[#eec449] no-underline hover:underline"
              >
                Log in
              </Link>
            </div>
            <Field
              label="Email"
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
            />
            <Checkbox defaultChecked>Email me with news and offers</Checkbox>
          </Step>

          <Step n={2} title="Delivery">
            <SelectField
              label="Country / Region"
              value={country}
              onChange={onCountryChange}
              options={COUNTRIES}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" autoComplete="given-name" />
              <Field label="Last name" autoComplete="family-name" />
            </div>
            <Field label="Address" autoComplete="street-address" />
            <Field
              label="Apartment, suite, etc."
              optional
              autoComplete="address-line2"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" autoComplete="address-level2" />
              <Field label="Postal code" autoComplete="postal-code" />
            </div>
            <Field label="Phone" type="tel" autoComplete="tel" />
          </Step>

          <Step n={3} title="Shipping method">
            <ShipOption
              checked={shipMethod === "standard"}
              onSelect={() => setShipMethod("standard")}
              title="Standard"
              sub={rates.standard.estimate}
              price={
                shippingCost(isLocal, "standard", subtotal) === 0
                  ? "Free"
                  : formatLKR(rates.standard.rateLKR)
              }
            />
            <ShipOption
              checked={shipMethod === "express"}
              onSelect={() => setShipMethod("express")}
              title="Express"
              sub={rates.express.estimate}
              price={formatLKR(rates.express.rateLKR)}
            />
          </Step>

          <Step n={4} title="Payment" last>
            <div className="mb-1 flex items-center gap-2 text-[13px] text-muted">
              <LockIcon />
              All transactions are secure and encrypted.
            </div>

            {!codAllowed && (
              <p className="text-[13px] text-muted">
                Cash on Delivery is available for Sri Lankan addresses only.
              </p>
            )}

            <div className="flex flex-col gap-3">
              {codAllowed && (
                <PayOption
                  id="cod"
                  checked={effectivePayment === "cod"}
                  onSelect={() => setPayment("cod")}
                  title="Cash on Delivery"
                  sub="Pay in cash when your order arrives. Sri Lanka only."
                  badge={<CashIcon />}
                >
                  {effectivePayment === "cod" && (
                    <PanelNote>
                      Keep the exact amount ready — our courier collects payment
                      at your door.
                    </PanelNote>
                  )}
                </PayOption>
              )}

              <PayOption
                id="card"
                checked={effectivePayment === "card"}
                onSelect={() => setPayment("card")}
                title="Credit / Debit Card"
                sub="Visa, Mastercard, Amex & local wallets."
                badge={
                  <span className="flex items-center gap-1.5">
                    <VisaMark />
                    <MastercardMark />
                    <AmexMark />
                  </span>
                }
              >
                {effectivePayment === "card" && (
                  <PanelNote>
                    <span className="flex items-center gap-2">
                      Securely processed by <PayHereMark />. You’ll confirm
                      payment on the next step.
                    </span>
                  </PanelNote>
                )}
              </PayOption>

              <PayOption
                id="paypal"
                checked={effectivePayment === "paypal"}
                onSelect={() => setPayment("paypal")}
                title="PayPal"
                sub="Pay with your PayPal balance or linked card."
                badge={<PaypalMark />}
              >
                {effectivePayment === "paypal" && (
                  <PanelNote>
                    You’ll be redirected to PayPal to complete your purchase
                    securely.
                  </PanelNote>
                )}
              </PayOption>
            </div>

            <Checkbox defaultChecked>
              Use shipping address as billing address
            </Checkbox>
          </Step>

          <button
            type="button"
            onClick={() => setPlaced(true)}
            className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-none bg-fg px-5 py-[19px] text-[15px] font-semibold text-canvas transition-colors hover:bg-[#eec449] hover:text-ink"
          >
            <LockIcon />
            {effectivePayment === "cod"
              ? "Place Order · Cash on Delivery"
              : `Pay ${formatLKR(total)}`}
          </button>

          <div className="mt-5 flex flex-col items-center gap-3">
            <AcceptedPayments />
            <p className="text-center text-[12px] text-muted">
              Demo checkout — production hands off to the gateway’s secure hosted
              page. Your card details are never stored on our servers.
            </p>
          </div>
        </div>

        {/* RIGHT — sticky order summary (desktop) */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-8">
            <OrderSummary {...summaryProps} />
            <TrustRow />
          </div>
        </aside>
      </div>
    </Shell>
  );
}

/* ================================================================== */
/* Layout shell — distraction-free checkout header                     */
/* ================================================================== */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto grid max-w-[1100px] grid-cols-3 items-center px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 justify-self-start text-[13px] font-medium text-muted no-underline transition-colors hover:text-fg"
          >
            <span aria-hidden>←</span>
            <span className="hidden sm:inline">Back to store</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="justify-self-center">
            <Logo variant="onLight" showText markHeight={26} size={12} />
          </div>
          <span className="hidden items-center gap-1.5 justify-self-end text-[12px] font-semibold uppercase tracking-[0.14em] text-muted sm:flex">
            <LockIcon />
            Secure Checkout
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}

/* ================================================================== */
/* Order summary                                                       */
/* ================================================================== */
type SummaryProps = {
  lines: ReturnType<typeof useCart>["lines"];
  subtotal: number;
  shipping: number;
  discount: number;
  applied: string | null;
  total: number;
  codeInput: string;
  codeError: string;
  onCodeInput: (v: string) => void;
  onApplyCode: () => void;
  onRemoveCode: () => void;
};

function OrderSummary({
  lines,
  subtotal,
  shipping,
  discount,
  applied,
  total,
  codeInput,
  codeError,
  onCodeInput,
  onApplyCode,
  onRemoveCode,
}: SummaryProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col gap-4">
        {lines.map((l) => (
          <div key={l.id} className="flex gap-3.5">
            <div className="relative aspect-[3/4] w-[58px] shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {l.image && (
                <Image
                  src={l.image}
                  alt={l.name}
                  fill
                  sizes="58px"
                  className="object-cover"
                />
              )}
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-fg px-1 text-[11px] font-semibold text-canvas">
                {l.qty}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[13px] font-semibold leading-snug">
                {l.name}
              </span>
              <span className="text-[12px] text-muted">
                {l.colorName}
                {l.size !== "OS" ? ` · ${l.size}` : ""}
              </span>
              {l.backorder && (
                <span className="mt-1 w-fit bg-[#eec449]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-gold-deep">
                  Backorder
                </span>
              )}
              <span className="mt-auto text-[13px] font-semibold">
                {formatLKR(l.priceLKR * l.qty)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Discount code */}
      <div className="mt-5 border-t border-line pt-5">
        {applied ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-[#eec449] bg-[#eec449]/10 px-3 py-2.5">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <TagIcon />
              {applied}
            </span>
            <button
              type="button"
              onClick={onRemoveCode}
              className="text-[12px] font-medium text-muted underline hover:text-fg"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => onCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onApplyCode()}
                placeholder="Discount code"
                aria-label="Discount code"
                className="w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-fg"
              />
              <button
                type="button"
                onClick={onApplyCode}
                className="shrink-0 rounded-none border border-fg px-5 text-[13px] font-semibold transition-colors hover:bg-fg hover:text-canvas"
              >
                Apply
              </button>
            </div>
            {codeError && (
              <p className="mt-1.5 text-[12px] text-danger">{codeError}</p>
            )}
          </>
        )}
      </div>

      {/* Totals */}
      <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-[14px]">
        <Row label="Subtotal" value={formatLKR(subtotal)} />
        {discount > 0 && (
          <Row
            label="Discount"
            value={`– ${formatLKR(discount)}`}
            accent
          />
        )}
        <Row
          label="Shipping"
          value={shipping === 0 ? "Free" : formatLKR(shipping)}
        />
        <div className="mt-2 flex items-end justify-between border-t border-line pt-3">
          <span className="text-[17px] font-semibold">Total</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-[12px] text-muted">LKR</span>
            <span className="text-[20px] font-semibold tracking-tight">
              {formatLKR(total).replace("LKR ", "")}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function TrustRow() {
  return (
    <div className="mt-4 flex flex-col gap-2.5 px-1 text-[13px] text-fg-3">
      <span className="flex items-center gap-2.5">
        <ShieldIcon />
        Secure SSL-encrypted payment
      </span>
      <span className="flex items-center gap-2.5">
        <ReturnIcon />
        Free 14-day returns, no questions asked
      </span>
    </div>
  );
}

/* ================================================================== */
/* Step section + form primitives                                      */
/* ================================================================== */
function Step({
  n,
  title,
  last = false,
  children,
}: {
  n: number;
  title: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={last ? "mb-7" : "mb-9"}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fg text-[13px] font-semibold text-canvas">
          {n}
        </span>
        <h2 className="m-0 text-[17px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

const fieldBase =
  "w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-faint focus:border-fg";

function Field({
  label,
  type = "text",
  placeholder,
  autoComplete,
  optional = false,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  optional?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-fg">
        {label}
        {optional && <span className="text-faint"> (optional)</span>}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={fieldBase}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-fg">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldBase} cursor-pointer appearance-none pr-10`}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
          <ChevronIcon open={false} />
        </span>
      </div>
    </label>
  );
}

function Checkbox({
  children,
  defaultChecked = false,
}: {
  children: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] text-fg-3">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 shrink-0 cursor-pointer accent-fg"
      />
      {children}
    </label>
  );
}

function ShipOption({
  checked,
  onSelect,
  title,
  sub,
  price,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  price: string;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors"
      style={{ borderColor: checked ? "var(--fg)" : "var(--line-strong)" }}
    >
      <input
        type="radio"
        name="shipping"
        checked={checked}
        onChange={onSelect}
        className="size-4 accent-fg"
      />
      <span className="flex flex-1 flex-col">
        <span className="text-[14px] font-semibold">{title}</span>
        <span className="text-[12px] text-muted">{sub}</span>
      </span>
      <span className="text-[14px] font-semibold">{price}</span>
    </label>
  );
}

function PayOption({
  id,
  checked,
  onSelect,
  title,
  sub,
  badge,
  children,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border transition-colors"
      style={{ borderColor: checked ? "var(--fg)" : "var(--line-strong)" }}
    >
      <label
        htmlFor={`pay-${id}`}
        className="flex cursor-pointer items-center gap-3 p-4"
      >
        <input
          id={`pay-${id}`}
          type="radio"
          name="payment"
          checked={checked}
          onChange={onSelect}
          className="size-4 shrink-0 accent-fg"
        />
        <span className="flex flex-1 flex-col">
          <span className="text-[14px] font-semibold">{title}</span>
          <span className="text-[12px] text-muted">{sub}</span>
        </span>
        {badge && <span className="shrink-0">{badge}</span>}
      </label>
      {children}
    </div>
  );
}

function PanelNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-line bg-surface px-4 py-3 text-[13px] leading-relaxed text-fg-3">
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-3">{label}</span>
      <span className={`font-semibold ${accent ? "text-[#eec449]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="text-fg"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12l5 5 9-11" />
    </svg>
  );
}

function CashIcon() {
  return (
    <span className="flex h-6 items-center text-success">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    </span>
  );
}

function TagIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#eec449"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="#eec449" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="text-success"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="text-success"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
    </svg>
  );
}
