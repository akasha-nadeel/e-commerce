import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  customerFetch,
  isCustomerAuthConfigured,
} from "@/lib/auth/customer-account";
import { getSession } from "@/lib/auth/session";
import { formatLKR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Golden Eagle account — orders and profile.",
  robots: { index: false },
};

const CUSTOMER_QUERY = /* GraphQL */ `
  query CustomerAccount {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice { amount currencyCode }
          }
        }
      }
    }
  }
`;

interface CustomerData {
  customer: {
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      edges: {
        node: {
          id: string;
          name: string;
          processedAt: string;
          totalPrice: { amount: string; currencyCode: string };
        };
      }[];
    };
  };
}

export default async function AccountPage() {
  if (!isCustomerAuthConfigured) redirect("/login");

  const session = await getSession();
  if (!session) redirect("/login");

  let customer: CustomerData["customer"] | null = null;
  try {
    const data = await customerFetch<CustomerData>(
      CUSTOMER_QUERY,
      session.accessToken,
    );
    customer = data.customer;
  } catch {
    customer = null;
  }
  if (!customer) redirect("/login?error=session");

  const name =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "there";
  const email = customer.emailAddress?.emailAddress ?? "";
  const orders = customer.orders.edges.map((e) => e.node);

  return (
    <div className="w-full bg-canvas">
      <section className="mx-auto max-w-[1000px] px-5 pb-6 pt-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display-tight m-0 text-[clamp(32px,5vw,56px)] font-semibold leading-[0.95]">
              Hi, {name}
            </h1>
            {email && <p className="mt-3 text-[15px] text-muted">{email}</p>}
          </div>
          <a
            href="/api/auth/logout"
            className="rounded-none border border-fg px-6 py-3 text-[13px] font-semibold text-fg no-underline transition-colors hover:bg-fg hover:text-canvas"
          >
            Log out
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-5 pb-24 sm:px-8">
        <h2 className="mb-5 text-[18px] font-semibold uppercase tracking-[0.08em]">
          Order history
        </h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-4 border border-line px-6 py-10">
            <p className="m-0 text-[15px] text-fg-3">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/collections/all"
              className="rounded-none bg-fg px-8 py-3.5 text-[13px] font-semibold text-canvas no-underline transition-colors hover:bg-[#eec449] hover:text-ink"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line-soft border-y border-line">
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 py-4"
              >
                <div>
                  <div className="text-[15px] font-semibold text-fg">
                    {o.name}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">
                    {new Date(o.processedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-[15px] font-medium text-fg">
                  {formatLKR(Math.round(parseFloat(o.totalPrice.amount)))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
