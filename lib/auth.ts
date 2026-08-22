import { createSupabaseServerClient, createServiceClient } from "./supabase";
import type { Profile, Role, LiftOffRole } from "./database.types";

// ── Get current session + profile (server components / API routes) ──
export async function getSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch { return null; }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    // Use getSession (reads JWT from cookie locally) instead of getUser (makes network call)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    // Fetch profile using service client to bypass any RLS issues
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    return data as Profile | null;
  } catch { return null; }
}

// ── Role checks ───────────────────────────────────────────────
export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin" || profile?.role === "developer";
}

export function isDeveloper(profile: Profile | null): boolean {
  return profile?.role === "developer";
}

export function isLoanOfficer(profile: Profile | null): boolean {
  return profile?.role === "loan_officer";
}

// ── Lift Off role checks ──────────────────────────────────────
export function hasLiftOffAccess(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return profile.liftoff_role != null;
}

export function canAccessLiftOffQueue(profile: Profile | null): boolean {
  return hasLiftOffAccess(profile);
}

export function canSeeLockRequests(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return profile.liftoff_role === "liftoff_admin" || profile.liftoff_role === "lock_desk_admin";
}

export function canSeeGeneralRequests(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return profile.liftoff_role === "liftoff_admin" || profile.liftoff_role === "liftoff_team";
}

export function getLiftOffRoleLabel(role: LiftOffRole | null): string {
  if (!role) return "—";
  const labels: Record<LiftOffRole, string> = {
    liftoff_admin:   "Lift Off Admin",
    liftoff_team:    "Lift Off Team",
    lock_desk_admin: "Lock Desk Admin",
  };
  return labels[role];
}

export function redirectPath(role: Role): string {
  if (role === "admin" || role === "developer") return "/admin";
  return "/portal";
}

// ── Audit logger (server/service-role) ───────────────────────
export async function logAudit(
  action: string,
  details?: Record<string, unknown>,
  userId?: string,
  userEmail?: string,
  ipAddress?: string,
) {
  const supabase = createServiceClient();
  await supabase.from("audit_log").insert({
    user_id: userId ?? null,
    user_email: userEmail ?? null,
    action,
    details: details ?? null,
    ip_address: ipAddress ?? null,
  });
}

// ── Get profile by lo_slug (for lead routing) ─────────────────
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("lo_slug", slug)
    .eq("is_active", true)
    .single();
  return data as Profile | null;
}
