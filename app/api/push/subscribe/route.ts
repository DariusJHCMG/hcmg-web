/**
 * POST /api/push/subscribe — save or remove a Web Push subscription.
 * Body: { subscription: PushSubscription } to subscribe, or { unsubscribe: true }.
 * Subscriptions are stored in the push_subscriptions table keyed by profile ID.
 * Auth: authenticated user required.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { endpoint, keys } = body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "endpoint, keys.p256dh and keys.auth are required" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const sb = createServiceClient();

  // Upsert — same endpoint may re-register after browser restart
  const { error } = await sb.from("push_subscriptions").upsert({
    profile_id:   profile.id,
    endpoint,
    p256dh:       keys.p256dh,
    auth:         keys.auth,
    user_agent:   userAgent,
    last_used_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { endpoint?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  const sb = createServiceClient();
  await sb
    .from("push_subscriptions")
    .delete()
    .eq("profile_id", profile.id)
    .eq("endpoint", body.endpoint);

  return NextResponse.json({ ok: true });
}
