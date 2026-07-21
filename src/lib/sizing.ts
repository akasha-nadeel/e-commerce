/**
 * Garment size chart for `/size-guide`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TO ADD THE CHART: fill in `SIZE_CHART` below. That's the only change
 * needed — the size guide page renders the table automatically as soon as
 * this array is non-empty, and falls back to "email us and we'll measure it"
 * while it's empty. No component edits required.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Values are free-form strings so ranges paste in cleanly ("91–96", "46.5").
 *
 * IMPORTANT — set `MEASURED_AS` to match how the numbers were actually taken.
 * Body measurements ("your chest is 96cm") and flat garment measurements
 * ("the garment measures 56cm pit-to-pit") are not interchangeable, and
 * labelling one as the other is a leading cause of returns. If in doubt,
 * measure the garment flat and use "garment".
 */

export type MeasuredAs = "body" | "garment";

/** Whether the numbers describe the wearer's body or the garment laid flat. */
export const MEASURED_AS: MeasuredAs = "garment";

/** Unit shown in the table header. */
export const SIZE_UNIT = "cm";

export interface SizeRow {
  /** Size label — must match the labels used on products (XS, S, M, L, XL, XXL). */
  size: string;
  chest: string;
  waist: string;
  shoulder: string;
  length: string;
}

/**
 * Empty until real measurements are taken from stock. Example of a filled row:
 *
 *   { size: "M", chest: "54", waist: "52", shoulder: "46", length: "71" },
 */
export const SIZE_CHART: SizeRow[] = [];

/** True once the chart has real data to show. */
export const hasSizeChart = SIZE_CHART.length > 0;

export const MEASURED_AS_NOTE: Record<MeasuredAs, string> = {
  body: "These are body measurements — measure yourself, then pick the size whose range you fall into.",
  garment:
    "These are garment measurements, taken flat. Compare them against a piece you already own that fits the way you like.",
};
