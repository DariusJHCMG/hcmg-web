import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// GET /api/university/search?q=<query>
//
// Full-text search across courses and lessons using PostgreSQL FTS.
// Uses the generated fts_vector columns added in migration 20260905.
//
// Returns:
//   courses[] — matching published courses
//   lessons[] — matching published lessons with their course title
//
// Security:
//   - Only published content is searchable by learners.
//   - Trainers/admins also see draft content.
//   - User must have university_access.

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") ?? "").trim();

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json({ courses: [], lessons: [] });
  }

  const isAdmin = profile.university_role === "university_admin"
    || profile.university_role === "trainer"
    || profile.role === "admin"
    || profile.role === "developer";

  const sb = createServiceClient();

  // Build queries in parallel
  const [{ data: courses }, { data: lessons }] = await Promise.all([
    // Course FTS search
    sb
      .from("uni_courses")
      .select("id, slug, title, description, category, path_tag, pill_color, duration_label, is_required, is_published, content_status")
      .textSearch("fts_vector", rawQuery, { type: "websearch", config: "english" })
      .eq("is_published", isAdmin ? undefined as unknown as boolean : true) // admins see drafts too
      .limit(12),

    // Lesson FTS search — include the course title via join
    sb
      .from("uni_lessons")
      .select("id, title, description, transcript, course_id, duration_label, is_published, uni_courses!inner(id, slug, title, is_published)")
      .textSearch("fts_vector", rawQuery, { type: "websearch", config: "english" })
      .eq("is_published", isAdmin ? undefined as unknown as boolean : true)
      .limit(20),
  ]);

  // For non-admins, also filter lessons to only include those whose parent course is published
  const filteredLessons = isAdmin
    ? (lessons ?? [])
    : (lessons ?? []).filter(l => {
        const c = l.uni_courses as unknown as { is_published: boolean } | null;
        return c?.is_published === true;
      });

  // Shape the lesson results — extract matched transcript snippet if present
  const lessonResults = filteredLessons.map(l => {
    const courseInfo = l.uni_courses as unknown as { id: string; slug: string; title: string } | null;
    // Extract a short snippet around the match from transcript
    let snippet: string | null = null;
    if (l.transcript) {
      const lc    = l.transcript.toLowerCase();
      const qLc   = rawQuery.toLowerCase().split(/\s+/)[0]; // first word
      const idx   = lc.indexOf(qLc);
      if (idx >= 0) {
        const start = Math.max(0, idx - 60);
        const end   = Math.min(l.transcript.length, idx + 140);
        snippet = (start > 0 ? "…" : "") + l.transcript.slice(start, end) + (end < l.transcript.length ? "…" : "");
      }
    }
    return {
      id:             l.id,
      title:          l.title,
      description:    l.description,
      duration_label: l.duration_label,
      course_id:      l.course_id,
      course_title:   courseInfo?.title ?? null,
      course_slug:    courseInfo?.slug  ?? null,
      snippet,
    };
  });

  return NextResponse.json({
    courses: courses ?? [],
    lessons: lessonResults,
    query:   rawQuery,
  });
}
