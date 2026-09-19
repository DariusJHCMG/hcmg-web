import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityAdmin } from "@/lib/auth";

// GET /api/university/admin/export — streams CSV of completion data
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  const { data: enrollments } = await sb
    .from("uni_enrollments")
    .select(`
      profile_id,
      course_id,
      due_date,
      enrolled_at,
      profiles:profile_id ( full_name, email, role, department ),
      uni_courses:course_id ( title, is_required )
    `);

  if (!enrollments) {
    return new NextResponse("No data", { status: 500 });
  }

  // For each enrollment, look up progress (lessons completed / total)
  const { data: allProgress } = await sb
    .from("uni_progress")
    .select("profile_id, course_id, completed");

  const { data: allAttempts } = await sb
    .from("uni_quiz_attempts")
    .select("profile_id, lesson_id, score_pct, passed, attempted_at");

  const { data: allCerts } = await sb
    .from("uni_certificates")
    .select("profile_id, course_id, issued_at, revoked_at");

  const progressMap = new Map<string, { completed: number; total: number }>();
  (allProgress ?? []).forEach((p) => {
    const key = `${p.profile_id}:${p.course_id}`;
    const cur = progressMap.get(key) ?? { completed: 0, total: 0 };
    cur.total++;
    if (p.completed) cur.completed++;
    progressMap.set(key, cur);
  });

  const rows: string[] = [
    "Name,Email,Role,Department,Course,Required,Due Date,Enrolled At,Lessons Completed,Total Lessons,Completion %,Certificate Issued",
  ];

  for (const e of enrollments) {
    const p = (e.profiles as unknown) as { full_name: string; email: string; role: string; department: string | null } | null;
    const c = (e.uni_courses as unknown) as { title: string; is_required: boolean } | null;
    if (!p || !c) continue;

    const key = `${e.profile_id}:${e.course_id}`;
    const prog = progressMap.get(key) ?? { completed: 0, total: 0 };
    const pct  = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    const cert = (allCerts ?? []).find(
      cer => cer.profile_id === e.profile_id && cer.course_id === e.course_id && !cer.revoked_at
    );

    rows.push(
      [
        `"${p.full_name}"`,
        `"${p.email}"`,
        `"${p.role}"`,
        `"${p.department ?? ""}"`,
        `"${c.title}"`,
        c.is_required ? "Yes" : "No",
        e.due_date ?? "",
        new Date(e.enrolled_at).toLocaleDateString(),
        prog.completed,
        prog.total,
        `${pct}%`,
        cert ? new Date(cert.issued_at).toLocaleDateString() : "",
      ].join(",")
    );
  }

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="hcmg-u-report-${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
