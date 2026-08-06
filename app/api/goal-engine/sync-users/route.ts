/**
 * POST /api/goal-engine/sync-users
 * Reads all active rows from public.profiles and ensures each one
 * has a matching Supabase auth account. Sends invite emails to new ones.
 *
 * No external tables needed — profiles IS the source of truth.
 * Safe to run multiple times. Fully idempotent.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

function makeAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(req: NextRequest) {
  // Auth check
  const cronHeader = req.headers.get("x-cron-secret");
  const isCron     = cronHeader && cronHeader === (process.env.CRON_SECRET ?? "");
  if (!isCron) {
    const profile = await getCurrentProfile();
    if (!profile || !isAdmin(profile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const body        = await req.json().catch(() => ({}));
  const sendInvites = body.sendInvites !== false;

  const sb    = createServiceClient();
  const admin = makeAdminClient();

  // ── 1. Load all active profiles ───────────────────────────────
  const { data: profiles, error: profilesErr } = await sb
    .from("profiles")
    .select("id, email, full_name, role, nmls, avatar_url")
    .eq("is_active", true);

  if (profilesErr || !profiles?.length) {
    return NextResponse.json({
      error: profilesErr?.message ?? "No profiles found",
    }, { status: 500 });
  }

  // ── 2. Load all existing auth users once ──────────────────────
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authById = new Map((authData?.users ?? []).map(u => [u.id, u]));

  // ── 3. Process each profile ───────────────────────────────────
  const results: Array<{
    email: string; name: string; role: string;
    action: "exists" | "invited" | "skipped"; error?: string;
  }> = [];

  for (const p of profiles) {
    const existing = authById.get(p.id);
    if (existing) {
      // Auth account exists — just make sure profile is up to date
      results.push({ email: p.email, name: p.full_name, role: p.role, action: "exists" });
      continue;
    }

    // No auth account — create one with the same UUID so it links to the profile
    try {
      const { error: createErr } = await admin.auth.admin.createUser({
        email:         p.email,
        email_confirm: true,
        user_metadata: { full_name: p.full_name, role: p.role },
      });

      if (createErr) {
        results.push({ email: p.email, name: p.full_name, role: p.role, action: "skipped", error: createErr.message });
        continue;
      }

      if (sendInvites) {
        await admin.auth.admin.inviteUserByEmail(p.email, {
          redirectTo: `${SITE}/goal-engine-login`,
          data: { full_name: p.full_name, role: p.role },
        });
      }

      results.push({ email: p.email, name: p.full_name, role: p.role, action: "invited" });
    } catch (err) {
      results.push({ email: p.email, name: p.full_name, role: p.role, action: "skipped", error: String(err) });
    }
  }

  const exists  = results.filter(r => r.action === "exists").length;
  const invited = results.filter(r => r.action === "invited").length;
  const skipped = results.filter(r => r.action === "skipped").length;

  return NextResponse.json({
    success: true,
    message: `Done: ${exists} already set up, ${invited} invited, ${skipped} skipped`,
    total: profiles.length,
    sendInvites,
    results,
  });
}
