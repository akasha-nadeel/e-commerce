"use client";

import { useState } from "react";
import {
  AuthHeading,
  GoogleButton,
  FacebookButton,
  OrDivider,
  TextField,
  AuthSubmit,
  MailIcon,
} from "./auth-shell";

/**
 * Passwordless login: every method hands off to Shopify's hosted login via
 * /api/auth/login (OAuth). The email field is an optional login_hint to prefill
 * the address on Shopify's page.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  function startLogin(loginHint?: string) {
    setBusy(true);
    const hint = loginHint?.trim();
    window.location.href = hint
      ? `/api/auth/login?login_hint=${encodeURIComponent(hint)}`
      : "/api/auth/login";
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startLogin(email);
      }}
      className="flex flex-col gap-4"
    >
      <AuthHeading
        title="Log in to your Account"
        subtitle="Welcome back! Select method to log in:"
      />

      <div className="grid grid-cols-2 gap-3">
        <GoogleButton onClick={() => startLogin()} />
        <FacebookButton onClick={() => startLogin()} />
      </div>
      <OrDivider label="or continue with email" />

      <TextField
        id="login-email"
        label="Email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        hideLabel
        icon={<MailIcon />}
      />

      <AuthSubmit>{busy ? "Redirecting…" : "Continue"}</AuthSubmit>

      <p className="mt-1 text-center text-[14px] text-[#6a6a6e]">
        New here?{" "}
        <button
          type="button"
          onClick={() => startLogin()}
          className="cursor-pointer font-semibold text-[#eec449] hover:underline"
        >
          Create an account
        </button>
      </p>

      <p className="mt-1 text-center text-[12px] leading-relaxed text-[#8a8a8e]">
        Secure passwordless sign-in — Shopify emails you a one-time code.
      </p>
    </form>
  );
}
