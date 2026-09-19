import { redirect } from "next/navigation";
import { getCurrentProfile, hasUniversityAccess, isUniversityManager } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Manager Dashboard",
  robots: { index: false, follow: false },
};

// ── helpers ───────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(d: string | null): string {
  if (!d) return "Never";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pctColor(pct: number): string {
  if (pct >= 80) return "#34d399";
  if (pct >= 50) return "#f58220";
  return "#f87171";
}

// ── page ─────────────────────────────────────────────────────
export default async function ManagerDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/university/manager");
  if (!hasUniversityAccess(profile)) redirect("/university");
  if (!isUniversityManager(profile)) redirect("/university");

  const sb = createServiceClient();

  // 1. Direct reports
  const { data: reports } = await sb
    .from("profiles")
    .select("id, full_name, email, department, last_login_at")
    .eq("manager_id", profile.id)
    .eq("is_active", true)
    .eq("university_access", true)
    .order("full_name");

  const reportIds: string[] = (reports ?? []).map((r) => r.id);

  if (reportIds.length === 0) {
    return <NoReportsState name={profile.full_name} />;
  }

  // 2. Required courses
  const { data: requiredCourses } = await sb
    .from("uni_courses")
    .select("id, title")
    .eq("is_required", true)
    .eq("is_published", true);

  const requiredCourseIds = new Set((requiredCourses ?? []).map((c) => c.id));

  // 3. Enrollments for team
  const { data: enrollments } = await sb
    .from("uni_enrollments")
    .select("profile_id, course_id, due_date")
    .in("profile_id", reportIds);

  // 4. Progress for team
  const { data: progress } = await sb
    .from("uni_progress")
    .select("profile_id, course_id, completed, last_watched_at")
    .in("profile_id", reportIds);

  // 5. Certificates for team (not revoked)
  const { data: certs } = await sb
    .from("uni_certificates")
    .select("profile_id, course_id, expires_at")
    .in("profile_id", reportIds)
    .is("revoked_at", null);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // ── Build per-employee stats ───────────────────────────────
  type EmployeeRow = {
    id: string;
    full_name: string;
    email: string;
    department: string | null;
    last_login_at: string | null;
    enrolled_total: number;
    lessons_completed: number;
    lessons_total: number;
    required_complete: number;
    required_total: number;
    overdue: { course_id: string; title: string; due_date: string }[];
    expiring_certs: { course_id: string; expires_at: string }[];
    last_active: string | null;
  };

  // Progress maps
  const progressByKey = new Map<string, { completed: number; total: number; lastWatched: string | null }>();
  for (const p of progress ?? []) {
    const k = `${p.profile_id}:${p.course_id}`;
    const cur = progressByKey.get(k) ?? { completed: 0, total: 0, lastWatched: null };
    cur.total++;
    if (p.completed) cur.completed++;
    if (!cur.lastWatched || p.last_watched_at > cur.lastWatched) cur.lastWatched = p.last_watched_at;
    progressByKey.set(k, cur);
  }

  const certSet = new Map<string, string | null>();
  for (const c of certs ?? []) {
    certSet.set(`${c.profile_id}:${c.course_id}`, c.expires_at ?? null);
  }

  // Title lookup
  const courseTitleMap = new Map<string, string>(
    (requiredCourses ?? []).map((c) => [c.id, c.title])
  );

  const rows: EmployeeRow[] = (reports ?? []).map((rep) => {
    const myEnrollments = (enrollments ?? []).filter((e) => e.profile_id === rep.id);
    const myProgress = (progress ?? []).filter((p) => p.profile_id === rep.id);

    // Lesson-level totals across all courses
    let lessonsCompleted = 0;
    let lessonsTotal = 0;
    const courseLastWatched = new Map<string, string>();
    for (const p of myProgress) {
      lessonsTotal++;
      if (p.completed) lessonsCompleted++;
      const cur = courseLastWatched.get(p.course_id);
      if (!cur || p.last_watched_at > cur) courseLastWatched.set(p.course_id, p.last_watched_at);
    }

    // Last active = max(last_watched_at) across all progress for this user
    const lastActive = myProgress.reduce<string | null>((best, p) => {
      if (!best) return p.last_watched_at;
      return p.last_watched_at > best ? p.last_watched_at : best;
    }, null);

    // Required course completion
    const myRequiredEnrollments = myEnrollments.filter((e) => requiredCourseIds.has(e.course_id));
    let requiredComplete = 0;
    const overdue: EmployeeRow["overdue"] = [];

    for (const enr of myRequiredEnrollments) {
      const k = `${rep.id}:${enr.course_id}`;
      const prog = progressByKey.get(k);
      const pct = prog && prog.total > 0 ? prog.completed / prog.total : 0;
      if (pct === 1) {
        requiredComplete++;
      } else if (enr.due_date && new Date(enr.due_date) < now) {
        overdue.push({
          course_id: enr.course_id,
          title: courseTitleMap.get(enr.course_id) ?? enr.course_id,
          due_date: enr.due_date,
        });
      }
    }

    // Expiring certs within 30 days
    const expiringCerts: EmployeeRow["expiring_certs"] = [];
    for (const enr of myEnrollments) {
      const expiresAt = certSet.get(`${rep.id}:${enr.course_id}`);
      if (expiresAt && new Date(expiresAt) > now && new Date(expiresAt) < in30) {
        expiringCerts.push({ course_id: enr.course_id, expires_at: expiresAt });
      }
    }

    return {
      id: rep.id,
      full_name: rep.full_name,
      email: rep.email,
      department: rep.department,
      last_login_at: rep.last_login_at,
      enrolled_total: myEnrollments.length,
      lessons_completed: lessonsCompleted,
      lessons_total: lessonsTotal,
      required_complete: requiredComplete,
      required_total: myRequiredEnrollments.length,
      overdue,
      expiring_certs: expiringCerts,
      last_active: lastActive,
    };
  });

  // ── Aggregate stats ────────────────────────────────────────
  const totalTeam = rows.length;
  const totalRequiredSlots = rows.reduce((s, r) => s + r.required_total, 0);
  const totalRequiredComplete = rows.reduce((s, r) => s + r.required_complete, 0);
  const teamCompliancePct =
    totalRequiredSlots > 0 ? Math.round((totalRequiredComplete / totalRequiredSlots) * 100) : 0;
  const overdueEmployeeCount = rows.filter((r) => r.overdue.length > 0).length;
  const expiringCertCount = rows.reduce((s, r) => s + r.expiring_certs.length, 0);

  // ── At-risk: required course due in ≤14 days with 0% progress ──
  const atRisk: { name: string; course: string; due_date: string; days: number }[] = [];
  for (const row of rows) {
    const myEnr = (enrollments ?? []).filter(
      (e) => e.profile_id === row.id && requiredCourseIds.has(e.course_id)
    );
    for (const enr of myEnr) {
      if (!enr.due_date) continue;
      const days = daysUntil(enr.due_date);
      if (days > 14 || days < 0) continue;
      const k = `${row.id}:${enr.course_id}`;
      const prog = progressByKey.get(k);
      const pct = prog && prog.total > 0 ? prog.completed / prog.total : 0;
      if (pct === 0) {
        atRisk.push({
          name: row.full_name,
          course: courseTitleMap.get(enr.course_id) ?? enr.course_id,
          due_date: enr.due_date,
          days,
        });
      }
    }
  }

  const PAGE_PAD = "clamp(28px,4vw,52px) clamp(24px,6vw,64px)";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: PAGE_PAD,
        color: "#fff",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
            ← HCMG U
          </Link>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
            Manager Dashboard
          </p>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui", marginBottom: 4 }}>
            Team Training
          </h1>
          <p style={{ fontSize: 13, color: "#b9c5d0" }}>{profile.full_name} · {totalTeam} direct report{totalTeam !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Stats bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: "Team Members", value: totalTeam, color: "#071a2e" },
            {
              label: "Team Compliance",
              value: `${teamCompliancePct}%`,
              color: pctColor(teamCompliancePct),
              sub: `${totalRequiredComplete} / ${totalRequiredSlots} required complete`,
            },
            {
              label: "Employees Overdue",
              value: overdueEmployeeCount,
              color: overdueEmployeeCount > 0 ? "#f87171" : "#34d399",
            },
            {
              label: "Certs Expiring (30d)",
              value: expiringCertCount,
              color: expiringCertCount > 0 ? "#f58220" : "#34d399",
            },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#f7f8fa", border: "1px solid #dfe4e8",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: s.color, fontFamily: "Manrope, system-ui" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#687383", marginTop: 2 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 11, color: "#687383", marginTop: 2 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* At-risk panel */}
        {atRisk.length > 0 && (
          <div style={{
            background: "#fff8ed", border: "1px solid #f58220",
            borderRadius: 12, padding: "20px 24px", marginBottom: 28,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c46b00", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
              ⚠ At-Risk — Required training due within 14 days, not yet started
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {atRisk.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: "#071a2e", minWidth: 160 }}>{r.name}</span>
                  <span style={{ color: "#687383", flex: 1 }}>{r.course}</span>
                  <span style={{
                    fontWeight: 700, fontSize: 11,
                    color: r.days <= 7 ? "#f87171" : "#f58220",
                    whiteSpace: "nowrap",
                  }}>
                    {r.days === 0 ? "Due today" : `${r.days}d left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team table */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
          Team Overview
        </h2>
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 780 }}>
            <thead>
              <tr style={{ background: "#071a2e" }}>
                {["Employee", "Required Training", "Overall Progress", "Overdue", "Last Active", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.8px",
                    color: "#687383", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const overallPct =
                  row.lessons_total > 0
                    ? Math.round((row.lessons_completed / row.lessons_total) * 100)
                    : 0;
                const reqPct =
                  row.required_total > 0
                    ? Math.round((row.required_complete / row.required_total) * 100)
                    : 100;

                return (
                  <tr key={row.id} style={{
                    borderBottom: "1px solid #dfe4e8",
                    background: i % 2 === 0 ? "#fff" : "#f7f8fa",
                  }}>
                    {/* Employee */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.full_name}</div>
                      <div style={{ fontSize: 11, color: "#687383" }}>{row.email}</div>
                      {row.department && (
                        <div style={{ fontSize: 10, color: "#b9c5d0", marginTop: 2 }}>{row.department}</div>
                      )}
                    </td>

                    {/* Required */}
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontWeight: 700, color: pctColor(reqPct) }}>
                        {row.required_complete} / {row.required_total}
                      </span>
                      <span style={{ fontSize: 11, color: "#687383", marginLeft: 6 }}>
                        {row.required_total === 0 ? "none assigned" : `(${reqPct}%)`}
                      </span>
                    </td>

                    {/* Progress bar */}
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 6, width: 80, background: "#dfe4e8", borderRadius: 3, flexShrink: 0 }}>
                          <div style={{
                            height: "100%",
                            width: `${overallPct}%`,
                            background: overallPct === 100 ? "#118568" : "#f58220",
                            borderRadius: 3,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: overallPct === 100 ? "#118568" : "#071a2e" }}>
                          {overallPct}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#687383", marginTop: 2 }}>
                        {row.enrolled_total} enrolled
                      </div>
                    </td>

                    {/* Overdue */}
                    <td style={{ padding: "13px 14px" }}>
                      {row.overdue.length > 0 ? (
                        <div>
                          <span style={{
                            display: "inline-block",
                            background: "#fef2f2", color: "#f87171",
                            fontWeight: 700, fontSize: 11,
                            padding: "2px 8px", borderRadius: 20,
                          }}>
                            {row.overdue.length} overdue
                          </span>
                          {row.overdue.slice(0, 2).map((o) => (
                            <div key={o.course_id} style={{ fontSize: 11, color: "#f87171", marginTop: 3 }}>
                              {o.title}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: "#687383", fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Last active */}
                    <td style={{ padding: "13px 14px", color: "#687383", fontSize: 12 }}>
                      {formatDate(row.last_active)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "13px 14px" }}>
                      <Link
                        href={`/university/manager/employee/${row.id}`}
                        style={{
                          fontSize: 12, fontWeight: 600, color: "#f58220",
                          textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expiring certs */}
        {expiringCertCount > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
              Certificates Expiring Within 30 Days
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
              {rows
                .filter((r) => r.expiring_certs.length > 0)
                .flatMap((r) =>
                  r.expiring_certs.map((ec) => ({
                    name: r.full_name,
                    email: r.email,
                    course: courseTitleMap.get(ec.course_id) ?? ec.course_id,
                    expires_at: ec.expires_at,
                    days: daysUntil(ec.expires_at),
                  }))
                )
                .sort((a, b) => a.days - b.days)
                .map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    borderBottom: "1px solid #dfe4e8",
                    background: i % 2 === 0 ? "#fff" : "#f7f8fa",
                    fontSize: 13,
                  }}>
                    <span style={{ fontWeight: 600, color: "#071a2e", minWidth: 160 }}>{item.name}</span>
                    <span style={{ flex: 1, color: "#687383" }}>{item.course}</span>
                    <span style={{ fontSize: 11, color: "#f58220", whiteSpace: "nowrap" }}>
                      Expires {formatDate(item.expires_at)}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: item.days <= 7 ? "#f87171" : "#f58220",
                      whiteSpace: "nowrap",
                    }}>
                      {item.days}d
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function NoReportsState({ name }: { name: string }) {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,52px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
          ← HCMG U
        </Link>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          Manager Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>{name}</p>
      </div>
      <div style={{
        maxWidth: 560, margin: "80px auto 0",
        padding: "40px 32px", textAlign: "center",
        border: "1px solid #dfe4e8", borderRadius: 16,
      }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>👥</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#071a2e", marginBottom: 10 }}>
          No direct reports found
        </h2>
        <p style={{ fontSize: 14, color: "#687383", lineHeight: 1.7 }}>
          Your team list is empty. If you believe this is an error, contact your LMS administrator to link your direct reports to your profile.
        </p>
        <Link href="/university" style={{
          display: "inline-block", marginTop: 24,
          padding: "11px 24px", borderRadius: 10,
          background: "linear-gradient(135deg,#FF9847,#F37021)",
          color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}>
          ← Back to HCMG U
        </Link>
      </div>
    </div>
  );
}
