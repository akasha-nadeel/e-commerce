import type { Metadata } from "next";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Golden Eagle collects, uses and protects your personal information when you shop with us.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "1 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[820px] px-5 pt-5 sm:px-8">
        <BackButton fallbackHref="/" />
      </div>

      <section className="mx-auto max-w-[820px] px-5 pb-8 pt-6 sm:px-8">
        <h1 className="display-tight m-0 text-[clamp(34px,5vw,56px)] font-semibold leading-[0.95]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-[14px] text-[#8a8a8e]">
          Last updated: {UPDATED}
        </p>
      </section>

      <section className="mx-auto max-w-[820px] px-5 pb-24 sm:px-8">
        <div className="rich-text text-[15px] leading-[1.75] text-[#4a4a4e]">
          <p>
            This Privacy Policy explains how <strong>Golden Eagle</strong>
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects,
            uses and protects your personal information when you visit or make a
            purchase from our store. By using our website you agree to the
            practices described here.
          </p>

          <Section title="Information we collect">
            <p>When you shop with us we may collect:</p>
            <ul>
              <li>
                <strong>Order &amp; contact details</strong> — name, email
                address, phone number, and shipping/billing address.
              </li>
              <li>
                <strong>Payment information</strong> — processed securely by our
                payment provider (PayHere). We do not store your full card
                details on our servers.
              </li>
              <li>
                <strong>Account information</strong> — if you sign in, your name,
                email and order history, managed through Shopify Customer
                Accounts.
              </li>
              <li>
                <strong>Usage data</strong> — pages viewed, device and browser
                information, collected via cookies to help the site work and
                improve.
              </li>
            </ul>
          </Section>

          <Section title="How we use your information">
            <ul>
              <li>To process, fulfil and deliver your orders.</li>
              <li>
                To communicate with you about your order, returns and support
                requests.
              </li>
              <li>
                To send marketing updates when you opt in — you can unsubscribe
                at any time.
              </li>
              <li>
                To prevent fraud and keep our store and your account secure.
              </li>
              <li>To improve our products, website and customer experience.</li>
            </ul>
          </Section>

          <Section title="Payments">
            <p>
              Payments are handled by <strong>PayHere</strong> and other
              Sri-Lanka-approved gateways. Your payment is encrypted and
              processed by the provider; we only receive confirmation of the
              transaction, not your card number.
            </p>
          </Section>

          <Section title="Sharing your information">
            <p>
              We only share what is necessary to run the store — for example
              with our payment gateway, delivery partners and the platforms that
              power our checkout and accounts (Shopify). We never sell your
              personal information.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use cookies to keep items in your cart, remember your session,
              and understand how the site is used. You can control cookies
              through your browser settings, though some features may not work
              without them.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You may request access to, correction of, or deletion of your
              personal information at any time. To make a request, contact us
              using the details below.
            </p>
          </Section>

          <Section title="Data retention &amp; security">
            <p>
              We keep your information only as long as needed to fulfil orders
              and meet legal obligations, and we use reasonable safeguards to
              protect it. No method of transmission over the internet is fully
              secure, but we work to keep your data safe.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy or your data? Email us at{" "}
              <a href="mailto:hello@goldeneagleclothing.com">hello@goldeneagleclothing.com</a>. We
              may update this policy from time to time; the latest version will
              always be posted on this page.
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
      <h2 className="mt-10 text-[20px] font-semibold text-[#0c0c0d]">{title}</h2>
      {children}
    </>
  );
}
