import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

// PATCH /api/university/admin/users/[id]
// Allows university_admin to update a user's university_role and university_access.
//
// Security:
//   - Requires getVerifiedProfile() + isUniversityAdmin().
//   - Only explicitly allowed fields are applied (no mass assignment).
//   - Privilege escalation prevention: admins cannot grant developer or admin
//     platform roles through this endpoint (only university-layer fields).
//   - All changes are written to uni_audit_log.

const ALLOWED_UNI_ROLES = ["learner", "trainer", "manager", "university_admin"] as const;

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const actor = await getVerifiedProfile();
  if (!actor || !isUniversityAdmin(actor)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent self-modification (admin cannot accidentally lock themselves out)
  if (id === actor.id) {
    return NextResponse.json({ error: "Cannot modify your own university role from this panel" }, { status: 400 });
  }

  let body: {
    university_access?: boolean;
    university_role?: string;
    employment_status?: string;
    department?: string;
    manager_id?: string | null;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const updates: Record<string, unknown> = {};

  // university_access
  if ("university_access" in body) {
    if (typeof body.university_access !== "boolean") {
      return NextResponse.json({ error: "university_access must be boolean" }, { status: 400 });
    }
    updates.university_access = body.university_access;
  }

  // university_role — must be a valid university role
  if ("university_role" in body) {
    if (!ALLOWED_UNI_ROLES.includes(body.university_role as typeof ALLOWED_UNI_ROLES[number])) {
      return NextResponse.json({ error: "Invalid university_role" }, { status: 400 });
    }
    updates.university_role = body.university_role;
  }

  // employment_status — only allow deactivation/reactivation, not privilege changes
  if ("employment_status" in body) {
    if (!["active", "inactive", "suspended"].includes(body.employment_status ?? "")) {
      return NextResponse.json({ error: "Invalid employment_status" }, { status: 400 });
    }
    updates.employment_status = body.employment_status;
  }

  // department — free text
  if ("department" in body) {
    updates.department = body.department ?? null;
  }

  // manager_id
  if ("manager_id" in body) {
    updates.manager_id = body.manager_id ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Fetch current values for audit trail
  const { data: current } = await sb
    .from("profiles")
    .select("full_name, email, university_access, university_role, employment_status, department, manager_id")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { error } = await sb.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("user_updated", {
    actorId:    actor.id,
    actorEmail: actor.email,
    entityType: "profile",
    entityId:   id,
    details: {
      target_email: current.email,
      target_name:  current.full_name,
      before: Object.fromEntries(Object.keys(updates).map(k => [k, (current as Record<string, unknown>)[k]])),
      after:  updates,
    },
  });

  return NextResponse.json({ ok: true });
}
