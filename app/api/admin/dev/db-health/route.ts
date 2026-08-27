/**
 * GET /api/admin/dev/db-health — run a lightweight connectivity check against the
 * Supabase database. Returns { ok: true } or error details.
 * Auth: none (used by uptime monitors). Safe — read-only, no user data exposed.
 */
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = createServiceClient();
    const { error } = await sb.from("profiles").select("id").limit(1);
    if (error) return NextResponse.json({ ok: false, error: error.message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
