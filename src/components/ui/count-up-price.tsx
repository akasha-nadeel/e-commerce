import { formatLKR } from "@/lib/format";

/**
 * Product price, LKR-formatted.
 *
 * The count-up-on-scroll animation was removed in favour of the site-wide
 * apple.com-style fade-up (see `Reveal`): the price now simply renders and
 * fades in with its card. Kept as a named component so callers are unchanged;
 * `delay` is accepted but unused.
 */
export function CountUpPrice({ value }: { value: number; delay?: number }) {
  return <>{formatLKR(value)}</>;
}
