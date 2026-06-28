import type { Metadata } from "next";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to your Golden Egal account to track orders and returns.",
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <div className="w-full bg-white">
      <section className="mx-auto max-w-[1400px] px-5 pb-8 pt-12 sm:px-8">
        <h1 className="display-tight m-0 text-[clamp(34px,5vw,64px)] font-semibold leading-[0.95]">
          Account
        </h1>
        <p className="mt-3 max-w-[520px] text-[15px] text-[#8a8a8e]">
          Sign in to track orders, manage returns and check out faster.
        </p>
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 pb-20 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="mb-4 text-[18px] font-semibold">Sign In</h2>
          <SignInForm />
        </div>

        <div className="flex flex-col gap-8">
          <HelpBlock
            id="track"
            title="Track Order"
            body="Order tracking links are emailed the moment your parcel ships. Once the Shopify backend is connected, live tracking appears right here."
          />
          <HelpBlock
            id="returns"
            title="Returns"
            body="Free &amp; easy 14-day returns, no questions asked. Start a return from your order history after signing in."
          />
          <HelpBlock
            id="size-guide"
            title="Size Guide"
            body="Our tees run true to size with a relaxed, oversized drop-shoulder fit. XS–XXL across the core range; size down for a closer fit."
          />
        </div>
      </section>
    </div>
  );
}

function HelpBlock({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 border-t border-[#e7e6e9] pt-6">
      <h3 className="mb-2 text-[16px] font-semibold uppercase tracking-[0.04em]">
        {title}
      </h3>
      <p className="m-0 max-w-[520px] text-[14px] leading-[1.7] text-[#6a6a6e]">
        {body}
      </p>
    </div>
  );
}
