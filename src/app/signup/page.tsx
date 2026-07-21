import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Golden Eagle account — own the day with premium tees and athleisure.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true },
};

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
