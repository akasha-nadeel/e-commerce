"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";

/* ------------------------------------------------------------------ */
/* Golden Egal auth experience                                         */
/* Split-screen shell: focused form on the left, a tall brand showcase */
/* card on the right. Re-used by both /login and /signup so the two    */
/* pages stay pixel-consistent. Mirrors the reference layout but is     */
/* fully re-skinned in the Golden Egal design tokens.                  */
/* ------------------------------------------------------------------ */

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-white text-[#0c0c0d]">
      {/* LEFT — form column */}
      <div className="flex min-h-screen w-full flex-col px-6 py-7 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        <header className="flex items-center justify-between">
          <Logo variant="onLight" showText markHeight={28} size={13} />
          <Link
            href="/"
            className="text-[13px] font-medium text-[#8a8a8e] no-underline transition-colors hover:text-[#0c0c0d]"
          >
            ← Back to store
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </div>

      {/* RIGHT — brand showcase (desktop only) */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="sticky top-0 h-screen p-3">
          <Showcase />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right-hand showcase card                                            */
/* ------------------------------------------------------------------ */
function Showcase() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#ededee]">
      <Image
        src="/hero-v3.jpg"
        alt="Golden Egal model wearing the collection in studio"
        fill
        priority
        sizes="50vw"
        className="object-cover object-[72%_20%]"
      />
      {/* Dark scrim — anchors the white overlay copy at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/5" />

      <div className="absolute inset-x-0 bottom-0 p-9 xl:p-11">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/70">
          Golden Egal
        </p>
        <h2 className="display-tight m-0 max-w-[440px] text-[clamp(28px,3vw,42px)] font-semibold leading-[1.05] text-white">
          Be Better Everyday
        </h2>
        <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-white/75">
          Premium heavyweight tees and athleisure — built from the ground up for
          everyday wear, crafted to last.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Pill icon={<CheckIcon />}>Island-wide Shipping</Pill>
          <Pill icon={<ReturnIcon />}>14-Day Easy Returns</Pill>
        </div>
      </div>
    </div>
  );
}

function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md">
      <span className="text-[#e7c98a]">{icon}</span>
      {children}
    </span>
  );
}

/* ================================================================== */
/* Shared form UI kit                                                  */
/* ================================================================== */

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-7">
      <h1 className="display-tight m-0 text-[30px] font-semibold leading-tight sm:text-[34px]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] text-[#8a8a8e]">{subtitle}</p>
    </div>
  );
}

export function GoogleButton({
  label = "Continue with Google",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-none border border-[#e7e6e9] bg-white px-5 py-3.5 text-[14px] font-semibold text-[#0c0c0d] transition-colors hover:border-[#d7d6d9] hover:bg-[#fafafa]"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-[#e7e6e9]" />
      <span className="text-[12px] font-medium text-[#a3a3a8]">or</span>
      <span className="h-px flex-1 bg-[#e7e6e9]" />
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border bg-[#f7f7f8] px-4 py-3 text-[15px] text-[#0c0c0d] outline-none transition-colors placeholder:text-[#a3a3a8] focus:bg-white";

export function TextField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0c0c0d]">
        {label}
        {required && <span className="text-[#c79a4b]"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${
          error ? "border-[#d23b3b]" : "border-transparent focus:border-[#0c0c0d]"
        }`}
      />
      {error && (
        <span id={`${id}-error`} className="text-[12px] text-[#d23b3b]">
          {error}
        </span>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#0c0c0d]">
        {label}
        {required && <span className="text-[#c79a4b]"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} pr-12 ${
            error
              ? "border-[#d23b3b]"
              : "border-transparent focus:border-[#0c0c0d]"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#8a8a8e] transition-colors hover:text-[#0c0c0d]"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <span id={`${id}-error`} className="text-[12px] text-[#d23b3b]">
          {error}
        </span>
      )}
    </div>
  );
}

export function AuthCheckbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-start gap-2.5 text-[13px] leading-relaxed text-[#6a6a6e]"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#0c0c0d]"
        />
        <span>{children}</span>
      </label>
      {error && <span className="text-[12px] text-[#d23b3b]">{error}</span>}
    </div>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="mt-1 w-full cursor-pointer rounded-none bg-[#0c0c0d] px-5 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
    >
      {children}
    </button>
  );
}

export function AuthAltLink({
  prompt,
  href,
  cta,
}: {
  prompt: string;
  href: string;
  cta: string;
}) {
  return (
    <p className="mt-1 text-center text-[14px] text-[#6a6a6e]">
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-[#c79a4b] no-underline hover:underline"
      >
        {cta}
      </Link>
    </p>
  );
}

export function AuthSuccess({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-[#0c0c0d] text-white">
        <CheckIcon size={26} />
      </div>
      <h1 className="display-tight m-0 text-[26px] font-semibold">{title}</h1>
      <p className="mt-2.5 max-w-[320px] text-[14px] leading-relaxed text-[#8a8a8e]">
        {body}
      </p>
      <Link
        href="/"
        className="mt-7 rounded-none bg-[#0c0c0d] px-8 py-3.5 text-[13px] font-semibold text-white no-underline transition-colors hover:bg-[#c79a4b] hover:text-[#0c0c0d]"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ReturnIcon() {
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
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-7.7L3 8" />
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
      aria-hidden="true"
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
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.16 2.94" />
      <path d="M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9 9 0 0 0 4.4-1.1" />
      <path d="M3 3l18 18" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
