import { createSupabaseServerClient, createServiceClient } from "./supabase";
import type { Profile, Role, LiftOffRole, UniversityRole } from "./database.types";

// ── Session helpers ────────────────────────────────────────────
//
// getSession() — reads JWT from cookie locally (no network round-trip).
// Suitable for: read-only learner pages, navigation guards, lightweight checks.
//
// getSessionVerified() — calls Supabase Auth server to validate the token.
// Required for: every admin operation, privileged write, role change, certificate
// issuance, bulk operation, or any action whose compromise would have real impact.
// The extra ~50ms network call is intentional and non-negotiable for these paths.
//
export async function getSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch { return null; }
}

export async function getSessionVerified() {
  try {
    const supabase = await createSupabaseServerClient();
    // getUser() makes a network call to Supabase Auth to validate the token
    // server-side. This rejects stolen/replayed JWTs that would pass getSession().
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch { return null; }
}

// ── Profile lookup ─────────────────────────────────────────────
//
// getCurrentProfile() — uses getSession() (fast, cookie-local).
// For learner pages and read paths where a replayed JWT is low-impact.
//
// getVerifiedProfile() — uses getSessionVerified() (server-validated).
// Use for every privileged write: admin actions, role changes, publishing,
// certificate issuance, bulk enrollment, compliance engine calls.
//
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    // is_active=true ensures deactivated employees are blocked even if their JWT
    // survived the Supabase auth ban
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .eq("is_active", true)
      .single();
    return data as Profile | null;
  } catch { return null; }
}

export async function getVerifiedProfile(): Promise<Profile | null> {
  try {
    const user = await getSessionVerified();
    if (!user) return null;
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .eq("is_active", true)
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

export function canAccessLockDeskQueue(profile: Profile | null): boolean {
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "developer") return true;
  return hasRole(profile, "liftoff_admin") ||
    hasRole(profile, "ops_manager") ||
    hasRole(profile, "lock_desk_admin") ||
    hasRole(profile, "lock_desk_agent");
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
    lock_desk_agent:  "Lock Desk Agent",
    ops_manager:      "Ops Manager",
    help_desk_agent:  "Help Desk Agent",
    processor:        "Processor",
  };
  return roles.map(r => labels[r] ?? r).join(", ");
}

export function redirectPath(role: Role, liftoffOnly?: boolean): string {
  if (role === "admin" || role === "developer") return "/admin";
  if (liftoffOnly) return "/liftoff";
  return "/portal";
}

// ── HCMG University auth helpers ─────────────────────────────
export function hasUniversityAccess(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.is_active) return false;
  if (profile.employment_status !== "active") return false;
  return profile.university_access === true;
}

export function getUniversityRole(profile: Profile | null): UniversityRole | null {
  if (!hasUniversityAccess(profile)) return null;
  // Portal admins/devs always get university_admin regardless of stored value
  if (profile!.role === "admin" || profile!.role === "developer") return "university_admin";
  return profile!.university_role;
}

export function isUniversityAdmin(profile: Profile | null): boolean {
  return getUniversityRole(profile) === "university_admin";
}

export function isUniversityTrainer(profile: Profile | null): boolean {
  const r = getUniversityRole(profile);
  return r === "trainer" || r === "university_admin";
}

export function isUniversityManager(profile: Profile | null): boolean {
  const r = getUniversityRole(profile);
  return r === "manager" || r === "university_admin";
}

// ── University audit logger ───────────────────────────────────
export async function logUniAudit(
  action: string,
  options?: {
    actorId?: string;
    actorEmail?: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }
) {
  try {
    const supabase = createServiceClient();
    await supabase.from("uni_audit_log").insert({
      actor_id:    options?.actorId    ?? null,
      actor_email: options?.actorEmail ?? null,
      action,
      entity_type: options?.entityType ?? null,
      entity_id:   options?.entityId   ?? null,
      details:     options?.details    ?? null,
      ip_address:  options?.ipAddress  ?? null,
    });
  } catch { /* non-fatal */ }
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
