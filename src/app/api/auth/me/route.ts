import { getIdToken, getSession } from "@/lib/auth/session";

/**
 * Minimal auth state for client UI (the header). Reads the session cookie and
 * pulls the first name from the id_token claims — no Customer Account API call.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ loggedIn: false });

  let firstName: string | undefined;
  const idToken = await getIdToken();
  if (idToken) {
    try {
      const [, payload] = idToken.split(".");
      const claims = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      ) as { given_name?: string; name?: string };
      firstName =
        claims.given_name ||
        (typeof claims.name === "string"
          ? claims.name.split(" ")[0]
          : undefined) ||
        undefined;
    } catch {
      // ignore malformed token; still logged in
    }
  }
  return Response.json({ loggedIn: true, firstName });
}
