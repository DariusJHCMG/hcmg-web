import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";
import { sendUniEmail, uniEmailTemplate } from "@/lib/university/sendUniEmail";

// POST /api/university/admin/assign
//
// Phase 0 security changes:
//   - Now accepts JSON body (was: FormData — CSRF vulnerable).
//     JSON fetch requests require a CORS preflight on cross-origin requests,
//     making silent CSRF attacks from other tabs/origins impossible.
//   - Uses getVerifiedProfile() (server-validated token).
//   - Restricted to university_admin (was: any authenticated user could call).
//   - assigned_by is always set from the server-verified profile, not from
//     client-submitted body (prevents spoofing the actor identity).
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    course_id: string;
    assignment_type: string;
    profile_id?: string | null;
    target?: string | null;     // role name or department name for bulk-by-filter
    due_date?: string | null;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { course_id, assignment_type, profile_id, target, due_date } = body;

  if (!course_id) {
    return NextResponse.json({ error: "course_id is required" }, { status: 400 });
  }

  // Validate assignment_type
  const validTypes = ["companywide", "self", "role", "department", "manager"];
  if (!validTypes.includes(assignment_type)) {
    return NextResponse.json({ error: "Invalid assignment_type" }, { status: 400 });
  }

  const sb = createServiceClient();
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com";

  /** Send a course-assigned notification email to one learner */
  async function sendAssignmentEmail(recipientEmail: string, recipientName: string, courseTitle: string, courseSlug: string, dueDateStr?: string | null) {
    const dueLine = dueDateStr
      ? `<p style="margin:8px 0 0;font-size:13px;color:#b23b3b;font-weight:600;">Due by: ${new Date(dueDateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>`
      : "";
    const html = uniEmailTemplate({
      title: "You've been assigned a course",
      bodyHtml: `
        <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
          Hi ${recipientName ?? "there"},
        </p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
          You have been assigned a new training course in HCMG University:
        </p>
        <div style="padding:16px 20px;background:#f7f8fa;border-radius:10px;border-left:4px solid #f58220;margin-bottom:16px;">
          <div style="font-size:16px;font-weight:800;color:#071a2e;">${courseTitle}</div>
          ${dueLine}
        </div>
        <p style="margin:0;font-size:13px;color:#687383;line-height:1.6;">
          Log in to HCMG U and click the course to get started. Complete all lessons to earn your certificate.
        </p>`,
      ctaLabel: "Start Training →",
      ctaUrl:   `${BASE_URL}/university/course/${courseSlug}`,
    });
    await sendUniEmail({ to: recipientEmail, subject: `New training assigned: ${courseTitle}`, html });
  }

  // Verify the course exists and is published
  const { data: course } = await sb
    .from("uni_courses")
    .select("id, title, slug, is_published")
    .eq("id", course_id)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (!course.is_published) {
    return NextResponse.json({ error: "Cannot assign an unpublished course" }, { status: 400 });
  }

  /** Fetch emails+names for a list of profile IDs and send assignment emails */
  async function sendBulkAssignmentEmails(profileIds: string[]) {
    if (profileIds.length === 0) return;
    const { data: recipients } = await sb
      .from("profiles")
      .select("id, email, full_name")
      .in("id", profileIds);
    await Promise.allSettled(
      (recipients ?? [])
        .filter(r => r.email)
        .map(r => sendAssignmentEmail(r.email, r.full_name ?? "there", course!.title, course!.slug, due_date))
    );
  }

  // --- Role-based assignment ---
  if (assignment_type === "role") {
    if (!target) return NextResponse.json({ error: "target (role) is required" }, { status: 400 });
    const { data: matchedProfiles } = await sb
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .eq("university_access", true)
      .eq("role", target);

    const inserts = (matchedProfiles ?? []).map(p => ({
      profile_id:      p.id,
      course_id,
      assigned_by:     profile.id,
      assignment_type: "role",
      due_date:        due_date || null,
    }));
    if (inserts.length > 0) {
      await sb.from("uni_enrollments").upsert(inserts, { onConflict: "profile_id,course_id", ignoreDuplicates: true });
      await sendBulkAssignmentEmails(inserts.map(i => i.profile_id));
    }
    await logUniAudit("course_assigned_bulk", {
      actorId: profile.id, actorEmail: profile.email,
      entityType: "course", entityId: course_id,
      details: { assignment_type, target, count: inserts.length, due_date: due_date || null, course_title: course.title },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ ok: true, enrolled: inserts.length });
  }

  // --- Department-based assignment ---
  if (assignment_type === "department") {
    if (!target) return NextResponse.json({ error: "target (department) is required" }, { status: 400 });
    const { data: matchedProfiles } = await sb
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .eq("university_access", true)
      .eq("department", target);

    const inserts = (matchedProfiles ?? []).map(p => ({
      profile_id:      p.id,
      course_id,
      assigned_by:     profile.id,
      assignment_type: "department",
      due_date:        due_date || null,
    }));
    if (inserts.length > 0) {
      await sb.from("uni_enrollments").upsert(inserts, { onConflict: "profile_id,course_id", ignoreDuplicates: true });
      await sendBulkAssignmentEmails(inserts.map(i => i.profile_id));
    }
    await logUniAudit("course_assigned_bulk", {
      actorId: profile.id, actorEmail: profile.email,
      entityType: "course", entityId: course_id,
      details: { assignment_type, target, count: inserts.length, due_date: due_date || null, course_title: course.title },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ ok: true, enrolled: inserts.length });
  }

  // --- Companywide assignment ---
  if (assignment_type === "companywide") {
    const { data: allProfiles } = await sb
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .eq("university_access", true);

    const inserts = (allProfiles ?? []).map(p => ({
      profile_id:      p.id,
      course_id,
      assigned_by:     profile.id,
      assignment_type,
      due_date:        due_date || null,
    }));

    if (inserts.length > 0) {
      await sb.from("uni_enrollments").upsert(inserts, {
        onConflict: "profile_id,course_id",
        ignoreDuplicates: true,
      });
      await sendBulkAssignmentEmails(inserts.map(i => i.profile_id));
    }

    await logUniAudit("course_assigned_bulk", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "course",
      entityId: course_id,
      details: { assignment_type, count: inserts.length, due_date: due_date || null, course_title: course.title },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true, enrolled: inserts.length });
  }

  // --- Individual assignment ---
  if (profile_id) {
    const { data: targetUser } = await sb
      .from("profiles")
      .select("id, email, full_name, university_access, is_active")
      .eq("id", profile_id)
      .single();

    if (!targetUser || !targetUser.is_active) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 404 });
    }
    if (!targetUser.university_access) {
      return NextResponse.json({ error: "User does not have HCMG U access" }, { status: 400 });
    }

    await sb.from("uni_enrollments").upsert({
      profile_id,
      course_id,
      assigned_by:     profile.id,
      assignment_type: "self",
      due_date:        due_date || null,
    }, { onConflict: "profile_id,course_id", ignoreDuplicates: true });

    // Send assignment email
    if (targetUser.email) {
      await sendAssignmentEmail(targetUser.email, targetUser.full_name ?? "there", course.title, course.slug, due_date);
    }

    await logUniAudit("course_assigned", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "course",
      entityId: course_id,
      details: {
        profile_id,
        target_name: targetUser.full_name,
        due_date: due_date || null,
        course_title: course.title,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true, enrolled: 1 });
  }

  return NextResponse.json({ error: "No assignment target specified" }, { status: 400 });
}
