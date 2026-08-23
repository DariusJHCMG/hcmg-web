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
function hasRole(profile: Profile | null, role: LiftOffRole): boolean {
  if (!profile) return false;
  return profile.liftoff_roles.includes(role);
}

export function hasLiftOffAccess(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return profile.liftoff_roles.length > 0;
}

export function canAccessLiftOffQueue(profile: Profile | null): boolean {
  return hasLiftOffAccess(profile);
}

export function canSeeLockRequests(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return hasRole(profile, "liftoff_admin") || hasRole(profile, "lock_desk_admin");
}

export function canSeeGeneralRequests(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return hasRole(profile, "liftoff_admin") || hasRole(profile, "liftoff_team") || hasRole(profile, "ops_manager");
}

export function isOpsManager(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return hasRole(profile, "ops_manager") || hasRole(profile, "liftoff_admin");
}

export function canAssignRequests(profile: Profile | null): boolean {
  return isOpsManager(profile);
}

export function canAccessHelpDeskQueue(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return hasRole(profile, "liftoff_admin") ||
    hasRole(profile, "ops_manager") ||
    hasRole(profile, "help_desk_agent");
}

export function canSeeHelpDeskRequests(profile: Profile | null): boolean {
  return canAccessHelpDeskQueue(profile);
}

export function getLiftOffRoleLabel(roles: LiftOffRole[]): string {
  if (!roles || roles.length === 0) return "—";
  const labels: Record<LiftOffRole, string> = {
    liftoff_admin:    "Lift Off Admin",
    liftoff_team:     "Lift Off Team",
    lock_desk_admin:  "Lock Desk Admin",
    ops_manager:      "Ops Manager",
    help_desk_agent:  "Help Desk Agent",
  };
  return roles.map(r => labels[r] ?? r).join(", ");
}

export function redirectPath(role: Role, liftoffOnly?: boolean): string {
  if (role === "admin" || role === "developer") return "/admin";
  if (liftoffOnly) return "/liftoff";
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
