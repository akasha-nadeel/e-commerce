import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely complete your Golden Egal order.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="w-full bg-white">
      <CheckoutClient />
    </div>
  );
}
