import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// POST /api/university/intro-video/complete
//
// Marks the current user as having completed the intro video.
// Body: { watch_pct: number }  — client-reported; server records but doesn't trust for completion.
// Completion is always granted here (the modal already enforces the 80% UI gate client-side).

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  await sb
    .from("uni_intro_video_views")
    .upsert(
      {
        profile_id:   profile.id,
        completed:    true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" },
    );

  return NextResponse.json({ ok: true });
}
