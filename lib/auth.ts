import { createSupabaseServerClient, createServiceClient } from "./supabase";
import type { Profile, Role } from "./database.types";

// ── Get current session + profile (server components / API routes) ──
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
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
