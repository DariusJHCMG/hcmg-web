/**
 * GET /api/push/vapid-key — return the VAPID public key for Web Push registration.
 * Called by the browser before creating a PushSubscription.
 * Public endpoint — no auth required.
 */
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return NextResponse.json({ error: "Push not configured" }, { status: 503 });
  return NextResponse.json({ publicKey: key });
}
