import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

// Temporary debug route — admin only. Delete after diagnosing Session Replay.
export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller || !isAdmin(caller)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY
      ? `set (${process.env.POSTHOG_PERSONAL_API_KEY.slice(0, 6)}...)`
      : "MISSING",
    NEXT_PUBLIC_POSTHOG_PROJECT_ID: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID ?? "MISSING",
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "MISSING",
  });
}
