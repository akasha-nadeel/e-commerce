import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in to your Golden Eagle account to track orders, manage returns and check out faster.",
  alternates: { canonical: "/login" },
  // Account funnels carry no search value and dilute crawl budget.
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
