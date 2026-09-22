import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// POST /api/university/lesson/session/heartbeat
//
// Called every 5 seconds by the client while the video is playing.
// The server merges the reported playback position into verified watch segments,
// calculates verified_secs, and updates uni_progress.watch_pct.
//
// The CLIENT reports what happened. The SERVER decides what counts.
//
// Body: {
//   session_id:       string   — must match an active session owned by this user
//   position_secs:    number   — current video playback position (seconds)
//   duration_secs:    number   — total video duration (seconds)
//   is_playing:       boolean  — is the video element currently playing?
//   is_visible:       boolean  — is the page/tab visible?
//   is_focused:       boolean  — does the window have focus?
//   playback_rate:    number   — current playback rate (1.0 = normal)
//   seeked:           boolean  — did a seek event occur since last heartbeat?
// }

const HEARTBEAT_WINDOW_SECS = 8;   // Max seconds a single heartbeat can credit
const MAX_PLAYBACK_RATE      = 2.0; // Anything faster is rejected
const MIN_PLAYBACK_RATE      = 0.5;

interface Segment { from: number; to: number }

// Merge a new segment into the existing list, collapsing overlaps.
// Returns the merged list and the total unique seconds.
function mergeSegment(
  segments: Segment[],
  newSeg: Segment,
): { segments: Segment[]; totalSecs: number } {
  const all = [...segments, newSeg].sort((a, b) => a.from - b.from);
  const merged: Segment[] = [];

  for (const seg of all) {
    if (merged.length === 0 || seg.from > merged[merged.length - 1].to + 1) {
      merged.push({ ...seg });
    } else {
      merged[merged.length - 1].to = Math.max(merged[merged.length - 1].to, seg.to);
    }
  }

  const totalSecs = merged.reduce((acc, s) => acc + (s.to - s.from), 0);
  return { segments: merged, totalSecs };
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    session_id: string;
    position_secs: number;
    duration_secs: number;
    is_playing: boolean;
    is_visible: boolean;
    is_focused: boolean;
    playback_rate: number;
    seeked: boolean;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const {
    session_id, position_secs, duration_secs,
    is_playing, is_visible, is_focused,
    playback_rate, seeked,
  } = body;

  if (!session_id || position_secs == null || duration_secs == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Load the session — must belong to this user and be active (not expired/ended)
  const { data: session } = await sb
    .from("uni_lesson_sessions")
    .select("id, profile_id, lesson_id, course_id, watch_segments, verified_secs, video_duration_secs, last_heartbeat_at, last_position_secs, hidden_heartbeat_count, seek_count, expires_at, ended_at")
    .eq("id", session_id)
    .eq("profile_id", profile.id) // Ownership — cannot heartbeat on another user's session
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.ended_at || new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  // ── Server-side validation ────────────────────────────────────────────────

  // 1. Reject abnormal playback rates
  const rate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, playback_rate ?? 1.0));

  // 2. Only credit watch time when: playing AND visible AND focused
  //    Hidden tab? Window blurred? No credit.
  const shouldCredit = is_playing && is_visible && is_focused;

  // 3. Calculate how many seconds to credit for this interval
  //    Based on time since last heartbeat, capped to HEARTBEAT_WINDOW_SECS
  const now = new Date();
  const lastHB = new Date(session.last_heartbeat_at);
  const wallSeconds = Math.min(
    (now.getTime() - lastHB.getTime()) / 1000,
    HEARTBEAT_WINDOW_SECS,
  );

  // 4. Build segment from previous position to current position
  //    If the learner seeked forward, we only credit the small window
  //    around the current position — not the skipped content.
  let creditedSecs = 0;
  let newSegments: Segment[] = (session.watch_segments as Segment[]) ?? [];
  let newVerifiedSecs = session.verified_secs ?? 0;

  if (shouldCredit && wallSeconds > 0.5 && duration_secs > 0) {
    const prevPos = session.last_position_secs ?? position_secs;
    const forward = position_secs - prevPos;

    // If the position advanced more than 2x what wall-clock time allows at
    // the stated playback rate → the client seeked forward. Don't credit the gap.
    const maxAllowedAdvance = wallSeconds * rate * 1.5; // 50% tolerance
    const legitAdvance = forward > 0 && forward <= maxAllowedAdvance;

    if (legitAdvance) {
      // Credit the segment from prevPos to current position (server-computed)
      const from = Math.max(0, Math.floor(prevPos));
      const to   = Math.min(Math.ceil(duration_secs), Math.ceil(position_secs));
      if (to > from) {
        const merged = mergeSegment(newSegments, { from, to });
        newSegments   = merged.segments;
        newVerifiedSecs = merged.totalSecs;
        creditedSecs  = to - from;
      }
    }
    // If seeked forward: segments are NOT extended, but position is updated
  }

  // 5. Calculate watch_pct from verified_secs / video_duration_secs
  const effectiveDuration = session.video_duration_secs ?? duration_secs;
  const watchPct = effectiveDuration > 0
    ? Math.min(100, Math.round((newVerifiedSecs / effectiveDuration) * 100))
    : 0;

  // 6. Update session
  const updates: Record<string, unknown> = {
    last_heartbeat_at:   now.toISOString(),
    last_position_secs:  Math.round(position_secs),
    last_playback_rate:  rate,
    watch_segments:      newSegments,
    verified_secs:       newVerifiedSecs,
    seek_count:          (session.seek_count ?? 0) + (seeked ? 1 : 0),
    hidden_heartbeat_count: (session.hidden_heartbeat_count ?? 0) + (!is_visible || !is_focused ? 1 : 0),
  };
  // Store duration on first heartbeat that provides it
  if (!session.video_duration_secs && duration_secs > 0) {
    updates.video_duration_secs = Math.round(duration_secs);
  }

  await sb
    .from("uni_lesson_sessions")
    .update(updates)
    .eq("id", session_id);

  // 7. Sync to uni_progress (never mark completed here — that's session/complete)
  await sb
    .from("uni_progress")
    .upsert(
      {
        profile_id:      profile.id,
        lesson_id:       session.lesson_id,
        course_id:       session.course_id,
        watch_pct:       watchPct,
        completed:       false, // completion only via /session/complete
        last_watched_at: now.toISOString(),
      },
      { onConflict: "profile_id,lesson_id" },
    );

  // 8. Periodic event (every 10 credits or at milestones)
  if (creditedSecs > 0 && newVerifiedSecs % 30 < 5) {
    await sb.from("uni_events").insert({
      profile_id:  profile.id,
      event_type:  "video_watched",
      entity_type: "lesson",
      entity_id:   session.lesson_id,
      value:       watchPct,
      metadata:    {
        course_id:     session.course_id,
        session_id,
        verified_secs: newVerifiedSecs,
        watch_pct:     watchPct,
      },
      session_id,
    });
  }

  return NextResponse.json({
    ok:             true,
    watch_pct:      watchPct,
    verified_secs:  newVerifiedSecs,
    credited_secs:  creditedSecs,
  });
}
