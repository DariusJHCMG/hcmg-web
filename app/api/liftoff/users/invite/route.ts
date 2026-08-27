/**
 * POST /api/liftoff/users/invite — invite a new user to the LiftOff system.
 * Creates a Supabase auth user, sets the liftoff role, and sends an invite email.
 * Valid roles: liftoff_admin, liftoff_team, lock_desk_admin, lock_desk_agent,
 *              ops_manager, help_desk_agent, processor.
 * Auth: liftoff_admin or admin role required.
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const VALID_ROLES = ["liftoff_admin", "liftoff_team", "lock_desk_admin", "lock_desk_agent", "ops_manager", "help_desk_agent", "processor"];

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { full_name?: string; email?: string; liftoff_roles?: string[]; title?: string; send_invite?: boolean };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { full_name, email, liftoff_roles, title, send_invite = true } = body;

  if (!full_name?.trim()) return NextResponse.json({ error: "full_name is required" }, { status: 400 });
  if (!email?.trim())     return NextResponse.json({ error: "email is required" }, { status: 400 });
  if (!Array.isArray(liftoff_roles) || liftoff_roles.length === 0) {
    return NextResponse.json({ error: "At least one liftoff_role is required" }, { status: 400 });
  }
  const invalid = liftoff_roles.find(r => !VALID_ROLES.includes(r));
  if (invalid) return NextResponse.json({ error: `Invalid role: ${invalid}` }, { status: 400 });

  const sb = createServiceClient();

  const patchPayload: Record<string, unknown> = {
    full_name:      full_name.trim(),
    liftoff_roles,
    liftoff_only:   true,
    show_on_website: false,
    role:           "loan_officer",
    invite_pending: !send_invite,
  };
  if (title?.trim()) patchPayload.title = title.trim();

  if (!send_invite) {
    // ── Save without inviting — upsert the profile row only ─────────────────
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existing?.id) {
      await sb.from("profiles").update(patchPayload).eq("id", existing.id);
      return NextResponse.json({ ok: true, invite_pending: true, id: existing.id });
    }

    // No auth user yet — create a placeholder profile row via a Supabase auth invite
    // but immediately mark invite_pending so we know the email wasn't sent.
    // We still need an auth user row for the profile FK — use inviteUserByEmail
    // but the user won't get a usable link until we send it properly.
    // Instead: create a disabled auth user with a random password placeholder.
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Create the user without sending an email (using createUser instead of inviteUserByEmail)
    const { data: createdUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      email_confirm: false,
      user_metadata: {
        full_name: full_name.trim(),
        liftoff_roles,
        liftoff_only: true,
      },
    });

    if (createErr) {
      // User already exists in auth — find their profile and patch it
      const { data: byEmail } = await sb
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      if (byEmail?.id) {
        await sb.from("profiles").update(patchPayload).eq("id", byEmail.id);
        return NextResponse.json({ ok: true, invite_pending: true, id: byEmail.id });
      }
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }

    const userId = createdUser.user?.id;
    if (userId) {
      await sb.from("profiles").upsert({
        id:        userId,
        email:     email.trim().toLowerCase(),
        tenant_id: profile.tenant_id,
        slice_role: "loan_officer",
        is_active:  true,
        ...patchPayload,
      });
    }

    return NextResponse.json({ ok: true, invite_pending: true, id: userId });
  }

  // ── Send invite immediately (original flow) ──────────────────────────────────
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

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
    const alreadyExists = inviteErr.status === 422 ||
      inviteErr.message?.toLowerCase().includes("already been registered") ||
      inviteErr.message?.toLowerCase().includes("already registered");

    if (!alreadyExists) {
      return NextResponse.json({ error: inviteErr.message }, { status: 500 });
    }
  }

  const userId = inviteData?.user?.id;

  if (userId) {
    const { error: patchErr } = await sb
      .from("profiles")
      .update(patchPayload)
      .eq("id", userId);

    if (patchErr) {
      await sb.from("profiles").upsert({
        id:        userId,
        email:     email.trim().toLowerCase(),
        tenant_id: profile.tenant_id,
        slice_role: "loan_officer",
        is_active:  true,
        ...patchPayload,
      });
    }
  } else {
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
