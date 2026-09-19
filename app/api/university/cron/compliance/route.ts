import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { logUniAudit } from "@/lib/auth";
import { sendUniEmail, uniEmailTemplate } from "@/lib/university/sendUniEmail";

// GET /api/university/cron/compliance
//
// Protected by: Authorization: Bearer {CRON_SECRET}
// Called by: Supabase pg_cron, Vercel Cron, or any secure scheduler.
//
// Lifecycle logic:
//   1. Expire certificates past their expires_at date
//   2. Auto-re-enroll learner with assignment_type = 'recertification'
//   3. Send 30/14/7-day expiration warning notifications
//   4. Escalate to manager at 7 days overdue post-expiry
//   5. Escalate to HR (university_admin) at 30 days overdue post-expiry

export async function GET(request: NextRequest) {
  // ── Authorization check ─────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const now = new Date();

  const summary = {
    expired: 0,
    warned_30: 0,
    warned_14: 0,
    warned_7: 0,
    manager_escalations: 0,
    hr_escalations: 0,
    errors: [] as string[],
  };

  // ── Helper: insert a notification + optionally send email ──────────────
  async function notify(
    profileId: string,
    type: string,
    title: string,
    body: string,
    channels: string[],
    entityType: string,
    entityId: string,
    metadata?: Record<string, string>
  ) {
    const { data: notif, error } = await sb.from("uni_notifications").insert({
      profile_id:        profileId,
      notification_type: type,
      title,
      body,
      channels,
      entity_type:       entityType,
      entity_id:         entityId,
      ...(metadata ? { metadata } : {}),
    }).select("id").single();
    if (error) {
      summary.errors.push(`notify(${type},${profileId}): ${error.message}`);
      return;
    }

    // Send email if the "email" channel is requested
    if (channels.includes("email")) {
      const { data: recipient } = await sb
        .from("profiles")
        .select("email, full_name")
        .eq("id", profileId)
        .maybeSingle();

      if (recipient?.email) {
        const html = uniEmailTemplate({
          title,
          bodyHtml: `<p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${body.replace(/\n/g, "<br/>")}</p>`,
          ctaLabel: "Open HCMG University",
          ctaUrl:   `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com"}/university`,
        });
        await sendUniEmail({
          to:             recipient.email,
          subject:        title,
          html,
          notificationId: notif?.id,
        });
      }
    }
  }

  // ── Helper: check if a warning notification was already sent ───────────
  async function warningAlreadySent(
    profileId: string,
    entityId: string,
    warningDays: number
  ): Promise<boolean> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await sb
      .from("uni_notifications")
      .select("id")
      .eq("profile_id", profileId)
      .eq("entity_id", entityId)
      .eq("notification_type", "cert_expiring")
      .gte("created_at", threeDaysAgo)
      // Filter by warning_days in metadata — stored as JSON column
      // We insert metadata into the body to avoid a schema change; use a
      // title suffix pattern instead for deduplication.
      .ilike("title", `%${warningDays} day%`)
      .maybeSingle();
    return !!data;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1 — Expire overdue certificates
  // ═══════════════════════════════════════════════════════════════════════
  const { data: expiredCerts, error: expiredErr } = await sb
    .from("uni_certificates")
    .select(`
      id,
      profile_id,
      course_id,
      expires_at,
      verification_id,
      uni_courses ( id, title, recert_interval_days ),
      profiles:profile_id ( id, email, full_name, manager_id )
    `)
    .not("expires_at", "is", null)
    .lte("expires_at", now.toISOString())
    .is("revoked_at", null);

  if (expiredErr) {
    summary.errors.push(`expired query: ${expiredErr.message}`);
  } else {
    for (const cert of (expiredCerts ?? [])) {
      try {
        // 1a. Mark the certificate as expired (revoked_at + revocation_reason)
        await sb
          .from("uni_certificates")
          .update({
            revoked_at:        now.toISOString(),
            revocation_reason: "expired",
          })
          .eq("id", cert.id);

        summary.expired++;

        // 1b. Auto-re-enroll in the course for recertification
        await sb.from("uni_enrollments").upsert(
          {
            profile_id:      cert.profile_id,
            course_id:       cert.course_id,
            assignment_type: "recertification",
            assigned_by:     null,
          },
          { onConflict: "profile_id,course_id" }
        );

        // 1c. Notify learner
        const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";
        await notify(
          cert.profile_id,
          "cert_expired",
          "Your training certificate has expired",
          `Your certificate for "${courseTitle}" has expired. You have been re-enrolled to complete recertification.`,
          ["in_app", "email"],
          "certificate",
          cert.id
        );

        // 1d. Audit log
        await logUniAudit("certificate_expired_auto", {
          actorId: undefined,
          entityType: "certificate",
          entityId: cert.id,
          details: {
            profile_id:  cert.profile_id,
            course_id:   cert.course_id,
            course_title: courseTitle,
            expires_at:  cert.expires_at,
          },
        });
      } catch (err) {
        summary.errors.push(`expire cert ${cert.id}: ${String(err)}`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2 — 30-day expiration warning
  // ═══════════════════════════════════════════════════════════════════════
  const thirtyDayWindow = {
    from: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    to:   new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data: warning30, error: w30Err } = await sb
    .from("uni_certificates")
    .select(`
      id, profile_id, course_id, expires_at,
      uni_courses ( title ),
      profiles:profile_id ( id, email, full_name )
    `)
    .not("expires_at", "is", null)
    .gte("expires_at", thirtyDayWindow.from)
    .lte("expires_at", thirtyDayWindow.to)
    .is("revoked_at", null);

  if (w30Err) {
    summary.errors.push(`warning30 query: ${w30Err.message}`);
  } else {
    for (const cert of (warning30 ?? [])) {
      const already = await warningAlreadySent(cert.profile_id, cert.id, 30);
      if (already) continue;
      const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";
      await notify(
        cert.profile_id,
        "cert_expiring",
        `Training certificate expiring in 30 days`,
        `Your certificate for "${courseTitle}" will expire in 30 days. Log in to HCMG U to review your renewal options.`,
        ["in_app", "email"],
        "certificate",
        cert.id
      );
      summary.warned_30++;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 3 — 14-day expiration warning
  // ═══════════════════════════════════════════════════════════════════════
  const fourteenDayWindow = {
    from: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
    to:   new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data: warning14, error: w14Err } = await sb
    .from("uni_certificates")
    .select(`
      id, profile_id, course_id, expires_at,
      uni_courses ( title ),
      profiles:profile_id ( id, email, full_name )
    `)
    .not("expires_at", "is", null)
    .gte("expires_at", fourteenDayWindow.from)
    .lte("expires_at", fourteenDayWindow.to)
    .is("revoked_at", null);

  if (w14Err) {
    summary.errors.push(`warning14 query: ${w14Err.message}`);
  } else {
    for (const cert of (warning14 ?? [])) {
      const already = await warningAlreadySent(cert.profile_id, cert.id, 14);
      if (already) continue;
      const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";
      await notify(
        cert.profile_id,
        "cert_expiring",
        `Training certificate expiring in 14 days`,
        `Your certificate for "${courseTitle}" expires in 14 days. Complete your renewal training now to maintain your certification.`,
        ["in_app", "email"],
        "certificate",
        cert.id
      );
      summary.warned_14++;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 4 — 7-day expiration warning (learner + manager)
  // ═══════════════════════════════════════════════════════════════════════
  const sevenDayWindow = {
    from: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    to:   new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { data: warning7, error: w7Err } = await sb
    .from("uni_certificates")
    .select(`
      id, profile_id, course_id, expires_at,
      uni_courses ( title ),
      profiles:profile_id ( id, email, full_name, manager_id )
    `)
    .not("expires_at", "is", null)
    .gte("expires_at", sevenDayWindow.from)
    .lte("expires_at", sevenDayWindow.to)
    .is("revoked_at", null);

  if (w7Err) {
    summary.errors.push(`warning7 query: ${w7Err.message}`);
  } else {
    for (const cert of (warning7 ?? [])) {
      const already = await warningAlreadySent(cert.profile_id, cert.id, 7);
      if (already) continue;

      const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";
      const learnerProfile = cert.profiles as unknown as { id: string; full_name: string; manager_id: string | null } | null;

      // Notify learner
      await notify(
        cert.profile_id,
        "cert_expiring",
        `Urgent: Training certificate expiring in 7 days`,
        `Your certificate for "${courseTitle}" expires in 7 days. Complete renewal training immediately to avoid a compliance gap.`,
        ["in_app", "email"],
        "certificate",
        cert.id
      );
      summary.warned_7++;

      // Notify manager if set
      if (learnerProfile?.manager_id) {
        await notify(
          learnerProfile.manager_id,
          "cert_expiring",
          `Team member certificate expiring in 7 days`,
          `${learnerProfile.full_name ?? "A team member"}'s certificate for "${courseTitle}" expires in 7 days. Please remind them to complete renewal training.`,
          ["in_app", "email"],
          "certificate",
          cert.id
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 5 — 7-day overdue escalation to manager
  // ═══════════════════════════════════════════════════════════════════════
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: overdue7, error: od7Err } = await sb
    .from("uni_certificates")
    .select(`
      id, profile_id, course_id, revoked_at, revocation_reason,
      uni_courses ( title ),
      profiles:profile_id ( id, full_name, manager_id ),
      uni_enrollments!inner ( profile_id, course_id, completed_at )
    `)
    .eq("revocation_reason", "expired")
    .lte("revoked_at", sevenDaysAgo)
    .gte("revoked_at", fourteenDaysAgo);

  if (od7Err) {
    summary.errors.push(`overdue7 query: ${od7Err.message}`);
  } else {
    for (const cert of (overdue7 ?? [])) {
      // Check if the re-enrollment has been completed yet
      const enrollment = cert.uni_enrollments as { completed_at: string | null }[] | { completed_at: string | null } | null;
      const completedAt = Array.isArray(enrollment)
        ? (enrollment[0]?.completed_at ?? null)
        : (enrollment?.completed_at ?? null);
      if (completedAt) continue; // Already renewed

      const learnerProfile = cert.profiles as unknown as { id: string; full_name: string; manager_id: string | null } | null;
      if (!learnerProfile?.manager_id) continue;

      const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";

      await notify(
        learnerProfile.manager_id,
        "manager_escalation",
        `Overdue training: action required`,
        `${learnerProfile.full_name ?? "A team member"} has not completed recertification for "${courseTitle}" — now 7+ days overdue. Please follow up directly.`,
        ["in_app", "email"],
        "certificate",
        cert.id
      );
      summary.manager_escalations++;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 6 — 30-day overdue escalation to HR admins
  // ═══════════════════════════════════════════════════════════════════════
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: overdue30, error: od30Err } = await sb
    .from("uni_certificates")
    .select(`
      id, profile_id, course_id, revoked_at, revocation_reason,
      uni_courses ( title ),
      profiles:profile_id ( id, full_name ),
      uni_enrollments!inner ( profile_id, course_id, completed_at )
    `)
    .eq("revocation_reason", "expired")
    .lte("revoked_at", thirtyDaysAgo);

  if (od30Err) {
    summary.errors.push(`overdue30 query: ${od30Err.message}`);
  } else {
    // Find all HR/LMS admins to notify
    const { data: hrAdmins } = await sb
      .from("profiles")
      .select("id")
      .in("university_role", ["university_admin"])
      .eq("is_active", true);

    for (const cert of (overdue30 ?? [])) {
      const enrollment = cert.uni_enrollments as { completed_at: string | null }[] | { completed_at: string | null } | null;
      const completedAt = Array.isArray(enrollment)
        ? (enrollment[0]?.completed_at ?? null)
        : (enrollment?.completed_at ?? null);
      if (completedAt) continue;

      const learnerProfile = cert.profiles as unknown as { id: string; full_name: string } | null;
      const courseTitle = (cert.uni_courses as unknown as { title: string } | null)?.title ?? "a course";

      for (const admin of (hrAdmins ?? [])) {
        await notify(
          admin.id,
          "hr_escalation",
          `HR Alert: Training 30+ days overdue`,
          `${learnerProfile?.full_name ?? "An employee"} has not completed recertification for "${courseTitle}" — now 30+ days overdue. HR review may be required.`,
          ["in_app", "email"],
          "certificate",
          cert.id
        );
        summary.hr_escalations++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    ran_at: now.toISOString(),
    summary,
  });
}
