import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";
import { deriveMinDwellSecs } from "@/lib/university/integrity";

// POST /api/university/lesson/session/heartbeat
//
// Handles ALL lesson types:
//   video/audio/presentation (native <video>)  → segment tracking + dwell
//   video with HeyGen iframe                   → dwell only (no position events)
//   text/assignment                            → dwell + scroll
//
// The CLIENT reports what happened. The SERVER decides what counts.
//
// Body: {
//   session_id:    string   — active session owned by this user
//   is_visible:    boolean  — page/tab visible (Visibility API)
//   is_focused:    boolean  — window has focus (ignored for iframe videos)
//   scroll_pct?    number   — highest scroll position reached (0-100)
//   // Native video fields (position-segment tracking):
//   position_secs? number   — current playback position
//   duration_secs? number   — total media duration (written back to lesson)
//   is_playing?    boolean  — video currently playing
//   playback_rate? number   — playback rate
//   seeked?        boolean  — seek occurred since last heartbeat
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
    // native video fields
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

  // Load session + lesson in one join
  const { data: session } = await sb
    .from("uni_lesson_sessions")
    .select(`
      id, profile_id, lesson_id, course_id,
      watch_segments, verified_secs, video_duration_secs,
      last_heartbeat_at, last_position_secs,
      hidden_heartbeat_count, seek_count,
      dwell_secs, scroll_pct,
      expires_at, ended_at,
      uni_lessons!lesson_id ( id, lesson_type, duration_secs, video_token )
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
    { id: string; lesson_type: string; duration_secs: number | null; video_token: string | null } | null;
  const lessonType   = lesson?.lesson_type ?? "video";
  const videoToken   = lesson?.video_token ?? "";
  // HeyGen iframes can't report real playback position — use dwell-only tracking
  const isIframeVideo = lessonType === "video" &&
    (videoToken.includes("heygen.com") || videoToken.includes("youtube.com") || videoToken.includes("vimeo.com") || videoToken.includes("loom.com"));

  const now        = new Date();
  const lastHB     = new Date(session.last_heartbeat_at);
  const wallSeconds = Math.min((now.getTime() - lastHB.getTime()) / 1000, HEARTBEAT_WINDOW_SECS);

  // For iframe videos: credit whenever tab is visible (iframe owns window focus).
  // For all others: require both visible AND focused.
  const activeInterval = isIframeVideo
    ? is_visible && wallSeconds > 0.5
    : is_visible && is_focused && wallSeconds > 0.5;

  const updates: Record<string, unknown> = {
    last_heartbeat_at:      now.toISOString(),
    hidden_heartbeat_count: (session.hidden_heartbeat_count ?? 0) + (!activeInterval ? 1 : 0),
  };

  // Always accumulate dwell_secs for every lesson type — this is the universal
  // fallback completion signal used when segment tracking isn't possible.
  const newDwellSecs = (session.dwell_secs ?? 0) + (activeInterval ? Math.floor(wallSeconds) : 0);
  updates.dwell_secs = newDwellSecs;

  let watchPct      = 0;
  let creditedSecs  = 0;
  let newVerifiedSecs = session.verified_secs ?? 0;

  // ── IFRAME VIDEO path: dwell-time only ──────────────────────────────────────
  if (isIframeVideo) {
    // Mirror the complete route's logic exactly so watch_pct reaches 100 at the
    // same moment the server will accept /complete.
    const lessonDuration = lesson?.duration_secs ?? 0;
    const completionThreshold = 80;
    const rawRequired = lessonDuration > 0
      ? Math.round(lessonDuration * (completionThreshold / 100))
      : 45;
    // Same cap as complete route: max 120s, min 30s
    const requiredDwell = Math.max(30, Math.min(rawRequired, 120));

    watchPct        = Math.min(100, Math.round((newDwellSecs / requiredDwell) * 100));
    newVerifiedSecs = newDwellSecs;
    creditedSecs    = activeInterval ? Math.floor(wallSeconds) : 0;

    updates.verified_secs = newVerifiedSecs;

  // ── NATIVE VIDEO / AUDIO / PRESENTATION path: position-segment tracking ─────
  } else if (lessonType === "video" || lessonType === "audio" || lessonType === "presentation") {
    const { position_secs = 0, duration_secs = 0, is_playing = false,
            playback_rate = 1.0, seeked = false } = body;

    const rate         = Math.max(MIN_PLAYBACK_RATE, Math.min(MAX_PLAYBACK_RATE, playback_rate));
    const shouldCredit = is_playing && activeInterval;

    let newSegments: Segment[] = (session.watch_segments as Segment[]) ?? [];

    if (shouldCredit && duration_secs > 0) {
      const prevPos           = session.last_position_secs ?? position_secs;
      const forward           = position_secs - prevPos;
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
      last_position_secs: Math.round(position_secs),
      last_playback_rate: rate,
      watch_segments:     newSegments,
      verified_secs:      newVerifiedSecs,
      seek_count:         (session.seek_count ?? 0) + (seeked ? 1 : 0),
    });

    // Auto-calibrate: write real duration back to the lesson the first time
    // a native player reports it — this self-corrects any hand-typed estimates.
    if (duration_secs > 0) {
      if (!session.video_duration_secs) {
        updates.video_duration_secs = Math.round(duration_secs);
      }
      if (!lesson?.duration_secs && lesson?.id) {
        // Fire-and-forget — write canonical duration back to the lesson row
        void sb.from("uni_lessons")
          .update({ duration_secs: Math.round(duration_secs) })
          .eq("id", lesson.id);
      }
    }

  // ── TEXT / ASSIGNMENT path: dwell + scroll ──────────────────────────────────
  } else {
    const newScrollPct = Math.max(session.scroll_pct ?? 0, Math.min(100, Math.round(body.scroll_pct ?? 0)));
    const minDwell     = deriveMinDwellSecs(lesson?.duration_secs ?? null);
    const dwellProgress = minDwell > 0 ? Math.min(100, Math.round((newDwellSecs / minDwell) * 100)) : 100;
    watchPct = Math.min(100, Math.round(dwellProgress * 0.7 + newScrollPct * 0.3));

    Object.assign(updates, {
      scroll_pct:    newScrollPct,
      verified_secs: newDwellSecs,
    });
    creditedSecs = activeInterval ? Math.floor(wallSeconds) : 0;
  }

  // Persist session updates
  await sb.from("uni_lesson_sessions").update(updates).eq("id", session_id);

  // Sync uni_progress.watch_pct
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
