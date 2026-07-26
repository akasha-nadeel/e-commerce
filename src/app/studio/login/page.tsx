import { redirect } from "next/navigation";
import { StudioLoginForm } from "@/components/studio/login-form";
import { hasStudioSession } from "@/lib/studio/auth";

/**
 * Never prerender this. Without `STUDIO_PASSWORD` at *build* time the layout
 * 404s, and that 404 would be baked in as static HTML — leaving the Studio
 * permanently unreachable in production until someone rebuilt, even after the
 * env var was added. Forcing dynamic makes the route depend on runtime env,
 * which is what a deploy-time secret actually is.
 */
export const dynamic = "force-dynamic";

export default async function StudioLoginPage() {
  // Already signed in — don't make them type it again.
  if (await hasStudioSession()) redirect("/studio");

  // AuthShell owns the whole viewport (the Studio layout drops its chrome while
  // signed out), so there is no wrapper here by design.
  return <StudioLoginForm />;
}
