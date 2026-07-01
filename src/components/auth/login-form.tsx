"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AuthHeading,
  GoogleButton,
  FacebookButton,
  OrDivider,
  TextField,
  PasswordField,
  AuthCheckbox,
  AuthSubmit,
  AuthAltLink,
  AuthSuccess,
  MailIcon,
  LockKeyIcon,
} from "./auth-shell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 1) next.password = "Please enter your password.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <AuthSuccess
        title="You're signed in"
        body={`Welcome back. Live order tracking and returns for ${email} arrive with our Shopify customer accounts shortly.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading
        title="Log in to your Account"
        subtitle="Welcome back! Select method to log in:"
      />

      <div className="grid grid-cols-2 gap-3">
        <GoogleButton />
        <FacebookButton />
      </div>
      <OrDivider label="or continue with email" />

      <TextField
        id="login-email"
        label="Email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(v) => setEmail(v)}
        error={errors.email}
        autoComplete="email"
        required
        hideLabel
        icon={<MailIcon />}
      />
      <PasswordField
        id="login-password"
        label="Password"
        placeholder="Password"
        value={password}
        onChange={(v) => setPassword(v)}
        error={errors.password}
        autoComplete="current-password"
        required
        hideLabel
        icon={<LockKeyIcon />}
      />

      <div className="flex items-center justify-between">
        <AuthCheckbox
          id="login-remember"
          checked={remember}
          onChange={(v) => setRemember(v)}
        >
          Remember me
        </AuthCheckbox>
        <Link
          href="/login"
          className="shrink-0 text-[13px] font-medium text-[#eec449] no-underline hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <AuthSubmit>Log in</AuthSubmit>
      <AuthAltLink
        prompt="Don't have an account?"
        href="/signup"
        cta="Create an account"
      />
    </form>
  );
}
