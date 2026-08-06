/**
 * POST /api/goal-engine/sync-users
 * Syncs all active HCMG team members into Supabase auth.users + public.profiles.
 *
 * Auth: accepts either
 *   - A valid SLICE session (admin role), OR
 *   - x-cron-secret header matching CRON_SECRET env var (for bootstrap/automation)
 *
 * For each user:
 *   - No Supabase auth account → creates one + sends invite email
 *   - Already exists           → updates profile row (name, role, avatar)
 *
 * Safe to run multiple times. Fully idempotent.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const HCMG_TENANT_ID = process.env.HCMG_TENANT_ID ?? "cmrss19yi000fysf83wcom9th";
const SITE           = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
const CRON_SECRET    = process.env.CRON_SECRET ?? "";

function makeAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

type SliceRole = "admin" | "loan_officer";

function deriveRole(isTenantAdmin: boolean, primaryWireRole: string | null, loNmls: string | null): SliceRole {
  if (isTenantAdmin) return "admin";
  const r = (primaryWireRole ?? "").toLowerCase();
  if (["clo", "ceo", "president", "vp", "branch_manager", "manager", "ops_manager"].includes(r)) return "admin";
  return "loan_officer";
}

export async function POST(req: NextRequest) {
  // ── Auth: admin session OR cron secret ───────────────────────
  const cronHeader = req.headers.get("x-cron-secret");
  const isCronCall = CRON_SECRET && cronHeader === CRON_SECRET;

  if (!isCronCall) {
    const profile = await getCurrentProfile();
    if (!profile || !isAdmin(profile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const body = await req.json().catch(() => ({}));
  const sendInvites: boolean = body.sendInvites !== false; // default true

  const sb    = createServiceClient();
  const admin = makeAdminClient();

  // ── 1. Load all existing Supabase auth users once ─────────────
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existingAuthUsers  = authData?.users ?? [];
  const authByEmail        = new Map<string | undefined, Record<string, unknown>>(
    existingAuthUsers.map(u => [u.email?.toLowerCase(), u as unknown as Record<string, unknown>])
  );

  // ── 2. Fetch HCMG team members via RPC helper function ────────
  // PostgREST can't query Prisma's PascalCase tables directly via
  // .from() due to schema cache issues. We use a SQL function instead.
  // Run supabase/migrations/20250603_sync_helper.sql first.
  const { data: rows, error: rowsErr } = await sb
    .rpc("get_hcmg_team_members", { tenant_id_param: HCMG_TENANT_ID });

  if (rowsErr || !rows || rows.length === 0) {
    // RPC not available yet — fall back to direct table queries
    return syncFallback(sb, admin, authByEmail, sendInvites);
  }

  // ── 3. Process each member ────────────────────────────────────
  type RpcRow = { user_id: string; email: string; name: string; avatar_url: string | null; is_tenant_admin: boolean; primary_wire_role: string | null; lo_nmls: string | null };
  const results = await processUsers(
    (rows as RpcRow[]).map(r => ({
      id:              r.user_id,
      email:           (r.email ?? "").toLowerCase(),
      name:            r.name ?? "",
      avatarUrl:       r.avatar_url ?? null,
      isTenantAdmin:   Boolean(r.is_tenant_admin),
      primaryWireRole: r.primary_wire_role ?? null,
      loNmls:          r.lo_nmls ?? null,
    })).filter(u => u.email && u.id),
    sb, admin, authByEmail, sendInvites,
  );

  return buildResponse(results, sendInvites);
}

// ── Fallback: two separate queries if join fails ──────────────
async function syncFallback(
  sb: ReturnType<typeof createServiceClient>,
  admin: ReturnType<typeof makeAdminClient>,
  authByEmail: Map<string | undefined, Record<string, unknown>>,
  sendInvites: boolean,
) {
  const HCMG_TENANT_ID_LOCAL = process.env.HCMG_TENANT_ID ?? "cmrss19yi000fysf83wcom9th";

  const { data: memberships, error: membErr } = await sb
    .from("TenantMembership")
    .select("userId, isTenantAdmin, primaryWireRole, loNmls")
    .eq("tenantId", HCMG_TENANT_ID_LOCAL)
    .eq("isActive", true);

  if (membErr || !memberships?.length) {
    return NextResponse.json({
      error: membErr?.message ?? "No team members found. Check TenantMembership table access.",
      hint: "Ensure the hcmg-web Supabase service role can read TenantMembership and User tables.",
    }, { status: 500 });
  }

  const userIds = memberships.map((m: Record<string, string>) => m.userId);
  const { data: users, error: usersErr } = await sb
    .from("User")
    .select("id, email, name, avatarUrl")
    .in("id", userIds);

  if (usersErr || !users?.length) {
    return NextResponse.json({
      error: usersErr?.message ?? "Could not fetch User rows.",
    }, { status: 500 });
  }

  const combined = users.map((u: Record<string, string | null>) => {
    const m = memberships.find((mb: Record<string, string>) => mb.userId === u.id);
    return {
      id:              u.id ?? "",
      email:           (u.email ?? "").toLowerCase(),
      name:            u.name ?? "",
      avatarUrl:       u.avatarUrl ?? null,
      isTenantAdmin:   Boolean(m?.isTenantAdmin),
      primaryWireRole: m?.primaryWireRole ?? null,
      loNmls:          m?.loNmls ?? null,
    };
  }).filter(u => u.email && u.id);

  const results = await processUsers(combined, sb, admin, authByEmail, sendInvites);
  return buildResponse(results, sendInvites);
}

// ── Core user processing ──────────────────────────────────────
type UserRow = {
  id: string; email: string; name: string; avatarUrl: string | null;
  isTenantAdmin: boolean; primaryWireRole: string | null; loNmls: string | null;
};

type SyncResult = { email: string; name: string; role: SliceRole; action: "created" | "updated" | "skipped"; error?: string };

async function processUsers(
  users: UserRow[],
  sb: ReturnType<typeof createServiceClient>,
  admin: ReturnType<typeof makeAdminClient>,
  authByEmail: Map<string | undefined, Record<string, unknown>>,
  sendInvites: boolean,
): Promise<SyncResult[]> {
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
  const results: SyncResult[] = [];

  for (const user of users) {
    const role   = deriveRole(user.isTenantAdmin, user.primaryWireRole, user.loNmls);
    const email  = user.email;
    const name   = user.name || email.split("@")[0];
    const nmls   = user.loNmls ?? null;
    const avatar = user.avatarUrl ?? null;

    try {
      const existing   = authByEmail.get(email) as { id: string } | undefined;
      let supabaseUid: string;

      if (!existing) {
        // Create Supabase auth account
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name, role },
        });

        if (createErr || !created?.user) {
          results.push({ email, name, role, action: "skipped", error: createErr?.message ?? "create failed" });
          continue;
        }

        supabaseUid = created.user.id;
        // Add to cache so duplicates in same run don't re-create
        authByEmail.set(email, created.user as unknown as Record<string, unknown>);

        // Send invite email
        if (sendInvites) {
          await admin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${SITE_URL}/goal-engine-login`,
            data: { full_name: name, role },
          });
        }

        results.push({ email, name, role, action: "created" });
      } else {
        supabaseUid = existing.id;
        results.push({ email, name, role, action: "updated" });
      }

      // Upsert profile
      await sb.from("profiles").upsert({
        id:         supabaseUid,
        email,
        full_name:  name,
        role,
        nmls,
        avatar_url: avatar,
        is_active:  true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    } catch (err) {
      results.push({ email, name, role, action: "skipped", error: String(err) });
    }
  }

  return results;
}

function buildResponse(results: SyncResult[], sendInvites: boolean) {
  const created = results.filter(r => r.action === "created").length;
  const updated = results.filter(r => r.action === "updated").length;
  const skipped = results.filter(r => r.action === "skipped").length;
  return NextResponse.json({
    success: true,
    message: `Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`,
    sendInvites,
    results,
  });
}
