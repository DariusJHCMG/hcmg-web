import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";
import type { EventType } from "@/lib/database.types";

// POST /api/university/events
// Records an analytics event for the authenticated learner.
//
// Body: {
//   event_type: EventType
//   entity_type?: string
//   entity_id?: string
//   value?: number      — e.g. watch_pct for video_watched
//   metadata?: object
//   session_id?: string
// }
//
// Security:
//   - profile_id is always set from the server-verified session (never client-supplied).
//   - ip_address and user_agent are captured server-side.
//   - Writes are scoped to the authenticated user only.

const VALID_EVENT_TYPES: EventType[] = [
  "course_started", "course_completed", "course_abandoned",
  "lesson_started", "lesson_completed", "video_watched",
  "assessment_started", "assessment_submitted", "assessment_passed", "assessment_failed",
  "certificate_issued", "certificate_expired", "certificate_renewed",
  "path_started", "path_completed",
  "search_performed", "resource_downloaded", "content_bookmarked",
];

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    event_type: string;
    entity_type?: string;
    entity_id?: string;
    value?: number;
    metadata?: Record<string, unknown>;
    session_id?: string;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (!VALID_EVENT_TYPES.includes(body.event_type as EventType)) {
    return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
  }

  const sb = createServiceClient();

  const { error } = await sb.from("uni_events").insert({
    profile_id:  profile.id,
    event_type:  body.event_type,
    entity_type: body.entity_type ?? null,
    entity_id:   body.entity_id   ?? null,
    value:       body.value        ?? null,
    metadata:    body.metadata     ?? {},
    session_id:  body.session_id   ?? null,
    ip_address:  request.headers.get("x-forwarded-for") ?? null,
    user_agent:  request.headers.get("user-agent") ?? null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
