import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const VALID_ROLES = ["liftoff_admin", "liftoff_team", "lock_desk_admin", "ops_manager"];

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { full_name?: string; email?: string; liftoff_roles?: string[]; title?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { full_name, email, liftoff_roles, title } = body;

  if (!full_name?.trim()) return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  if (!email?.trim())     return NextResponse.json({ error: "email is required" }, { status: 400 });
  if (!Array.isArray(liftoff_roles) || liftoff_roles.length === 0) {
    return NextResponse.json({ error: "At least one liftoff_role is required" }, { status: 400 });
  }
  const invalid = liftoff_roles.find(r => !VALID_ROLES.includes(r));
  if (invalid) return NextResponse.json({ error: `Invalid role: ${invalid}` }, { status: 400 });

  // Use service-role admin client for auth.admin calls
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Invite the user — Supabase sends the invite email automatically
  const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      data: {
        full_name:     full_name.trim(),
        liftoff_roles,
        liftoff_only:  true,
      },
    },
  );

  if (inviteErr) {
    // 422 = user already exists — still usable, just patch the profile
    const alreadyExists = inviteErr.status === 422 ||
      inviteErr.message?.toLowerCase().includes("already been registered") ||
      inviteErr.message?.toLowerCase().includes("already registered");

    if (!alreadyExists) {
      return NextResponse.json({ error: inviteErr.message }, { status: 500 });
    }
  }

  const userId = inviteData?.user?.id;

  // Patch the profile row — covers both new invite and existing user
  const sb = createServiceClient();
  const patchPayload: Record<string, unknown> = {
    full_name:      full_name.trim(),
    liftoff_roles,
    liftoff_only:   true,
    show_on_website: false,
    role:           "loan_officer",
  };
  if (title?.trim()) patchPayload.title = title.trim();

  if (userId) {
    // New user — profile row may not exist yet (trigger creates it); upsert to be safe
    const { error: patchErr } = await sb
      .from("profiles")
      .update(patchPayload)
      .eq("id", userId);

    if (patchErr) {
      // Trigger may not have fired yet — try upsert
      await sb.from("profiles").upsert({
        id:           userId,
        email:        email.trim().toLowerCase(),
        tenant_id:    profile.tenant_id,
        slice_role:   "loan_officer",
        is_active:    true,
        ...patchPayload,
      });
    }
  } else {
    // User already existed — find by email and patch
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (existing?.id) {
      await sb.from("profiles").update(patchPayload).eq("id", existing.id);
    }
  }

  return NextResponse.json({ ok: true });
}
