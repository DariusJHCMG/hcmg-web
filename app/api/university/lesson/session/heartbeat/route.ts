import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";
import { deriveMinDwellSecs } from "@/lib/university/integrity";

// POST /api/university/lesson/session/heartbeat
//
// Handles BOTH video lessons (position-segment tracking) and
// text/audio/assignment lessons (dwell-time tracking).
//
// The CLIENT reports what happened. The SERVER decides what counts.
//
// Body: {
//   session_id:    string   — active session owned by this user
//   // Video fields (video/audio/presentation):
//   position_secs? number   — current playback position
//   duration_secs? number   — total media duration
//   is_playing?    boolean  — video currently playing
//   playback_rate? number   — playback rate
//   seeked?        boolean  — seek occurred since last heartbeat
//   // Universal fields:
//   is_visible:    boolean  — page/tab visible (Visibility API)
//   is_focused:    boolean  — window has focus
//   scroll_pct?    number   — highest scroll position reached (0-100)
// }

const HEARTBEAT_WINDOW_SECS = 8;  // Max seconds any single heartbeat can credit
const MAX_PLAYBACK_RATE      = 2.0;
const MIN_PLAYBACK_RATE      = 0.5;

interface Segment { from: number; to: number }

function mergeSegment(segments: Segment[], newSeg: Segment): { segments: Segment[]; totalSecs: number } {
  const all = [...segments, newSeg].sort((a, b) => a.from - b.from);
  const merged: Segment[] = [];
  for (const seg of all) {
    if (!merged.length || seg.from > merged[merged.length - 1].to + 1) {
      merged.push({ ...seg });
    } else {
      merged[merged.length - 1].to = Math.max(merged[merged.length - 1].to, seg.to);
    }
  }
  return { segments: merged, totalSecs: merged.reduce((a, s) => a + (s.to - s.from), 0) };
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    session_id: string;
    is_visible: boolean;
    is_focused: boolean;
    scroll_pct?: number;
    // video-specific
    position_secs?: number;
    duration_secs?: number;
    is_playing?: boolean;
    playback_rate?: number;
    seeked?: boolean;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { session_id, is_visible, is_focused } = body;
  if (!session_id) return NextResponse.json({ error: "session_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Load session + lesson type in one join
  const { data: session } = await sb
    .from("uni_lesson_sessions")
    .select(`
      id, profile_id, lesson_id, course_id,
      watch_segments, verified_secs, video_duration_secs,
      last_heartbeat_at, last_position_secs,
      hidden_heartbeat_count, seek_count,
      dwell_secs, scroll_pct,
      expires_at, ended_at,
      uni_lessons!lesson_id ( lesson_type, duration_secs )
    `)
    .eq("id", session_id)
    .eq("profile_id", profile.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.ended_at || new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }

  const lessonRaw = session.uni_lessons;
  const lesson = (Array.isArray(lessonRaw) ? lessonRaw[0] : lessonRaw) as
    { lesson_type: string; duration_secs: number | null } | null;
  const lessonType = lesson?.lesson_type ?? "video";

  const now    = new Date();
  const lastHB = new Date(session.last_heartbeat_at);
  const wallSeconds = Math.min((now.getTime() - lastHB.getTime()) / 1000, HEARTBEAT_WINDOW_SECS);

  // Should we credit active time this interval?
  const activeInterval = is_visible && is_focused && wallSeconds > 0.5;

  const updates: Record<string, unknown> = {
    last_heartbeat_at:      now.toISOString(),
    hidden_heartbeat_count: (session.hidden_heartbeat_count ?? 0) + (!is_visible || !is_focused ? 1 : 0),
  };

  // ── VIDEO / AUDIO path: position-segment tracking ───────────────────────────
  let watchPct    = 0;
  let creditedSecs = 0;
  let newVerifiedSecs = session.verified_secs ?? 0;

  if (lessonType === "video" || lessonType === "audio" || lessonType === "presentation") {
    const { position_secs = 0, duration_secs = 0, is_playing = false,
            playback_rate = 1.0, seeked = false } = body;

    const rate = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, playback_rate));
    const shouldCredit = is_playing && activeInterval;

    let newSegments: Segment[] = (session.watch_segments as Segment[]) ?? [];

    if (shouldCredit && duration_secs > 0) {
      const prevPos = session.last_position_secs ?? position_secs;
      const forward = position_secs - prevPos;
      const maxAllowedAdvance = wallSeconds * rate * 1.5;
      if (forward > 0 && forward <= maxAllowedAdvance) {
        const from = Math.max(0, Math.floor(prevPos));
        const to   = Math.min(Math.ceil(duration_secs), Math.ceil(position_secs));
        if (to > from) {
          const merged = mergeSegment(newSegments, { from, to });
          newSegments     = merged.segments;
          newVerifiedSecs = merged.totalSecs;
          creditedSecs    = to - from;
        }
      }
    }

    const effectiveDuration = session.video_duration_secs ?? duration_secs;
    watchPct = effectiveDuration > 0
      ? Math.min(100, Math.round((newVerifiedSecs / effectiveDuration) * 100))
      : 0;

    Object.assign(updates, {
      last_position_secs:  Math.round(position_secs),
      last_playback_rate:  rate,
      watch_segments:      newSegments,
      verified_secs:       newVerifiedSecs,
      seek_count:          (session.seek_count ?? 0) + (seeked ? 1 : 0),
    });
    if (!session.video_duration_secs && duration_secs > 0) {
      updates.video_duration_secs = Math.round(duration_secs);
    }

  // ── TEXT / ASSIGNMENT / READING path: dwell-time tracking ──────────────────
  } else {
    // Credit wall-clock seconds only when tab is visible AND window is focused.
    // Scroll-dragging to the bottom without reading doesn't help — dwell time
    // accumulates independently and must meet the server-derived threshold.
    const newDwellSecs = (session.dwell_secs ?? 0) + (activeInterval ? Math.floor(wallSeconds) : 0);
    const newScrollPct = Math.max(session.scroll_pct ?? 0, Math.min(100, Math.round(body.scroll_pct ?? 0)));

    // watchPct for text = weighted blend: 70% dwell progress + 30% scroll progress
    // The lesson must have duration_secs set by the admin (or we use a 120s default)
    const minDwell = deriveMinDwellSecs(lesson?.duration_secs ?? null);
    const dwellProgress = minDwell > 0 ? Math.min(100, Math.round((newDwellSecs / minDwell) * 100)) : 100;
    watchPct = Math.min(100, Math.round(dwellProgress * 0.7 + newScrollPct * 0.3));

    Object.assign(updates, {
      dwell_secs: newDwellSecs,
      scroll_pct: newScrollPct,
      verified_secs: newDwellSecs, // unified field for completion check
    });
    creditedSecs = activeInterval ? Math.floor(wallSeconds) : 0;
  }

  // Persist session updates
  await sb.from("uni_lesson_sessions").update(updates).eq("id", session_id);

  // Sync uni_progress.watch_pct (never completed here)
  await sb.from("uni_progress").upsert(
    {
      profile_id:      profile.id,
      lesson_id:       session.lesson_id,
      course_id:       session.course_id,
      watch_pct:       watchPct,
      completed:       false,
      last_watched_at: now.toISOString(),
    },
    { onConflict: "profile_id,lesson_id" },
  );

  // Periodic analytics event
  if (creditedSecs > 0 && newVerifiedSecs > 0 && newVerifiedSecs % 30 < HEARTBEAT_WINDOW_SECS) {
    await sb.from("uni_events").insert({
      profile_id:  profile.id,
      event_type:  "video_watched",
      entity_type: "lesson",
      entity_id:   session.lesson_id,
      value:       watchPct,
      metadata:    { course_id: session.course_id, session_id, verified_secs: newVerifiedSecs, watch_pct: watchPct },
      session_id,
    });
  }

  return NextResponse.json({ ok: true, watch_pct: watchPct, verified_secs: newVerifiedSecs });
}

