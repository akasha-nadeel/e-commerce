import type { Metadata } from "next";
import { Fragment } from "react";
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

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
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

      {/* Backorders dashboard */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8">
        <div className="border-t border-[#e7e6e9] pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[18px] font-semibold uppercase tracking-[0.04em]">
              Your Backorders
            </h2>
            <span className="text-[13px] text-[#8a8a8e]">
              {SAMPLE_BACKORDERS.length} pending
            </span>
          </div>
          <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.6] text-[#8a8a8e]">
            Backordered items are fulfilled first-come, first-served. Your place in
            the queue updates automatically as stock arrives.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {SAMPLE_BACKORDERS.map((b) => (
              <BackorderRow key={`${b.name}-${b.variant}`} {...b} />
            ))}
          </div>
          <p className="mt-4 text-[12px] text-[#a3a3a8]">
            Sample data — live backorder tracking appears here once the Shopify
            backend is connected.
          </p>
        </div>
      </section>
    </div>
  );
}

const STATUS_STEPS = ["Queued", "Allocated", "Shipping"] as const;
type BackorderStatus = (typeof STATUS_STEPS)[number];

const SAMPLE_BACKORDERS: {
  name: string;
  variant: string;
  position: number;
  status: BackorderStatus;
  placed: string;
}[] = [
  {
    name: "Heavyweight Crew Tee",
    variant: "Bone · M",
    position: 3,
    status: "Queued",
    placed: "Jun 22, 2026",
  },
  {
    name: "Essential Oversized Tee",
    variant: "Jet Black · XS",
    position: 1,
    status: "Allocated",
    placed: "Jun 18, 2026",
  },
];

function BackorderRow({
  name,
  variant,
  position,
  status,
  placed,
}: {
  name: string;
  variant: string;
  position: number;
  status: BackorderStatus;
  placed: string;
}) {
  const activeIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="border border-[#e7e6e9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold">{name}</div>
          <div className="mt-0.5 text-[13px] text-[#8a8a8e]">
            {variant} · Placed {placed}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="bg-[#eec449]/15 px-2 py-1 text-[12px] font-bold text-[#9a7322]">
            #{position} in queue
          </span>
          <StatusPill status={status} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {STATUS_STEPS.map((step, i) => (
          <Fragment key={step}>
            <span className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 ${i <= activeIdx ? "bg-[#0c0c0d]" : "bg-[#d7d6d9]"}`}
              />
              <span
                className={`text-[11px] ${
                  i <= activeIdx ? "font-semibold text-[#0c0c0d]" : "text-[#a3a3a8]"
                }`}
              >
                {step}
              </span>
            </span>
            {i < STATUS_STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${i < activeIdx ? "bg-[#0c0c0d]" : "bg-[#e2e1e4]"}`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: BackorderStatus }) {
  const styles: Record<BackorderStatus, string> = {
    Queued: "bg-[#f1f1f3] text-[#6a6a6e]",
    Allocated: "bg-[#eec449]/20 text-[#9a7322]",
    Shipping: "bg-[#0c0c0d] text-white",
  };
  return (
    <span
      className={`px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${styles[status]}`}
    >
      {status}
    </span>
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
