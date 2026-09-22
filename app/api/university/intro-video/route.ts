import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// GET /api/university/intro-video
//
// Returns:
//   { has_completed: boolean, video_url: string | null }
//
// has_completed = true  → don't show the modal
// has_completed = false → show the modal (user hasn't finished the intro)
// video_url = null      → no intro video configured yet; don't show modal

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  // Load the intro video path from settings
  const { data: setting } = await sb
    .from("uni_settings")
    .select("value")
    .eq("key", "intro_video_path")
    .maybeSingle();

  const videoPath = setting?.value ?? null;

  // No intro configured — skip the modal
  if (!videoPath) {
    return NextResponse.json({ has_completed: true, video_url: null });
  }

  // Check if this user has already completed the intro
  const { data: view } = await sb
    .from("uni_intro_video_views")
    .select("completed")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (view?.completed) {
    return NextResponse.json({ has_completed: true, video_url: null });
  }

  // Generate a signed URL for the video (1-hour expiry)
  let videoUrl: string;
  if (videoPath.startsWith("http")) {
    videoUrl = videoPath;
  } else {
    const { data: signed, error } = await sb.storage
      .from("uni-media")
      .createSignedUrl(videoPath, 60 * 60);

    if (error || !signed?.signedUrl) {
      // Storage error — don't block the user, just skip the modal
      return NextResponse.json({ has_completed: true, video_url: null });
    }
    videoUrl = signed.signedUrl;
  }

  return NextResponse.json({ has_completed: false, video_url: videoUrl });
}
