/**
 * GET /api/liftoff/test-mode-status — return whether LiftOff email test mode is
 * currently active. Used by the admin UI to show a warning banner.
 * Auth: admin role required.
 */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

// Admin-only – returns whether Liftoff email test mode is active.
// Hit this to confirm env vars are set correctly in Vercel before smoke testing.

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const testMode  = process.env.GOAL_ENGINE_TEST_MODE === "true";
  const testEmail = process.env.GOAL_ENGINE_TEST_EMAIL ?? "(not set)";

  return NextResponse.json({
    test_mode:   testMode,
    test_email:  testEmail,
    status:      testMode
      ? `✅ TEST MODE ON — all Liftoff emails redirected to ${testEmail}`
      : "❌ TEST MODE OFF — emails going to real recipients",
  });
}
