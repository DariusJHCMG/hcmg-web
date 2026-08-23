import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sb = createServiceClient();

  // Fetch the profile to get email + roles
  const { data: target } = await sb
    .from("profiles")
    .select("id, email, full_name, liftoff_roles, invite_pending")
    .eq("id", id)
    .single();

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!target.email) return NextResponse.json({ error: "User has no email address" }, { status: 400 });

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Send the invite email
  const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
    target.email,
    {
      data: {
        full_name:     target.full_name,
        liftoff_roles: target.liftoff_roles,
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

  // Clear the invite_pending flag
  await sb.from("profiles").update({ invite_pending: false }).eq("id", id);

  return NextResponse.json({ ok: true });
}
