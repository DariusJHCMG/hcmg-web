import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";
import { sendUniEmail, uniEmailTemplate } from "@/lib/university/sendUniEmail";

// POST — issue or revoke a certificate (university_admin only)
//
// Security changes in Phase 0:
//   1. Uses getVerifiedProfile() (server-validated token) instead of getCurrentProfile().
//   2. Issue action now verifies ALL published lessons are completed by the target
//      learner before issuing. An admin override is possible but requires an explicit
//      override=true flag AND a non-empty justification string, both of which are
//      written to the audit log.
export async function POST(request: NextRequest) {
  // Privileged write — use server-validated token
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action: "issue" | "revoke";
    profile_id: string;
    course_id: string;
    override?: boolean;
    justification?: string;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { action, profile_id, course_id, override = false, justification } = body;
  if (!action || !profile_id || !course_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ─────────────────────────────────────────────────────────────────────────
  // ISSUE
  // ─────────────────────────────────────────────────────────────────────────
  if (action === "issue") {
    // Verify the course exists
    const { data: course } = await sb
      .from("uni_courses")
      .select("id, title, is_published, recert_interval_days")
      .eq("id", course_id)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Count published lessons in the course
    const { data: lessons } = await sb
      .from("uni_lessons")
      .select("id")
      .eq("course_id", course_id)
      .eq("is_published", true);

    const totalLessons = lessons?.length ?? 0;

    // Count how many of those the learner has completed
    const { data: completedProgress } = await sb
      .from("uni_progress")
      .select("lesson_id")
      .eq("profile_id", profile_id)
      .eq("course_id", course_id)
      .eq("completed", true);

    const completedIds = new Set((completedProgress ?? []).map(p => p.lesson_id));
    const incompleteLessons = (lessons ?? []).filter(l => !completedIds.has(l.id));
    const isFullyComplete = incompleteLessons.length === 0 && totalLessons > 0;

    if (!isFullyComplete && !override) {
      return NextResponse.json({
        error: "Learner has not completed all lessons",
        completed: completedIds.size,
        total: totalLessons,
        incomplete: incompleteLessons.map(l => l.id),
      }, { status: 422 });
    }

    if (!isFullyComplete && override) {
      // Override requires explicit justification — logged to audit trail
      if (!justification?.trim()) {
        return NextResponse.json({
          error: "A justification is required when overriding completion requirements",
        }, { status: 400 });
      }
    }

    // Compute expiration from course recert_interval_days
    const expiresAt: string | null = course.recert_interval_days
      ? new Date(Date.now() + course.recert_interval_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Check for existing active cert first so we never overwrite a verification_id
    const { data: existingCert } = await sb
      .from("uni_certificates")
      .select("id")
      .eq("profile_id", profile_id)
      .eq("course_id", course_id)
      .is("revoked_at", null)
      .maybeSingle();

    let issuedCert: { id: string } | null = null;
    let error: { message: string } | null = null;

    if (existingCert) {
      // Re-issue: update timestamps, clear revocation, keep verification_id
      const { data, error: e } = await sb
        .from("uni_certificates")
        .update({
          issued_by:         profile.id,
          issued_at:         new Date().toISOString(),
          revoked_at:        null,
          revocation_reason: null,
          expires_at:        expiresAt,
        })
        .eq("id", existingCert.id)
        .select("id")
        .single();
      issuedCert = data;
      error = e ?? null;
    } else {
      const { randomUUID } = await import("crypto");
      const { data, error: e } = await sb
        .from("uni_certificates")
        .insert({
          profile_id,
          course_id,
          issued_by:        profile.id,
          issued_at:        new Date().toISOString(),
          expires_at:       expiresAt,
          verification_id:  randomUUID(),
        })
        .select("id")
        .single();
      issuedCert = data;
      error = e ?? null;
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send cert_issued notification to learner + email
    if (issuedCert?.id) {
      const certTitle = "Certificate earned";
      const certBody  = `You have earned a certificate for completing "${course.title}".${expiresAt ? ` This certificate expires on ${new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.` : ""}`;

      const { data: notif } = await sb.from("uni_notifications").insert({
        profile_id,
        notification_type: "cert_issued",
        title:             certTitle,
        body:              certBody,
        channels:          ["in_app", "email"],
        entity_type:       "certificate",
        entity_id:         issuedCert.id,
      }).select("id").single();

      // Send email to learner
      const { data: learner } = await sb
        .from("profiles")
        .select("email, full_name")
        .eq("id", profile_id)
        .maybeSingle();

      if (learner?.email) {
        const html = uniEmailTemplate({
          title:    certTitle,
          bodyHtml: `<p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${certBody}</p>`,
          ctaLabel: "View My Certificates",
          ctaUrl:   `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com"}/university/certificates`,
        });
        await sendUniEmail({
          to:             learner.email,
          subject:        certTitle,
          html,
          notificationId: notif?.id,
        });
      }
    }

    await logUniAudit("certificate_issued", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "certificate",
      details: {
        profile_id,
        course_id,
        course_title: course.title,
        completion_verified: isFullyComplete,
        override_used: !isFullyComplete && override,
        justification: (!isFullyComplete && override) ? justification : undefined,
        completed_lessons: completedIds.size,
        total_lessons: totalLessons,
        expires_at: expiresAt,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REVOKE
  // ─────────────────────────────────────────────────────────────────────────
  if (action === "revoke") {
    if (!justification?.trim()) {
      return NextResponse.json({ error: "A justification is required to revoke a certificate" }, { status: 400 });
    }

    const { error } = await sb.from("uni_certificates")
      .update({ revoked_at: new Date().toISOString() })
      .eq("profile_id", profile_id)
      .eq("course_id", course_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logUniAudit("certificate_revoked", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "certificate",
      details: { profile_id, course_id, justification },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
