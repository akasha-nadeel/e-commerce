import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "outline";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[12px]",
  md: "px-7 py-3.5 text-[13px]",
  lg: "px-9 py-[18px] text-[15px]",
};

const VARIANTS: Record<Variant, string> = {
  solid: "bg-[#0c0c0d] text-white hover:bg-[#eec449] hover:text-[#0c0c0d]",
  outline:
    "border border-[#0c0c0d] text-[#0c0c0d] hover:bg-[#0c0c0d] hover:text-white",
};

/**
 * Canonical storefront button — sharp-cornered (no radius) solid ink with an
 * optional trailing arrow; ink → gold on hover. Renders as a Link when `href`
 * is set, otherwise a <button>.
 */
export function Button({
  href,
  onClick,
  type = "button",
  variant = "solid",
  size = "md",
  arrow = false,
  disabled = false,
  ariaLabel,
  className = "",
  children,
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const cls = `group/btn inline-flex cursor-pointer items-center justify-center gap-2.5 font-semibold no-underline transition-colors disabled:cursor-default disabled:opacity-60 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

  const inner = (
    <>
      {children}
      {arrow && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden
          className="transition-transform duration-200 group-hover/btn:translate-x-1"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      )}
    </>
  );

  return href ? (
    <Link href={href} aria-label={ariaLabel} className={cls}>
      {inner}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cls}
    >
      {inner}
    </button>
  );
}
