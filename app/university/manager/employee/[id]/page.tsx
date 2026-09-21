import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, isUniversityManager, hasUniversityAccess } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Employee Training",
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ id: string }> }

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ManagerEmployeePage({ params }: Props) {
  const { id } = await params;
  const manager = await getCurrentProfile();
  if (!manager) redirect("/login?next=/university/manager");
  if (!hasUniversityAccess(manager)) redirect("/university");
  if (!isUniversityManager(manager)) redirect("/university");

  const sb = createServiceClient();

  // Verify this employee is actually a direct report of this manager
  const { data: employee } = await sb
    .from("profiles")
    .select("id, full_name, email, department, role, last_login_at, created_at, university_access, university_role")
    .eq("id", id)
    .eq("manager_id", manager.id)  // ← authorization: must be a direct report
    .eq("is_active", true)
    .maybeSingle();

  if (!employee) notFound();

  const [
    { data: enrollments },
    { data: progress },
    { data: certs },
    { data: attempts },
    { data: requiredCourses },
  ] = await Promise.all([
    sb.from("uni_enrollments")
      .select("course_id, due_date, enrolled_at, assignment_type, uni_courses!inner(id, slug, title, is_required, duration_label)")
      .eq("profile_id", id)
      .order("enrolled_at", { ascending: false }),
    sb.from("uni_progress")
      .select("course_id, lesson_id, completed, watch_pct, last_watched_at")
      .eq("profile_id", id),
    sb.from("uni_certificates")
      .select("id, course_id, issued_at, expires_at, verification_id, revoked_at, uni_courses!inner(title)")
      .eq("profile_id", id),
    sb.from("uni_quiz_attempts")
      .select("lesson_id, score_pct, passed, attempted_at, uni_lessons!lesson_id(title)")
      .eq("profile_id", id)
      .order("attempted_at", { ascending: false })
      .limit(20),
    sb.from("uni_courses")
      .select("id, title")
      .eq("is_required", true)
      .eq("is_published", true),
  ]);

  const now = new Date();

  // Build progress map per course
  const progressByCourse = new Map<string, { completed: number; total: number; lastWatched: string | null }>();
  for (const p of progress ?? []) {
    const cur = progressByCourse.get(p.course_id) ?? { completed: 0, total: 0, lastWatched: null };
    cur.total++;
    if (p.completed) cur.completed++;
    if (!cur.lastWatched || p.last_watched_at > cur.lastWatched) cur.lastWatched = p.last_watched_at;
    progressByCourse.set(p.course_id, cur);
  }

  const activeCerts = (certs ?? []).filter(c => !c.revoked_at);
  const certByCourse = new Map(activeCerts.map(c => [c.course_id, c]));

  const reqIds = new Set((requiredCourses ?? []).map(c => c.id));

  const enrollRows = (enrollments ?? []).map(e => {
    const course = e.uni_courses as unknown as { id: string; slug: string; title: string; is_required: boolean; duration_label: string | null } | null;
    const prog   = progressByCourse.get(e.course_id) ?? { completed: 0, total: 0, lastWatched: null };
    const pct    = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    const cert   = certByCourse.get(e.course_id);
    const isOverdue = e.due_date && pct < 100 && new Date(e.due_date) < now;
    const isExpiring = cert?.expires_at && !cert.revoked_at
      && new Date(cert.expires_at) > now
      && new Date(cert.expires_at) < new Date(now.getTime() + 30 * 86400000);
    return { e, course, prog, pct, cert, isOverdue, isExpiring };
  });

  const totalRequired     = enrollRows.filter(r => reqIds.has(r.e.course_id)).length;
  const completedRequired = enrollRows.filter(r => reqIds.has(r.e.course_id) && r.pct === 100).length;
  const overdueCount      = enrollRows.filter(r => r.isOverdue).length;
  const expiringCount     = enrollRows.filter(r => r.isExpiring).length;

  const PAD = "clamp(24px,4vw,48px) clamp(24px,6vw,64px)";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: PAD, color: "#fff",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Link href="/university/manager" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
            ← Team
          </Link>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 6 }}>
            Employee Training Record
          </p>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
            {employee.full_name}
          </h1>
          <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
            {employee.email}{employee.department ? ` · ${employee.department}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignSelf: "flex-end" }}>
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 20px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: completedRequired === totalRequired ? "#34d399" : "#f87171", fontFamily: "Manrope" }}>
              {completedRequired}/{totalRequired}
            </div>
            <div style={{ fontSize: 11, color: "#b9c5d0" }}>Required</div>
          </div>
          {overdueCount > 0 && (
            <div style={{ textAlign: "center", background: "rgba(248,113,113,0.12)", borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f87171", fontFamily: "Manrope" }}>{overdueCount}</div>
              <div style={{ fontSize: 11, color: "#b9c5d0" }}>Overdue</div>
            </div>
          )}
          {expiringCount > 0 && (
            <div style={{ textAlign: "center", background: "rgba(245,130,32,0.12)", borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f58220", fontFamily: "Manrope" }}>{expiringCount}</div>
              <div style={{ fontSize: 11, color: "#b9c5d0" }}>Expiring</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Enrolled courses */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
          Training ({enrollRows.length})
        </h2>

        {enrollRows.length === 0 ? (
          <p style={{ color: "#687383", fontSize: 14 }}>No courses enrolled.</p>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8", marginBottom: 32 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 680 }}>
              <thead>
                <tr style={{ background: "#071a2e" }}>
                  {["Course","Required","Due","Progress","Last Active","Certificate"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.course?.title ?? "—"}</div>
                      {row.isOverdue && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#f87171", background: "#fef2f2", padding: "1px 6px", borderRadius: 4, marginTop: 3, display: "inline-block" }}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", color: row.course?.is_required ? "#b23b3b" : "#687383", fontSize: 12 }}>
                      {row.course?.is_required ? "Yes" : "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: row.isOverdue ? "#f87171" : "#687383", fontWeight: row.isOverdue ? 700 : 400 }}>
                      {row.e.due_date ? fmtDate(row.e.due_date) : "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 72, height: 6, background: "#dfe4e8", borderRadius: 3 }}>
                          <div style={{ width: `${row.pct}%`, height: "100%", background: row.pct === 100 ? "#118568" : "#f58220", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: row.pct === 100 ? "#118568" : "#071a2e" }}>{row.pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#687383" }}>
                      {row.prog.lastWatched ? fmtDate(row.prog.lastWatched) : "Never"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {row.cert && !row.cert.revoked_at ? (
                        <div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>✓ Issued</span>
                          {row.cert.expires_at && (
                            <div style={{ fontSize: 10, color: row.isExpiring ? "#f58220" : "#687383", marginTop: 2 }}>
                              Exp {fmtDate(row.cert.expires_at)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "#687383" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent quiz attempts */}
        {(attempts ?? []).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
              Recent Quiz Attempts
            </h2>
            <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
              {(attempts ?? []).map((a, i) => {
                  const lessonTitle = (a.uni_lessons as unknown as { title: string } | null)?.title;
                  return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 16px", borderBottom: i < (attempts ?? []).length - 1 ? "1px solid #dfe4e8" : undefined,
                    background: i % 2 === 0 ? "#fff" : "#f7f8fa", fontSize: 13,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: a.passed ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                      color: a.passed ? "#118568" : "#f87171",
                    }}>
                      {a.passed ? "Passed" : "Failed"}
                    </span>
                    <span style={{ fontWeight: 700, color: "#071a2e" }}>{a.score_pct}%</span>
                    <span style={{ color: "#687383", flex: 1, fontSize: 13 }}>{lessonTitle ?? "—"}</span>
                    <span style={{ color: "#b9c5d0", fontSize: 11, whiteSpace: "nowrap" }}>{fmtDate(a.attempted_at)}</span>
                  </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Certificates */}
        {activeCerts.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
              Certificates ({activeCerts.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeCerts.map(cert => {
                const cInfo = cert.uni_courses as unknown as { title: string } | null;
                return (
                  <div key={cert.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(52,211,153,0.2)",
                    background: "rgba(52,211,153,0.04)",
                  }}>
                    <span style={{ fontSize: 20, color: "#34d399" }}>◈</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#071a2e" }}>{cInfo?.title ?? "Certificate"}</div>
                      <div style={{ fontSize: 12, color: "#687383", marginTop: 2 }}>
                        Issued {fmtDate(cert.issued_at)}
                        {cert.expires_at && ` · Expires ${fmtDate(cert.expires_at)}`}
                      </div>
                    </div>
                    <a
                      href={`/api/university/certificate/${cert.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 600, color: "#f58220", textDecoration: "none" }}
                    >
                      View →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
