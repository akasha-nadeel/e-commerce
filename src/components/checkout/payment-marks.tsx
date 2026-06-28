/**
 * Payment-brand acceptance marks, rendered as crisp inline SVG so they stay
 * sharp at any DPI and need no network requests. These are the gateways the
 * Golden Egal checkout actually settles through:
 *   • Visa / Mastercard / Amex — captured by PayHere (local + international)
 *   • PayHere — the Sri Lankan gateway of record
 *   • PayPal — international wallets (where the SL account can receive)
 */

function Chip({
  label,
  flush = false,
  children,
}: {
  label: string;
  /** Full-bleed coloured card (e.g. Amex) — no inner padding. */
  flush?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex h-6 min-w-[38px] items-center justify-center rounded-[5px] border border-[#e7e6e9] bg-white ${
        flush ? "overflow-hidden p-0" : "px-1.5"
      }`}
    >
      {children}
    </span>
  );
}

export function VisaMark() {
  return (
    <Chip label="Visa">
      <svg viewBox="0 0 40 16" className="h-2.5 w-auto" aria-hidden="true">
        <text
          x="20"
          y="13"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="15"
          fontStyle="italic"
          fontWeight="700"
          letterSpacing="0.5"
          fill="#1434CB"
        >
          VISA
        </text>
      </svg>
    </Chip>
  );
}

export function MastercardMark() {
  return (
    <Chip label="Mastercard">
      <svg viewBox="0 0 34 22" className="h-3.5 w-auto" aria-hidden="true">
        <circle cx="13" cy="11" r="9" fill="#EB001B" />
        <circle cx="21" cy="11" r="9" fill="#F79E1B" fillOpacity="0.85" />
      </svg>
    </Chip>
  );
}

export function AmexMark() {
  return (
    <Chip label="American Express" flush>
      <svg viewBox="0 0 40 24" className="h-full w-full" aria-hidden="true">
        <rect width="40" height="24" fill="#1F72CD" />
        <text
          x="20"
          y="15.5"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="0.4"
          fill="#fff"
        >
          AMEX
        </text>
      </svg>
    </Chip>
  );
}

export function PaypalMark() {
  return (
    <Chip label="PayPal">
      <svg viewBox="0 0 52 16" className="h-2.5 w-auto" aria-hidden="true">
        <text
          x="0"
          y="13"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="14"
          fontStyle="italic"
          fontWeight="700"
        >
          <tspan fill="#003087">Pay</tspan>
          <tspan fill="#009CDE">Pal</tspan>
        </text>
      </svg>
    </Chip>
  );
}

export function PayHereMark() {
  return (
    <Chip label="PayHere">
      <svg viewBox="0 0 56 16" className="h-2.5 w-auto" aria-hidden="true">
        <text
          x="0"
          y="13"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="13"
          fontWeight="800"
        >
          <tspan fill="#15171a">Pay</tspan>
          <tspan fill="#1AB188">Here</tspan>
        </text>
      </svg>
    </Chip>
  );
}

/** Accepted-payments strip — re-used as a trust signal across the page. */
export function AcceptedPayments({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <VisaMark />
      <MastercardMark />
      <AmexMark />
      <PaypalMark />
      <PayHereMark />
    </div>
  );
}
