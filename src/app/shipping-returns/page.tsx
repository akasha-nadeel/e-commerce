import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { JsonLd } from "@/components/json-ld";
import { formatLKR } from "@/lib/format";
import {
  CONTACT_EMAIL,
  SITE_NAME,
  WEBSITE_ID,
  absoluteUrl,
  breadcrumbNode,
  jsonLdGraph,
} from "@/lib/seo";
import {
  COD_COUNTRY,
  FREE_SHIPPING_THRESHOLD_LKR,
  RETURN_WINDOW_DAYS,
  SHIPPING,
} from "@/lib/shipping";

/**
 * Public shipping & returns policy.
 *
 * Every rate, estimate and window on this page is read from `lib/shipping.ts`
 * — the same module the checkout charges from — so the published policy can
 * never drift from what a customer is actually billed.
 *
 * This route also backs the `MerchantReturnPolicy` in product structured data
 * and the footer's "Returns & Exchanges" link, which previously pointed at
 * `/account#returns`: an anchor that didn't exist, on a page that redirects
 * logged-out visitors to a login wall and is excluded from search.
 */

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: `Delivery times, shipping rates and the ${RETURN_WINDOW_DAYS}-day return policy for ${SITE_NAME} — free island-wide delivery on Sri Lankan orders over LKR ${FREE_SHIPPING_THRESHOLD_LKR.toLocaleString("en-US")}.`,
  alternates: { canonical: "/shipping-returns" },
};

const free = `Free over ${formatLKR(FREE_SHIPPING_THRESHOLD_LKR)}`;

export default function ShippingReturnsPage() {
  const url = absoluteUrl("/shipping-returns");

  const jsonLd = jsonLdGraph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Shipping & Returns",
      description: `Delivery times, rates and the ${RETURN_WINDOW_DAYS}-day return policy for ${SITE_NAME}.`,
      isPartOf: { "@id": WEBSITE_ID },
    },
    breadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Shipping & Returns", path: "/shipping-returns" },
    ]),
  );

  return (
    <div className="w-full bg-white">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-[820px] px-5 pt-5 sm:px-8">
        <BackButton fallbackHref="/" />
      </div>

      <section className="mx-auto max-w-[820px] px-5 pb-8 pt-6 sm:px-8">
        <h1 className="display-tight m-0 text-[clamp(34px,5vw,56px)] font-semibold leading-[0.95]">
          Shipping &amp; Returns
        </h1>
        <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7] text-[#8a8a8e]">
          Everything about how your order reaches you, and what happens if
          something isn&rsquo;t right.
        </p>
      </section>

      <section className="mx-auto max-w-[820px] px-5 pb-24 sm:px-8">
        <div className="rich-text text-[15px] leading-[1.75] text-[#4a4a4e]">
          <Section title="Delivery within Sri Lanka">
            <RateTable
              rows={[
                {
                  method: "Standard",
                  estimate: SHIPPING.local.standard.estimate,
                  price: free,
                  note: `Otherwise ${formatLKR(SHIPPING.local.standard.rateLKR)}`,
                },
                {
                  method: "Express",
                  estimate: SHIPPING.local.express.estimate,
                  price: formatLKR(SHIPPING.local.express.rateLKR),
                },
              ]}
            />
            <p>
              We deliver island-wide. Standard delivery is free on orders over{" "}
              <strong>{formatLKR(FREE_SHIPPING_THRESHOLD_LKR)}</strong>; below
              that it&rsquo;s a flat{" "}
              {formatLKR(SHIPPING.local.standard.rateLKR)}. Express delivery is
              charged at {formatLKR(SHIPPING.local.express.rateLKR)} regardless
              of order value.
            </p>
          </Section>

          <Section title="International delivery">
            <RateTable
              rows={[
                {
                  method: "Standard",
                  estimate: SHIPPING.international.standard.estimate,
                  price: formatLKR(SHIPPING.international.standard.rateLKR),
                },
                {
                  method: "Express",
                  estimate: SHIPPING.international.express.estimate,
                  price: formatLKR(SHIPPING.international.express.rateLKR),
                },
              ]}
            />
            <p>
              International orders are shipped from Sri Lanka. Any import duties
              or taxes charged by the destination country are the
              recipient&rsquo;s responsibility and are not collected at
              checkout. The free-shipping threshold applies to Sri Lankan
              orders only.
            </p>
          </Section>

          <Section title="Payment methods">
            <p>
              We accept Visa, Mastercard, American Express and PayPal. Card
              payments are processed securely by PayHere, our Sri Lankan payment
              gateway &mdash; we never see or store your card details.
            </p>
            <p>
              <strong>Cash on Delivery</strong> is available for orders
              delivered within {COD_COUNTRY} only. It is not offered on
              international orders, which must be paid by card or PayPal at
              checkout.
            </p>
          </Section>

          <Section title={`Returns — ${RETURN_WINDOW_DAYS} days`}>
            <p>
              If something isn&rsquo;t right, you have{" "}
              <strong>{RETURN_WINDOW_DAYS} days</strong> from the day your order
              arrives to start a return. To be accepted, items must be:
            </p>
            <ul>
              <li>Unworn, unwashed and free of marks, odours or damage</li>
              <li>In their original condition with all tags still attached</li>
              <li>Accompanied by proof of purchase (your order number)</li>
            </ul>
            <p>
              For hygiene reasons we cannot accept returns on perfume once the
              seal is broken.
            </p>
          </Section>

          <Section title="Exchanges">
            <p>
              Need a different size or colour? Start a return for the original
              item and place a new order for the one you want &mdash; that way
              your replacement is reserved immediately rather than waiting on
              the return to arrive, which matters on sizes that sell out.
            </p>
          </Section>

          <Section title="Faulty or incorrect items">
            <p>
              If your order arrives damaged, faulty or isn&rsquo;t what you
              ordered, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your
              order number and a photo. We&rsquo;ll sort it out at no cost to
              you &mdash; this is in addition to your statutory rights, not
              instead of them.
            </p>
          </Section>

          <Section title="How to start a return">
            <p>
              Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
              your order number and which items you&rsquo;d like to return, and
              we&rsquo;ll reply with instructions. You can find your order
              number in your confirmation email or in{" "}
              <Link href="/account">your account</Link>.
            </p>
            <p>
              Once we receive and inspect the return, your refund is issued to
              the original payment method. Card refunds typically take 5&ndash;10
              business days to appear, depending on your bank.
            </p>
          </Section>

          <Section title="Questions">
            <p>
              Anything not covered here, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
              we&rsquo;ll help. See also our{" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </Section>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2>{title}</h2>
      {children}
    </>
  );
}

function RateTable({
  rows,
}: {
  rows: { method: string; estimate: string; price: string; note?: string }[];
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#e5e4e6]">
            <Th>Method</Th>
            <Th>Estimated delivery</Th>
            <Th>Cost</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.method} className="border-b border-[#efeef0]">
              <td className="py-3 pr-4 font-medium text-[#0c0c0d]">
                {r.method}
              </td>
              <td className="py-3 pr-4 text-[#4a4a4e]">{r.estimate}</td>
              <td className="py-3 text-[#4a4a4e]">
                {r.price}
                {r.note && (
                  <span className="block text-[13px] text-[#8a8a8e]">
                    {r.note}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="py-2 pr-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a8a8e]">
      {children}
    </th>
  );
}
