/**
 * POST /api/liftoff/test-emails — fire every LiftOff email template to the admin
 * test address. No DB reads or writes — safe to call repeatedly for smoke testing.
 * Auth: admin role required.
 */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { sendAllPreviewEmails } from "@/lib/liftoff-mailer";

// Admin-only – fires every Liftoff email template to darius@hcmgloans.com.
// No DB reads or writes. Safe to call repeatedly.

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { sent, errors } = await sendAllPreviewEmails("darius@hcmgloans.com");

  return NextResponse.json({
    ok: true,
    sent_count: sent.length,
    sent_to: "darius@hcmgloans.com",
    emails: sent,
    errors: errors.length ? errors : undefined,
  });
}
