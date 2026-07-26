import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminConfigured } from "@/lib/shopify/admin";

/**
 * Access control for the Studio (`/studio`) — the simplified product manager.
 *
 * This surface writes to the live Shopify store with the Admin token, so it is
 * the highest-value target in the app. Two rules follow from that:
 *
 *  1. **Every server action re-checks the session itself.** Server Actions are
 *     plain POST endpoints reachable without ever loading the page, so gating
 *     the UI gates nothing. Call `assertStudio()` as the first statement of
 *     any action that reads or writes store data.
 *  2. **No password set = the Studio does not exist.** `isStudioConfigured` is
 *     false without `STUDIO_PASSWORD`, and the routes 404 rather than opening
 *     unauthenticated. A missing env var must never fail open.
 *
 * The session cookie is `<expiry>.<hmac>` signed with the password itself, so
 * changing `STUDIO_PASSWORD` instantly invalidates every existing session —
 * that is the revocation mechanism.
 */

const PASSWORD = process.env.STUDIO_PASSWORD;

/** The Studio needs both a passphrase and a working Admin API connection. */
export const isStudioConfigured = Boolean(PASSWORD && isAdminConfigured);

const COOKIE_NAME = "ge_studio";
/** 12 hours — long enough for a working session, short enough to matter. */
const SESSION_SECONDS = 60 * 60 * 12;

function sign(payload: string): string {
  return createHmac("sha256", PASSWORD as string)
    .update(payload)
    .digest("hex");
}

/** Constant-time string compare that tolerates length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/* ------------------------------------------------------------------ */
/* Brute-force throttle                                                */
/* ------------------------------------------------------------------ */

// Per-instance counter. On serverless this resets when the instance recycles,
// so it slows a guessing attack rather than stopping one outright — the real
// protection is a long passphrase. Keep it anyway: it makes a naive script
// useless for very little code.
let failures = 0;
let lockedUntil = 0;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 60_000;

export function loginLockRemainingMs(): number {
  return Math.max(0, lockedUntil - Date.now());
}

/* ------------------------------------------------------------------ */
/* Session lifecycle                                                   */
/* ------------------------------------------------------------------ */

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Verify the passphrase and, on success, set the session cookie.
 * Must be called from a Server Action or Route Handler (it writes a cookie).
 */
export async function login(passphrase: string): Promise<LoginResult> {
  if (!isStudioConfigured) {
    return { ok: false, error: "The Studio is not configured on this server." };
  }

  const wait = loginLockRemainingMs();
  if (wait > 0) {
    return {
      ok: false,
      error: `Too many attempts. Try again in ${Math.ceil(wait / 1000)}s.`,
    };
  }

  if (!safeEqual(passphrase, PASSWORD as string)) {
    failures += 1;
    if (failures >= MAX_FAILURES) {
      lockedUntil = Date.now() + LOCKOUT_MS;
      failures = 0;
    }
    return { ok: false, error: "That passphrase isn't right." };
  }

  failures = 0;
  lockedUntil = 0;

  const expires = Date.now() + SESSION_SECONDS * 1000;
  const value = `${expires}.${sign(String(expires))}`;

  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });

  return { ok: true };
}

/** Clear the session cookie. Server Action / Route Handler only. */
export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** True when the request carries a valid, unexpired, correctly signed session. */
export async function hasStudioSession(): Promise<boolean> {
  if (!isStudioConfigured) return false;

  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const dot = raw.lastIndexOf(".");
  if (dot < 1) return false;

  const expires = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);

  // Signature first, then expiry — never trust the payload before verifying it.
  if (!safeEqual(mac, sign(expires))) return false;

  const ts = Number(expires);
  return Number.isFinite(ts) && ts > Date.now();
}

/**
 * Page/layout guard. Sends unauthenticated visitors to the login screen.
 * `redirect()` throws, so call this before rendering anything.
 */
export async function requireStudio(): Promise<void> {
  if (await hasStudioSession()) return;
  redirect("/studio/login");
}

/**
 * Server Action guard. Throws instead of redirecting so a forged POST gets an
 * error rather than a helpful 3xx. **First line of every Studio action.**
 */
export async function assertStudio(): Promise<void> {
  if (await hasStudioSession()) return;
  throw new Error("Unauthorized");
}
