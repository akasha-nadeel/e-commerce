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
 * Passwordless sign-up: the same hosted Shopify flow that handles login also
 * creates a new account, so every method hands off to /api/auth/login.
 */
export function SignupForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  function startSignup(loginHint?: string) {
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
        startSignup(email);
      }}
      className="flex flex-col gap-4"
    >
      <AuthHeading
        title="Create your account"
        subtitle="Join Golden Egal — own the day."
      />

      <div className="grid grid-cols-2 gap-3">
        <GoogleButton onClick={() => startSignup()} />
        <FacebookButton onClick={() => startSignup()} />
      </div>
      <OrDivider label="or continue with email" />

      <TextField
        id="signup-email"
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
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => startSignup()}
          className="cursor-pointer font-semibold text-[#eec449] hover:underline"
        >
          Log in
        </button>
      </p>

      <p className="mt-1 text-center text-[12px] leading-relaxed text-[#8a8a8e]">
        Secure passwordless sign-up — Shopify emails you a one-time code.
      </p>
    </form>
  );
}
