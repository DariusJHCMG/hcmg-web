import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

// POST /api/university/admin/course/[id]/status
// Body: { action: "submit_review" | "approve" | "publish" | "archive" | "unpublish" | "revert_draft", notes?: string }
//
// Transitions:
//   submit_review — trainer or admin: draft → in_review
//   approve       — admin only:        in_review → approved
//   publish       — admin only:        approved → published (runs validation)
//   archive       — admin only:        any → archived
//   unpublish     — admin only:        published → approved
//   revert_draft  — admin only:        in_review / approved → draft
export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action: string; notes?: string; change_summary?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const sb = createServiceClient();

  // Fetch current course
  const { data: course } = await sb
    .from("uni_courses")
    .select("id, title, content_status, is_published")
    .eq("id", id)
    .single();

  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const current = course.content_status as string;
  const action  = body.action;

  // ── Validate transitions ──────────────────────────────────────────────────
  if (action === "submit_review") {
    if (current !== "draft") {
      return NextResponse.json({ error: "Only draft courses can be submitted for review" }, { status: 409 });
    }
    // Run basic validation before submit
    const validation = await validateCourse(sb, id);
    if (validation.errors.length > 0) {
      return NextResponse.json({ error: "Course has validation errors", errors: validation.errors }, { status: 422 });
    }
  } else if (action === "approve") {
    if (!isUniversityAdmin(profile)) {
      return NextResponse.json({ error: "Only admins can approve courses" }, { status: 403 });
    }
    if (current !== "in_review") {
      return NextResponse.json({ error: "Only courses in review can be approved" }, { status: 409 });
    }
  } else if (action === "publish") {
    if (!isUniversityAdmin(profile)) {
      return NextResponse.json({ error: "Only admins can publish courses" }, { status: 403 });
    }
    if (current !== "approved") {
      return NextResponse.json({ error: "Only approved courses can be published" }, { status: 409 });
    }
    // Run full validation before publish
    const validation = await validateCourse(sb, id);
    if (validation.errors.length > 0) {
      return NextResponse.json({ error: "Course is not ready to publish", errors: validation.errors }, { status: 422 });
    }
  } else if (action === "archive") {
    if (!isUniversityAdmin(profile)) {
      return NextResponse.json({ error: "Only admins can archive courses" }, { status: 403 });
    }
  } else if (action === "unpublish") {
    if (!isUniversityAdmin(profile)) {
      return NextResponse.json({ error: "Only admins can unpublish courses" }, { status: 403 });
    }
    if (current !== "published") {
      return NextResponse.json({ error: "Only published courses can be unpublished" }, { status: 409 });
    }
  } else if (action === "revert_draft") {
    if (!isUniversityAdmin(profile)) {
      return NextResponse.json({ error: "Only admins can revert courses to draft" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  // ── Apply transition ──────────────────────────────────────────────────────
  const STATUS_MAP: Record<string, string> = {
    submit_review: "in_review",
    approve:       "approved",
    publish:       "published",
    archive:       "archived",
    unpublish:     "approved",
    revert_draft:  "draft",
  };

  const newStatus    = STATUS_MAP[action];
  const isPublished  = newStatus === "published";

  const updatePayload: Record<string, unknown> = {
    content_status: newStatus,
    is_published:   isPublished,
    updated_at:     new Date().toISOString(),
  };

  if (action === "submit_review") {
    updatePayload.submitted_by = profile.id;
    updatePayload.submitted_at = new Date().toISOString();
  }
  if (action === "approve" || action === "publish") {
    updatePayload.reviewed_by   = profile.id;
    updatePayload.reviewed_at   = new Date().toISOString();
    if (body.notes) updatePayload.review_notes = body.notes;
  }

  const { data: updated, error } = await sb
    .from("uni_courses")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create version snapshot on publish
  if (action === "publish") {
    const { data: lessons } = await sb
      .from("uni_lessons")
      .select("*")
      .eq("course_id", id)
      .order("sort_order");

    const { count: prevVersions } = await sb
      .from("uni_course_versions")
      .select("id", { count: "exact", head: true })
      .eq("course_id", id);

    await sb.from("uni_course_versions").insert({
      course_id:      id,
      version_number: (prevVersions ?? 0) + 1,
      snapshot:       { course: updated, lessons: lessons ?? [] },
      change_summary: body.change_summary || `Published by ${profile.email}`,
      published_by:   profile.id,
    });
  }

  await logUniAudit(`course_${action}`, {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "course", entityId: id,
    details: { title: course.title, from_status: current, to_status: newStatus, notes: body.notes },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(updated);
}

// GET /api/university/admin/course/[id]/status — validate course readiness
export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const validation = await validateCourse(sb, id);
  return NextResponse.json(validation);
}

// ── Course validation helper ──────────────────────────────────────────────────
async function validateCourse(sb: ReturnType<typeof createServiceClient>, courseId: string) {
  const errors: { field: string; message: string }[] = [];
  const warnings: { field: string; message: string }[] = [];
  const checks: { label: string; ok: boolean }[] = [];

  // Fetch course
  const { data: course } = await sb
    .from("uni_courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) {
    return { valid: false, errors: [{ field: "course", message: "Course not found" }], warnings: [], checks: [] };
  }

  // Title
  checks.push({ label: "Course title", ok: !!course.title?.trim() });
  if (!course.title?.trim()) errors.push({ field: "title", message: "Course title is required" });

  // Description
  checks.push({ label: "Course description", ok: !!course.description?.trim() });
  if (!course.description?.trim()) errors.push({ field: "description", message: "Course description is required" });

  // Thumbnail
  checks.push({ label: "Course thumbnail", ok: !!course.thumbnail_url?.trim() });
  if (!course.thumbnail_url?.trim()) warnings.push({ field: "thumbnail_url", message: "Course thumbnail is missing" });

  // Lessons
  const { data: lessons, count: lessonCount } = await sb
    .from("uni_lessons")
    .select("id, title, is_published, lesson_type", { count: "exact" })
    .eq("course_id", courseId);

  checks.push({ label: "At least one lesson", ok: (lessonCount ?? 0) > 0 });
  if ((lessonCount ?? 0) === 0) {
    errors.push({ field: "lessons", message: "Course must have at least one lesson" });
  }

  const publishedLessons = (lessons ?? []).filter(l => l.is_published);
  checks.push({ label: "At least one published lesson", ok: publishedLessons.length > 0 });
  if ((lessonCount ?? 0) > 0 && publishedLessons.length === 0) {
    errors.push({ field: "lessons", message: "At least one lesson must be published" });
  }

  // Check completion rules
  const rules = course.completion_rules as { require_assessment?: boolean } ?? {};

  // Assessment check (only if required)
  if (rules.require_assessment) {
    const { count: assessmentCount } = await sb
      .from("uni_assessments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("is_active", true);

    checks.push({ label: "Final assessment", ok: (assessmentCount ?? 0) > 0 });
    if ((assessmentCount ?? 0) === 0) {
      errors.push({ field: "assessment", message: "Course requires a final assessment" });
    }
  }

  // Certificate config
  const { data: certConfig } = await sb
    .from("uni_certificate_config")
    .select("id")
    .eq("course_id", courseId)
    .maybeSingle();

  checks.push({ label: "Certificate settings", ok: !!certConfig });
  if (!certConfig) warnings.push({ field: "certificate", message: "No certificate configuration — learners will not receive certificates" });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checks,
  };
}
