import "server-only";

import { cookies } from "next/headers";
import type { TokenSet } from "./customer-account";

/**
 * Customer session stored in httpOnly cookies. Written from route handlers
 * (login callback / logout); read anywhere. No proactive refresh in the read
 * path — an expired token reads as logged-out (refresh is a future add).
 */

const AT = "cust_at"; // access token
const RT = "cust_rt"; // refresh token
const IT = "cust_it"; // id token (for logout)
const EXP = "cust_exp"; // access-token expiry (ms epoch)

const isProd = process.env.NODE_ENV === "production";
const base = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};
const WEEK = 60 * 60 * 24 * 7;

export async function setSession(tokens: TokenSet): Promise<void> {
  const c = await cookies();
  c.set(AT, tokens.access_token, { ...base, maxAge: tokens.expires_in });
  c.set(EXP, String(Date.now() + tokens.expires_in * 1000), {
    ...base,
    maxAge: WEEK,
  });
  if (tokens.refresh_token) {
    c.set(RT, tokens.refresh_token, { ...base, maxAge: WEEK });
  }
  if (tokens.id_token) {
    c.set(IT, tokens.id_token, { ...base, maxAge: WEEK });
  }
}

export async function clearSession(): Promise<void> {
  const c = await cookies();
  for (const name of [AT, RT, IT, EXP]) c.delete(name);
}

export interface Session {
  accessToken: string;
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const at = c.get(AT)?.value;
  const exp = Number(c.get(EXP)?.value ?? 0);
  if (!at) return null;
  if (exp && Date.now() > exp) return null;
  return { accessToken: at };
}

export async function getIdToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(IT)?.value ?? null;
}
