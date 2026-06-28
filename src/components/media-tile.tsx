import Image from "next/image";

const LIGHT_BG =
  "linear-gradient(155deg,#eeedef 0%,#e5e4e7 52%,#d8d7db 100%)";

/**
 * Product/campaign media surface. Renders a real image when `src` is supplied
 * (Shopify CDN later); otherwise a premium labelled placeholder tile that marks
 * exactly what photography belongs here — mirroring the design prototype.
 *
 * When `hoverSrc` is supplied it cross-fades in on parent `group` hover — the
 * second-angle reveal used by world-class apparel grids.
 */
export function MediaTile({
  label,
  src,
  hoverSrc,
  alt,
  aspect = "3/4",
  className = "",
  children,
  priority,
}: {
  label?: string;
  src?: string;
  hoverSrc?: string;
  alt?: string;
  aspect?: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <div
      className={`tile-texture-light relative overflow-hidden ${className}`}
      style={{ aspectRatio: aspect, background: LIGHT_BG }}
    >
      {src && (
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, 300px"
          className={`object-cover transition-[opacity,transform] duration-500 ${
            hoverSrc ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
          }`}
        />
      )}
      {src && hoverSrc && (
        <Image
          src={hoverSrc}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 768px) 50vw, 300px"
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
      {label && !src && (
        <span className="absolute bottom-[13px] left-[13px] z-10 font-mono text-[9.5px] tracking-[0.1em] text-black/35">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
