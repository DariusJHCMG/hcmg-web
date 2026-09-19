import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

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
    due_date?: string | null;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { course_id, assignment_type, profile_id, due_date } = body;

  if (!course_id) {
    return NextResponse.json({ error: "course_id is required" }, { status: 400 });
  }

  // Validate assignment_type
  const validTypes = ["companywide", "self", "role", "department", "manager"];
  if (!validTypes.includes(assignment_type)) {
    return NextResponse.json({ error: "Invalid assignment_type" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Verify the course exists and is published
  const { data: course } = await sb
    .from("uni_courses")
    .select("id, title, is_published")
    .eq("id", course_id)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (!course.is_published) {
    return NextResponse.json({ error: "Cannot assign an unpublished course" }, { status: 400 });
  }

  if (assignment_type === "companywide" || (!profile_id && assignment_type !== "self")) {
    // Bulk assign to all active university_access users
    const { data: allProfiles } = await sb
      .from("profiles")
      .select("id")
      .eq("is_active", true)
      .eq("university_access", true);

    const inserts = (allProfiles ?? []).map(p => ({
      profile_id:      p.id,
      course_id,
      assigned_by:     profile.id,   // always from verified server profile
      assignment_type,
      due_date:        due_date || null,
    }));

    if (inserts.length > 0) {
      await sb.from("uni_enrollments").upsert(inserts, {
        onConflict: "profile_id,course_id",
        ignoreDuplicates: true,
      });
    }

    await logUniAudit("course_assigned_bulk", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "course",
      entityId: course_id,
      details: {
        assignment_type,
        count: inserts.length,
        due_date: due_date || null,
        course_title: course.title,
      },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({ ok: true, enrolled: inserts.length });
  }

  if (profile_id) {
    // Individual assignment — verify the target user exists and has university access
    const { data: targetUser } = await sb
      .from("profiles")
      .select("id, full_name, university_access, is_active")
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
      assigned_by:     profile.id,  // always from verified server profile
      assignment_type: "self",
      due_date:        due_date || null,
    }, { onConflict: "profile_id,course_id", ignoreDuplicates: true });

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
