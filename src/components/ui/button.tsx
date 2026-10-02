import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "solid" | "outline" | "accent";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "px-5 py-2.5 text-[12px]",
  md: "px-7 py-3.5 text-[13px]",
  lg: "px-9 py-[18px] text-[15px]",
};

const VARIANTS: Record<Variant, string> = {
  solid: "bg-fg text-canvas hover:bg-[#eec449] hover:text-ink",
  outline:
    "border border-fg text-fg hover:bg-fg hover:text-canvas",
  // Primary emphasis: identical to `solid` in light mode (ink → gold), but
  // gold in dark mode rather than inverting to white. See `--accent`.
  accent:
    "bg-accent text-on-accent hover:bg-accent-hover hover:text-ink",
};

/** Bottom-centred "View All" under a product/tile row. One definition so every
 *  section's View All looks the same in both themes. */
export function ViewAll({ href }: { href: string }) {
  return (
    <div className="mt-9 flex justify-center">
      <Button href={href} variant="accent" arrow>
        View All
      </Button>
    </div>
  );
}

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
  const cls = `group/btn inline-flex cursor-pointer items-center justify-center gap-2.5 font-semibold no-underline transition-[color,background-color,transform] duration-200 active:scale-[0.96] disabled:cursor-default disabled:opacity-60 ${SIZES[size]} ${VARIANTS[variant]} ${className}`;

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
