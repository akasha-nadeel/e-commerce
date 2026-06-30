import Image from "next/image";
import Link from "next/link";

/**
 * Golden Egal logo — eagle mark with an optional wordmark.
 *
 * The eagle master is white-on-transparent. On dark surfaces we render it as-is;
 * on light surfaces we swap to the black master (the client asked for a black
 * logo on white backgrounds). The nav uses the eagle alone; the footer keeps
 * the full wordmark.
 */
export function Logo({
  variant = "onDark",
  size = 22,
  href = "/",
  showText = true,
  markHeight,
}: {
  variant?: "onDark" | "onLight" | "gold";
  size?: number;
  href?: string;
  /** Show the "Golden Egal" wordmark next to the eagle. */
  showText?: boolean;
  /** Explicit eagle height in px; defaults to a ratio of the wordmark size. */
  markHeight?: number;
}) {
  const onDark = variant === "onDark";
  const isGold = variant === "gold";
  // Versioned filenames + unoptimized to defeat any stale browser / image-CDN
  // cache when the master art changes. The gold mark is used over the dark hero.
  const mark = isGold
    ? "/logo-eagle-gold-v2.png"
    : onDark
      ? "/logo-eagle-light-v2.png"
      : "/logo-eagle-dark-v2.png";
  const h = markHeight ?? Math.round(size * 1.15);

  return (
    <Link
      href={href}
      aria-label="Golden Egal — home"
      className="flex items-center gap-2.5 no-underline"
      style={{ color: isGold ? "#c79a4b" : onDark ? "#fff" : "#0c0c0d" }}
    >
      <Image
        src={mark}
        alt="Golden Egal eagle"
        width={Math.round(h * (590 / 360))}
        height={h}
        priority
        unoptimized
        style={{ height: h, width: "auto", display: "block" }}
      />
      {showText && (
        <span
          className="font-semibold uppercase"
          style={{ fontSize: size, letterSpacing: "0.2em", lineHeight: 1 }}
        >
          Golden Egal
        </span>
      )}
    </Link>
  );
}
