/**
 * POST /api/goal-engine/sync-users
 * Admin-only. Reads all active HCMG users from the Prisma "User" +
 * "TenantMembership" tables and syncs them into Supabase auth.users
 * + public.profiles.
 *
 * For each user:
 *   - If no Supabase auth user exists → creates one + sends password-reset
 *     email so they can set their own SLICE password.
 *   - If already exists → updates their profile row (name, role, nmls, avatar).
 *
 * Safe to run multiple times. Idempotent.
 *
 * Role mapping from TenantMembership.primaryWireRole:
 *   isTenantAdmin=true OR primaryWireRole in (clo,ceo,president,vp,branch_manager) → "admin"
 *   primaryWireRole = lo, loan_officer, or loNmls is present → "loan_officer"
 *   anything else → "loan_officer" (default — can be changed in /admin/users)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const HCMG_TENANT_ID = "cmrss19yi000fysf83wcom9th";

// Admin-role client — needed for auth.admin.createUser
function createAdminAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

type SliceRole = "admin" | "loan_officer";

function deriveRole(
  isTenantAdmin: boolean,
  primaryWireRole: string | null,
  loNmls: string | null,
): SliceRole {
  if (isTenantAdmin) return "admin";
  const r = (primaryWireRole ?? "").toLowerCase();
  if (["clo", "ceo", "president", "vp", "branch_manager", "manager"].includes(r)) return "admin";
  if (r === "lo" || r === "loan_officer" || loNmls) return "loan_officer";
  return "loan_officer"; // safe default
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { sendInvites = true } = await req.json().catch(() => ({}));

  const sb    = createServiceClient();   // for profiles table
  const admin = createAdminAuthClient(); // for auth.admin.*

  // ── 1. Fetch all active HCMG users from Prisma ─────────────
  const { data: memberships, error: membErr } = await sb
    .from("TenantMembership")
    .select(`
      userId,
      isTenantAdmin,
      primaryWireRole,
      loNmls,
      isActive
    `)
    .eq("tenantId", HCMG_TENANT_ID)
    .eq("isActive", true);

  if (membErr || !memberships) {
    return NextResponse.json({ error: membErr?.message ?? "Could not fetch memberships" }, { status: 500 });
  }

  // Get User details for each membership
  const userIds = memberships.map((m) => m.userId);
  const { data: users, error: usersErr } = await sb
    .from("User")
    .select("id, email, name, avatarUrl, isActive")
    .in("id", userIds)
    .eq("isActive", true);

  if (usersErr || !users) {
    return NextResponse.json({ error: usersErr?.message ?? "Could not fetch users" }, { status: 500 });
  }

  const results: Array<{
    email: string;
    name: string;
    role: SliceRole;
    action: "created" | "updated" | "skipped";
    error?: string;
  }> = [];

  for (const user of users) {
    const membership = memberships.find((m) => m.userId === user.id);
    if (!membership) continue;

    const role   = deriveRole(membership.isTenantAdmin, membership.primaryWireRole, membership.loNmls);
    const email  = user.email;
    const name   = user.name ?? email.split("@")[0];
    const nmls   = membership.loNmls ?? null;
    const avatar = user.avatarUrl ?? null;

    try {
      // ── Check if Supabase auth user already exists ──────────
      const { data: existingList } = await admin.auth.admin.listUsers();
      const existing = existingList?.users?.find((u) => u.email === email);

      let supabaseUid: string;

      if (!existing) {
        // ── Create new Supabase auth user ────────────────────
        const createResult = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name, role },
        });

        if (createResult.error || !createResult.data?.user) {
          results.push({ email, name, role, action: "skipped", error: createResult.error?.message });
          continue;
        }

        supabaseUid = createResult.data.user.id;

        // Send password reset (invite) email if requested
        if (sendInvites) {
          await admin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/goal-engine/dashboard` },
          });
          // Alternatively use inviteUserByEmail which sends the email automatically
          await admin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/goal-engine-login`,
            data: { full_name: name, role },
          });
        }

        results.push({ email, name, role, action: "created" });
      } else {
        supabaseUid = existing.id;
        results.push({ email, name, role, action: "updated" });
      }

      // ── Upsert profiles row ──────────────────────────────────
      await sb.from("profiles").upsert({
        id:           supabaseUid,
        email,
        full_name:    name,
        role,
        nmls,
        avatar_url:   avatar,
        is_active:    true,
        updated_at:   new Date().toISOString(),
      }, { onConflict: "id" });

    } catch (err) {
      results.push({ email, name, role, action: "skipped", error: String(err) });
    }
  }

  const created = results.filter((r) => r.action === "created").length;
  const updated = results.filter((r) => r.action === "updated").length;
  const skipped = results.filter((r) => r.action === "skipped").length;

  return NextResponse.json({
    success: true,
    message: `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`,
    sendInvites,
    results,
  });
}
