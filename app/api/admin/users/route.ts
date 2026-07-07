import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin, logAudit } from "@/lib/auth";
import { z } from "zod";

const CreateUserSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  full_name:    z.string().min(1),
  role:         z.enum(["admin", "developer", "loan_officer"]),
  lo_slug:      z.string().optional(),
  nmls:         z.string().optional(),
  phone:        z.string().optional(),
  notify_email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  // Auth check
  const caller = await getCurrentProfile();
  if (!caller || !isAdmin(caller)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { email, password, full_name, role, lo_slug, nmls, phone, notify_email } = parsed.data;

  const sb = createServiceClient();

  // Create auth user — pass all metadata so the DB trigger auto-fills the profile
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
      lo_slug:      lo_slug      || "",
      nmls:         nmls         || "",
      notify_email: notify_email || "",
    },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
  }

  // Update phone (not in trigger, set separately)
  if (phone) {
    await sb.from("profiles").update({ phone }).eq("id", authData.user.id);
  }

  await logAudit("user.created", { email, role, lo_slug }, caller.id, caller.email);

  return NextResponse.json({ ok: true, id: authData.user.id });
}
