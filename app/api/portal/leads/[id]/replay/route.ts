import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

const PH_HOST       = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const PH_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
const PH_API_KEY    = process.env.POSTHOG_PERSONAL_API_KEY; // server-only

async function phFetch(path: string) {
  const res = await fetch(`${PH_HOST}${path}`, {
    headers: { Authorization: `Bearer ${PH_API_KEY}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth guard
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!PH_API_KEY || !PH_PROJECT_ID) {
    return NextResponse.json({ error: "PostHog not configured" }, { status: 503 });
  }

  const { id } = await params;
  const sb = createServiceClient();

  // Fetch the lead — verify ownership
  const { data: lead } = await sb
    .from("leads")
    .select("id, session_id, lo_slug")
    .eq("id", id)
    .single();

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin(caller) && lead.lo_slug !== caller.lo_slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!lead.session_id) {
    return NextResponse.json({ error: "No session ID for this lead" }, { status: 404 });
  }

  // ── 1. Find the PostHog recording by session_id ───────────────
  const listData = await phFetch(
    `/api/projects/${PH_PROJECT_ID}/session_recordings/?session_id=${encodeURIComponent(lead.session_id)}&limit=1`,
  );

  const recording = listData?.results?.[0];
  if (!recording) {
    return NextResponse.json({ error: "No recording found for this session" }, { status: 404 });
  }

  // ── 2. Fetch the snapshot events (rrweb events) ───────────────
  // PostHog paginates snapshots — fetch all blobs
  const snapshotData = await phFetch(
    `/api/projects/${PH_PROJECT_ID}/session_recordings/${recording.id}/snapshots/?blob_load_from_archive=true`,
  );

  // PostHog returns either blob_keys (S3) or snapshot_data_by_window_id
  // For US Cloud the snapshots come back as blob_keys pointing to presigned S3 URLs
  // We surface the recording metadata + the PostHog recording ID for the iframe embed
  return NextResponse.json({
    recordingId:  recording.id,
    sessionId:    lead.session_id,
    duration:     recording.recording_duration,      // seconds
    startTime:    recording.start_time,
    viewCount:    recording.view_count,
    clickCount:   recording.click_count,
    // Raw snapshot pages so the client-side Replayer can consume them
    snapshots:    snapshotData?.snapshot_data_by_window_id ?? null,
    blobKeys:     snapshotData?.blob_keys ?? null,
  });
}
