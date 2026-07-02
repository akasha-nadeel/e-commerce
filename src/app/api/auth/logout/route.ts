import { NextResponse, type NextRequest } from "next/server";
import {
  LOGOUT_ENDPOINT,
  isCustomerAuthConfigured,
} from "@/lib/auth/customer-account";
import { clearSession, getIdToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const idToken = await getIdToken();
  await clearSession();

  // Also end the session on Shopify's side so the next login is a fresh prompt.
  if (isCustomerAuthConfigured && idToken) {
    const url = new URL(LOGOUT_ENDPOINT);
    url.searchParams.set("id_token_hint", idToken);
    url.searchParams.set("post_logout_redirect_uri", `${origin}/`);
    return NextResponse.redirect(url.toString());
  }
  return NextResponse.redirect(new URL("/", origin));
}
