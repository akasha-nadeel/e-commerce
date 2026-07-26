"use client";

import { useState, type ReactNode } from "react";

/**
 * Studio UI kit.
 *
 * Built from the storefront's own form language rather than invented for the
 * admin, so the Studio reads as part of Golden Eagle instead of a bolted-on
 * tool. The specifics are lifted from `components/auth/auth-shell.tsx` and
 * `components/checkout/checkout-client.tsx`:
 *
 *   - inputs are `rounded-xl` on a `#f7f7f8` fill with a transparent border
 *     that goes ink on focus (the site does *not* use sharp white input boxes)
 *   - labels are 13px semibold, errors are `#d23b3b` at 12px
 *   - CTAs stay sharp-cornered ink → gold on hover, like every storefront button
 *   - notices use the gold `#eec449` tint the checkout uses for backorders
 *
 * Everything lives here so a token change lands in one place, which is the
 * problem the first pass had — brand hexes were scattered across every file.
 */

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

export const INK = "#0c0c0d";
export const GOLD = "#eec449";
export const MUTED = "#8a8a8e";
export const BODY = "#6a6a6e";
export const LINE = "#e7e6e9";
export const DANGER = "#d23b3b";

const inputBase =
  "w-full rounded-xl border bg-[#f7f7f8] px-4 py-3 text-[15px] text-[#0c0c0d] outline-none transition-colors placeholder:text-[#a3a3a8] focus:bg-white";
const inputIdle = "border-transparent focus:border-[#0c0c0d]";

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

/** Page title block — storefront display type, not admin-panel type. */
export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display-tight m-0 text-[clamp(26px,3.4vw,38px)] font-semibold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[14px] text-[#8a8a8e]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * A numbered step in the product form.
 *
 * Numbered on purpose: the whole point of the Studio is that adding a product is
 * a short, finite sequence rather than the wall of fields Shopify presents. The
 * count is the reassurance.
 */
export function Step({
  n,
  title,
  hint,
  done,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  /** Draws the number gold with a tick once the step is satisfied. */
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#e7e6e9] py-8 first:pt-0 last:border-b-0">
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center text-[12px] font-bold transition-colors ${
            done ? "bg-[#eec449] text-[#0c0c0d]" : "bg-[#0c0c0d] text-white"
          }`}
          aria-hidden
        >
          {done ? <CheckIcon size={13} /> : n}
        </span>
        <div>
          <h2 className="m-0 text-[18px] font-semibold tracking-[-0.015em]">
            {title}
          </h2>
          {hint && <p className="mt-1 text-[13px] text-[#8a8a8e]">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

/**
 * Label + hint + error around a single control.
 *
 * Renders a `<label>` so clicking the text focuses the input via implicit
 * association — which means **children must be phrasing content**. Wrap any
 * composite control in a `<span>` (see `MoneyInput`), never a `<div>`: browsers
 * reparse invalid label content and React reports it as a hydration mismatch.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[13px] font-semibold text-[#0c0c0d]">
          {label}
          {required && <span className="text-[#eec449]"> *</span>}
        </span>
      )}
      {hint && <span className="text-[13px] text-[#8a8a8e]">{hint}</span>}
      {children}
      {error && <span className="text-[12px] text-[#d23b3b]">{error}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  error,
  autoFocus,
  large,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  autoFocus?: boolean;
  large?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-invalid={error || undefined}
      className={`${inputBase} ${large ? "py-3.5 text-[17px]" : ""} ${
        error ? "border-[#d23b3b]" : inputIdle
      }`}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} ${inputIdle} resize-none leading-relaxed`}
    />
  );
}

/** Money input with a fixed LKR prefix, so the unit is never ambiguous. */
export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  // A <span>, not a <div>: `Field` wraps children in a <label>, whose content
  // model is phrasing content. Block elements inside a label are invalid HTML
  // and browsers may reparse them, which shows up as a React hydration mismatch
  // rather than as anything that looks like a markup problem.
  return (
    <span
      className={`flex items-center rounded-xl border bg-[#f7f7f8] transition-colors focus-within:bg-white ${
        error ? "border-[#d23b3b]" : "border-transparent focus-within:border-[#0c0c0d]"
      }`}
    >
      <span className="select-none pl-4 text-[14px] font-medium text-[#8a8a8e]">
        LKR
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        inputMode="numeric"
        placeholder={placeholder}
        className="w-full bg-transparent px-3 py-3.5 text-[17px] outline-none placeholder:text-[#a3a3a8]"
      />
    </span>
  );
}

export function QtyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="w-[92px]">
      <span className="mb-1.5 block text-center text-[12px] font-semibold uppercase tracking-wider text-[#8a8a8e]">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        inputMode="numeric"
        placeholder="0"
        className="w-full rounded-xl border border-transparent bg-[#f7f7f8] px-2 py-2.5 text-center text-[16px] outline-none transition-colors focus:border-[#0c0c0d] focus:bg-white"
      />
    </label>
  );
}

/**
 * Passphrase field for the Studio sign-in.
 *
 * Visually identical to `auth-shell.tsx`'s `PasswordField`, but **uncontrolled
 * with a `name`** so it submits through a `<form action={serverAction}>`. The
 * storefront one is controlled with no name attribute, which silently produces
 * empty FormData — worth having a separate component rather than a subtle bug.
 */
export function PassphraseField({
  name,
  label,
  placeholder,
  error,
  icon,
}: {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[13px] font-semibold text-[#0c0c0d]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8e]">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          autoFocus
          autoComplete="current-password"
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputBase} pr-12 ${icon ? "pl-11" : ""} ${
            error ? "border-[#d23b3b]" : inputIdle
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide passphrase" : "Show passphrase"}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#8a8a8e] transition-colors hover:text-[#0c0c0d]"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span id={`${name}-error`} className="text-[12px] text-[#d23b3b]">
          {error}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Choices                                                             */
/* ------------------------------------------------------------------ */

export function Chip({
  on,
  onClick,
  children,
  wide,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border px-4 py-2.5 text-[14px] font-medium transition-all active:scale-[0.97] ${
        wide ? "min-w-[62px]" : ""
      } ${
        on
          ? "border-[#0c0c0d] bg-[#0c0c0d] text-white"
          : "border-[#e2e1e4] bg-white text-[#0c0c0d] hover:border-[#0c0c0d]"
      }`}
    >
      {children}
    </button>
  );
}

/** Colour choice — the swatch is the affordance, the name confirms it. */
export function ColorChip({
  name,
  hex,
  on,
  onClick,
}: {
  name: string;
  hex: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all active:scale-[0.97] ${
        on
          ? "border-[#0c0c0d] bg-[#0c0c0d] text-white"
          : "border-[#e2e1e4] bg-white text-[#0c0c0d] hover:border-[#0c0c0d]"
      }`}
    >
      <span
        className="h-4 w-4 shrink-0 rounded-[4px] border border-black/15"
        style={{ background: hex }}
        aria-hidden
      />
      {name}
    </button>
  );
}

/** Two-option segmented control, for genuinely binary choices. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-xl bg-[#f7f7f8] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${
            value === o.value
              ? "bg-[#0c0c0d] text-white"
              : "text-[#6a6a6e] hover:text-[#0c0c0d]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#0c0c0d]"
      />
      <span className="text-[14px] leading-relaxed">
        <span className="font-semibold">{title}</span>
        <span className="mt-0.5 block text-[13px] text-[#8a8a8e]">
          {description}
        </span>
      </span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

/**
 * Sharp-cornered ink → gold, matching every storefront CTA. Not the shared
 * `ui/button.tsx` primitive because that one has no loading or danger state and
 * adding admin concerns to a storefront component would be the wrong trade.
 */
export function StudioButton({
  children,
  onClick,
  type = "button",
  variant = "solid",
  disabled,
  loading,
  full,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline" | "danger" | "gold";
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
}) {
  const variants = {
    solid:
      "bg-[#0c0c0d] text-white hover:bg-[#eec449] hover:text-[#0c0c0d] disabled:bg-[#c9c9cc] disabled:text-white",
    outline:
      "border border-[#0c0c0d] text-[#0c0c0d] hover:bg-[#0c0c0d] hover:text-white",
    danger: "bg-[#d23b3b] text-white hover:opacity-90 disabled:bg-[#e6b3b3]",
    // For use *on* an ink surface (the sticky save bar): starts gold and goes
    // white on hover, since the usual ink→gold inversion has nothing to invert
    // against on a black background. Disabled states are tinted from white for
    // the same reason — a light grey would read as enabled there.
    gold: "bg-[#eec449] text-[#0c0c0d] hover:bg-white disabled:bg-white/15 disabled:text-white/40",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-none px-7 py-3.5 text-[13px] font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed ${
        full ? "w-full" : ""
      } ${variants[variant]}`}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function TextButton({
  children,
  onClick,
  tone = "default",
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer text-[13px] font-semibold underline underline-offset-4 transition-colors ${
        tone === "danger"
          ? "text-[#d23b3b] hover:text-[#a82c2c]"
          : "text-[#0c0c0d] hover:text-[#8a8a8e]"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

/** Status of a product, in the storefront's uppercase-tracking label style. */
export function StatusPill({ status }: { status: string }) {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    ACTIVE: "bg-[#0c0c0d] text-white",
    DRAFT: "bg-[#eec449] text-[#0c0c0d]",
    ARCHIVED: "bg-[#f0f0f1] text-[#8a8a8e]",
  };
  const label = s === "ACTIVE" ? "Live" : s === "DRAFT" ? "Draft" : "Hidden";
  return (
    <span
      className={`inline-block px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.1em] ${
        map[s] ?? map.ARCHIVED
      }`}
    >
      {label}
    </span>
  );
}

/**
 * Inline notice. `gold` reuses the checkout's backorder treatment so a caution
 * in the Studio looks like a caution on the storefront.
 */
export function Notice({
  tone = "gold",
  title,
  children,
}: {
  tone?: "gold" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const box =
    tone === "danger"
      ? "border-[#d23b3b]/40 bg-[#d23b3b]/8"
      : "border-[#eec449]/45 bg-[#eec449]/10";
  const head = tone === "danger" ? "text-[#a82c2c]" : "text-[#9a7322]";
  const body = tone === "danger" ? "text-[#7d2626]" : "text-[#3a3a3e]";
  return (
    <div className={`border p-4 ${box}`}>
      {title && (
        <p
          className={`m-0 text-[12px] font-bold uppercase tracking-[0.08em] ${head}`}
        >
          {title}
        </p>
      )}
      <div className={`${title ? "mt-1.5" : ""} text-[13px] leading-[1.65] ${body}`}>
        {children}
      </div>
    </div>
  );
}

/** A requirement in the "ready to publish" checklist. */
export function CheckItem({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-snug">
      <span
        className={`mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full ${
          done ? "bg-[#0c0c0d] text-white" : "border border-[#d7d6d9] bg-white"
        }`}
        aria-hidden
      >
        {done && <CheckIcon size={10} />}
      </span>
      <span className={done ? "text-[#8a8a8e] line-through" : "text-[#0c0c0d]"}>
        {children}
      </span>
    </li>
  );
}

export function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[2px] border-current border-t-transparent"
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/* Icons — 24-grid, stroked, matching the storefront's icon weight      */
/* ------------------------------------------------------------------ */

export function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EyeIcon() {
  return (
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
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
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.16 2.94" />
      <path d="M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 4.4-1.1" />
      <path d="M3 3l18 18" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function ChevronIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
