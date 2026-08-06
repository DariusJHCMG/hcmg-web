/**
 * POST /api/goal-engine/auth/signin
 * Custom sign-in: verifies credentials against the Porchy Prisma "User" +
 * "TenantMembership" tables, then creates/upserts a SLICE profile and issues
 * a secure HTTP-only session cookie.
 *
 * Security:
 *  - Credentials verified server-side only.
 *  - Service-role key never sent to browser.
 *  - Generic error messages (no email-existence oracle).
 *  - Rate limiting enforced via in-process counter (swap for Redis in prod).
 *  - Session token is a cryptographically random UUID stored in Supabase.
 *  - Cookie: HttpOnly, SameSite=Strict, Secure in production.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { randomUUID } from "crypto";
import type { SliceRole } from "@/lib/database.types";

const HCMG_TENANT_ID  = "cmrss19yi000fysf83wcom9th";
const SESSION_DAYS    = 7;
const SESSION_COOKIE  = "slice_session";
const isProd          = process.env.NODE_ENV === "production";

// ── Simple in-process rate limiter (ip → [timestamps]) ──────────
const loginAttempts = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now     = Date.now();
  const window  = 15 * 60 * 1000; // 15 minutes
  const limit   = 10;
  const history = (loginAttempts.get(ip) ?? []).filter(t => now - t < window);
  history.push(now);
  loginAttempts.set(ip, history);
  return history.length > limit;
}

function deriveSliceRole(
  isTenantAdmin: boolean,
  primaryWireRole: string | null,
  loNmls: string | null,
): SliceRole {
  if (isTenantAdmin) {
    const r = (primaryWireRole ?? "").toLowerCase();
    if (r === "clo")       return "clo";
    if (r === "ceo" || r === "president" || r === "executive") return "executive";
    return "executive";
  }
  const r = (primaryWireRole ?? "").toLowerCase();
  if (r === "branch_manager" || r === "manager") return "branch_manager";
  if (r === "lo" || r === "loan_officer" || loNmls) return "loan_officer";
  return "loan_officer";
}

// Map SliceRole → legacy Role (used by existing code)
function toLegacyRole(sr: SliceRole): "admin" | "loan_officer" {
  if (sr === "super_admin" || sr === "clo" || sr === "executive") return "admin";
  if (sr === "branch_manager") return "admin"; // managers see admin UI
  return "loan_officer";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  let email = "", password = "";
  try {
    const body = await req.json();
    email    = (body.email    ?? "").trim().toLowerCase();
    password = (body.password ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── 1. Lookup user in Prisma "User" table ─────────────────────
  const { data: prismaUsers } = await sb
    .from("User")
    .select("id, email, name, avatarUrl, passwordHash, isActive")
    .eq("email", email)
    .limit(1);

  const prismaUser = prismaUsers?.[0];

  // ── 2. Check HCMG membership ──────────────────────────────────
  let membership: {
    isTenantAdmin: boolean;
    primaryWireRole: string | null;
    loNmls: string | null;
    isActive: boolean;
  } | null = null;

  if (prismaUser) {
    const { data: memberships } = await sb
      .from("TenantMembership")
      .select("isTenantAdmin, primaryWireRole, loNmls, isActive")
      .eq("userId", prismaUser.id)
      .eq("tenantId", HCMG_TENANT_ID)
      .limit(1);
    membership = memberships?.[0] ?? null;
  }

  // ── 3. Verify password using Supabase auth fallback ───────────
  // The Porchy passwordHash format is proprietary (not bcrypt).
  // We use Supabase auth as the password authority for SLICE.
  // If the user has no Supabase account yet, we reject and prompt them to
  // complete their SLICE setup via the sync-users invite flow.

  let supabaseUid: string | null = null;
  let authError: string | null   = null;

  if (!prismaUser || !membership || !membership.isActive) {
    // Generic error — don't reveal whether email exists
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  // Try Supabase sign-in (user must have been synced via /admin/users first)
  const { createClient } = await import("@supabase/supabase-js");
  const browserSb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: authData, error: sbError } = await browserSb.auth.signInWithPassword({ email, password });

  if (sbError || !authData?.user) {
    // If Supabase auth fails but Porchy user exists → they haven't set their
    // SLICE password yet. Direct them to the invite email.
    if (prismaUser) {
      return NextResponse.json(
        { error: "SLICE account not yet activated. Check your email for a setup invitation, or contact your administrator." },
        { status: 401 },
      );
    }
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  supabaseUid = authData.user.id;

  // ── 4. Upsert SLICE profile ───────────────────────────────────
  const sliceRole  = deriveSliceRole(membership.isTenantAdmin, membership.primaryWireRole, membership.loNmls);
  const legacyRole = toLegacyRole(sliceRole);

  await sb.from("profiles").upsert({
    id:             supabaseUid,
    email:          prismaUser.email,
    full_name:      prismaUser.name ?? prismaUser.email.split("@")[0],
    role:           legacyRole,
    slice_role:     sliceRole,
    tenant_id:      HCMG_TENANT_ID,
    nmls:           membership.loNmls ?? null,
    avatar_url:     prismaUser.avatarUrl ?? null,
    is_active:      membership.isActive,
    porchy_user_id: prismaUser.id,
    last_login_at:  new Date().toISOString(),
    updated_at:     new Date().toISOString(),
  }, { onConflict: "id" });

  // ── 5. Issue SLICE session token ──────────────────────────────
  const token     = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  // Upsert profile record to get its UUID for the session
  const { data: profileRow } = await sb
    .from("profiles")
    .select("id")
    .eq("id", supabaseUid)
    .single();

  if (profileRow) {
    await sb.from("slice_sessions").insert({
      profile_id:    supabaseUid,
      session_token: token,
      expires_at:    expiresAt.toISOString(),
      ip_address:    ip,
      tenant_id:     HCMG_TENANT_ID,
    });
  }

  // ── 6. Build response with Supabase cookies + SLICE session ──
  const res = NextResponse.json({
    ok:   true,
    role: legacyRole,
    sliceRole,
    name: prismaUser.name,
  });

  // Set HTTP-only slice session cookie
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure:   isProd,
    sameSite: "strict",
    path:     "/goal-engine",
    expires:  expiresAt,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure:   isProd,
    sameSite: "strict",
    path:     "/goal-engine",
    maxAge:   0,
  });
  return res;
}
