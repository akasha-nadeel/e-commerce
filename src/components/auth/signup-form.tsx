"use client";

import { useState } from "react";
import {
  AuthHeading,
  GoogleButton,
  OrDivider,
  TextField,
  PasswordField,
  AuthCheckbox,
  AuthSubmit,
  AuthAltLink,
  AuthSuccess,
} from "./auth-shell";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  agree?: string;
};

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!agree) next.agree = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <AuthSuccess
        title="Welcome to Golden Egal"
        body={`Your account for ${email} is ready. Full sign-in goes live with our Shopify customer accounts shortly.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <AuthHeading
        title="Create your account"
        subtitle="Join Golden Egal — be better everyday."
      />

      <GoogleButton label="Sign up with Google" />
      <OrDivider />

      <TextField
        id="signup-name"
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChange={(v) => setName(v)}
        error={errors.name}
        autoComplete="name"
        required
      />
      <TextField
        id="signup-email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(v) => setEmail(v)}
        error={errors.email}
        autoComplete="email"
        required
      />
      <PasswordField
        id="signup-password"
        label="Password"
        placeholder="Create a password"
        value={password}
        onChange={(v) => setPassword(v)}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <AuthCheckbox
        id="signup-agree"
        checked={agree}
        onChange={(v) => setAgree(v)}
        error={errors.agree}
      >
        I agree to all Terms, Privacy Policy and Fees
      </AuthCheckbox>

      <AuthSubmit>Sign Up</AuthSubmit>
      <AuthAltLink
        prompt="Already have an account?"
        href="/login"
        cta="Log in"
      />
    </form>
  );
}
