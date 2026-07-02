import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeCodeForToken,
  isCustomerAuthConfigured,
} from "@/lib/auth/customer-account";
import { setSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  if (!isCustomerAuthConfigured) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");

  const c = await cookies();
  const cookieState = c.get("pkce_state")?.value;
  const verifier = c.get("pkce_verifier")?.value;

  const clearHandshake = () => {
    c.delete("pkce_verifier");
    c.delete("pkce_state");
    c.delete("pkce_nonce");
  };

  if (!code || !state || !verifier || state !== cookieState) {
    clearHandshake();
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  try {
    const tokens = await exchangeCodeForToken({
      code,
      verifier,
      redirectUri: `${origin}/api/auth/callback`,
      origin,
    });
    await setSession(tokens);
  } catch {
    clearHandshake();
    return NextResponse.redirect(new URL("/login?error=token", origin));
  }

  clearHandshake();
  return NextResponse.redirect(new URL("/account", origin));
}
