import { NextResponse, type NextRequest } from "next/server";
import {
  AUTHORIZE_ENDPOINT,
  CLIENT_ID_VALUE,
  SCOPES,
  isCustomerAuthConfigured,
  pkceChallenge,
  randomToken,
} from "@/lib/auth/customer-account";

export async function GET(request: NextRequest) {
  if (!isCustomerAuthConfigured) {
    return NextResponse.json(
      { error: "Customer accounts are not configured." },
      { status: 500 },
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback`;
  const loginHint = request.nextUrl.searchParams.get("login_hint");

  const verifier = randomToken(32);
  const challenge = await pkceChallenge(verifier);
  const state = randomToken(16);
  const nonce = randomToken(16);

  const authUrl = new URL(AUTHORIZE_ENDPOINT);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("client_id", CLIENT_ID_VALUE);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("nonce", nonce);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  if (loginHint) authUrl.searchParams.set("login_hint", loginHint);

  const res = NextResponse.redirect(authUrl.toString());
  const opts = {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600, // 10 min to complete the handshake
  };
  res.cookies.set("pkce_verifier", verifier, opts);
  res.cookies.set("pkce_state", state, opts);
  res.cookies.set("pkce_nonce", nonce, opts);
  return res;
}
