"use client";

import { useActionState } from "react";
import {
  AuthHeading,
  AuthShell,
  AuthSubmit,
  LockKeyIcon,
} from "@/components/auth/auth-shell";
import { studioLogin } from "@/lib/actions/studio";
import { PassphraseField } from "./ui";

/**
 * Studio sign-in.
 *
 * Reuses the storefront's own `AuthShell` — the same split-screen brand
 * treatment as `/login` and `/signup`. Two reasons: it is instantly consistent
 * with the site, and this screen is the first thing the store owner sees each
 * day, so it should look like his brand rather than a bare password prompt.
 *
 * One field, because the session is a single shared passphrase (see
 * `lib/studio/auth.ts`). The real check is server-side; this only collects.
 */
export function StudioLoginForm() {
  const [state, formAction, pending] = useActionState(studioLogin, {});

  return (
    <AuthShell>
      <form action={formAction}>
        <AuthHeading
          title="Studio"
          subtitle="Sign in to add and manage your products."
        />

        <PassphraseField
          name="passphrase"
          label="Passphrase"
          placeholder="Enter your passphrase"
          icon={<LockKeyIcon />}
          error={state?.error}
        />

        <div className="mt-5">
          <AuthSubmit>{pending ? "Checking…" : "Sign in"}</AuthSubmit>
        </div>

        <p className="mt-6 text-[13px] leading-relaxed text-[#8a8a8e]">
          Anything you add here goes onto the Golden Eagle website and into
          Shopify together — you never have to touch both.
        </p>
      </form>
    </AuthShell>
  );
}
