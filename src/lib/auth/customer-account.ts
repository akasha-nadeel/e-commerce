import "server-only";

/**
 * Shopify Customer Account API — OAuth 2.0 (Authorization Code + PKCE) for a
 * public web-app client. Login is passwordless and hosted by Shopify; we redirect
 * out, receive a code on the callback, exchange it for tokens, and then query the
 * Customer Account GraphQL API for the signed-in customer's profile and orders.
 */

const SHOP_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
const API_VERSION =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION ?? "2025-10";

export const isCustomerAuthConfigured = Boolean(SHOP_ID && CLIENT_ID);
export const CLIENT_ID_VALUE = CLIENT_ID ?? "";

const AUTH_BASE = `https://shopify.com/authentication/${SHOP_ID}`;
export const AUTHORIZE_ENDPOINT = `${AUTH_BASE}/oauth/authorize`;
export const TOKEN_ENDPOINT = `${AUTH_BASE}/oauth/token`;
export const LOGOUT_ENDPOINT = `${AUTH_BASE}/logout`;
export const CUSTOMER_API_ENDPOINT = `https://shopify.com/${SHOP_ID}/account/customer/api/${API_VERSION}/graphql`;

// `customer-account-api:full` grants profile + orders; openid/email for identity.
export const SCOPES = "openid email customer-account-api:full";

export interface TokenSet {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  scope?: string;
}

/* ------------------------------- PKCE utils ------------------------------- */

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** URL-safe random token (used for code_verifier, state, nonce). */
export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64url(arr);
}

/** S256 code challenge for a PKCE verifier. */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

/* ----------------------------- Token exchange ----------------------------- */

/**
 * Public clients must send an `Origin` header matching a registered JavaScript
 * origin on token requests, so callers pass the current site origin through.
 */
export async function exchangeCodeForToken(opts: {
  code: string;
  verifier: string;
  redirectUri: string;
  origin: string;
}): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID_VALUE,
    redirect_uri: opts.redirectUri,
    code: opts.code,
    code_verifier: opts.verifier,
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: opts.origin,
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Token exchange ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function refreshAccessToken(opts: {
  refreshToken: string;
  origin: string;
}): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID_VALUE,
    refresh_token: opts.refreshToken,
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: opts.origin,
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Token refresh ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/* --------------------------- Customer Account API -------------------------- */

export async function customerFetch<T>(
  query: string,
  accessToken: string,
): Promise<T> {
  const res = await fetch(CUSTOMER_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Customer API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(
      `Customer API errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) throw new Error("Customer API returned no data.");
  return json.data;
}
