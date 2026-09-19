import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/assign
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const course_id       = formData.get("course_id") as string;
  const assignment_type = (formData.get("assignment_type") as string) ?? "self";
  const profile_id      = formData.get("profile_id") as string | null;
  const due_date        = formData.get("due_date") as string | null;

  if (!course_id) {
    return NextResponse.redirect(new URL("/university/admin/assignments?error=missing_course", request.url));
  }

  const sb = createServiceClient();

  if (assignment_type === "companywide" || (!profile_id && assignment_type !== "self")) {
    // Assign to all university_access users
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
      await sb.from("uni_enrollments").upsert(inserts, { onConflict: "profile_id,course_id", ignoreDuplicates: true });
    }

    await logUniAudit("course_assigned_bulk", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "course",
      entityId: course_id,
      details: { assignment_type, count: inserts.length, due_date },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
  } else if (profile_id) {
    await sb.from("uni_enrollments").upsert({
      profile_id,
      course_id,
      assigned_by:     profile.id,
      assignment_type: "self",
      due_date:        due_date || null,
    }, { onConflict: "profile_id,course_id", ignoreDuplicates: true });

    await logUniAudit("course_assigned", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "course",
      entityId: course_id,
      details: { profile_id, due_date },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
  }

  return NextResponse.redirect(new URL("/university/admin/assignments?success=1", request.url));
}
