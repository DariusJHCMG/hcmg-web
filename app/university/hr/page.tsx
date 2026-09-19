import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | HR Training Overview",
  robots: { index: false, follow: false },
};

// ── helpers ───────────────────────────────────────────────────
function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function pctColor(pct: number): string {
  if (pct >= 90) return "#34d399";
  if (pct >= 70) return "#f58220";
  return "#f87171";
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── page ─────────────────────────────────────────────────────
export default async function HRDashboardPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/hr");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();
  const now = new Date();
  const in7  = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);
  const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { data: employees },
    { data: requiredCourses },
    { data: enrollments },
    { data: progress },
    { data: certs },
  ] = await Promise.all([
    sb
      .from("profiles")
      .select("id, full_name, email, department, university_role, last_login_at, created_at")
      .eq("is_active", true)
      .eq("university_access", true)
      .order("full_name"),
    sb
      .from("uni_courses")
      .select("id, title")
      .eq("is_required", true)
      .eq("is_published", true),
    sb
      .from("uni_enrollments")
      .select("profile_id, course_id, due_date, enrolled_at"),
    sb
      .from("uni_progress")
      .select("profile_id, course_id, completed"),
    sb
      .from("uni_certificates")
      .select("profile_id, course_id, issued_at, expires_at")
      .is("revoked_at", null),
  ]);

  const allEmployees   = employees ?? [];
  const allRequired    = requiredCourses ?? [];
  const allEnrollments = enrollments ?? [];
  const allProgress    = progress ?? [];
  const allCerts       = certs ?? [];

  const requiredIds = new Set(allRequired.map((c) => c.id));

  // ── Per-employee completion map ───────────────────────────
  // key = `${profile_id}:${course_id}`, value = completed lesson count / total
  const progressByKey = new Map<string, { completed: number; total: number }>();
  for (const p of allProgress) {
    const k = `${p.profile_id}:${p.course_id}`;
    const cur = progressByKey.get(k) ?? { completed: 0, total: 0 };
    cur.total++;
    if (p.completed) cur.completed++;
    progressByKey.set(k, cur);
  }

  const certSet = new Set(allCerts.map((c) => `${c.profile_id}:${c.course_id}`));

  // Employee is "fully compliant" = all required courses have pct = 1
  function isCompliant(empId: string): boolean {
    for (const req of allRequired) {
      const k = `${empId}:${req.id}`;
      const prog = progressByKey.get(k);
      if (!prog || prog.total === 0 || prog.completed < prog.total) return false;
    }
    return true;
  }

  // ── Overall compliance ────────────────────────────────────
  const totalEmployees = allEmployees.length;
  const compliantCount = allRequired.length === 0
    ? totalEmployees
    : allEmployees.filter((e) => isCompliant(e.id)).length;
  const overallPct = totalEmployees > 0
    ? Math.round((compliantCount / totalEmployees) * 100)
    : 0;

  // ── Department breakdown ──────────────────────────────────
  const deptMap = new Map<string, { total: number; compliant: number }>();
  for (const emp of allEmployees) {
    const dept = emp.department ?? "Unassigned";
    const cur = deptMap.get(dept) ?? { total: 0, compliant: 0 };
    cur.total++;
    if (isCompliant(emp.id)) cur.compliant++;
    deptMap.set(dept, cur);
  }
  const deptRows = Array.from(deptMap.entries())
    .map(([dept, d]) => ({ dept, ...d, pct: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct); // worst first

  // ── Non-compliant employees ────────────────────────────────
  type NonCompliantRow = {
    id: string;
    full_name: string;
    email: string;
    department: string | null;
    missing_courses: string[];
    max_overdue_days: number;
    last_login_at: string | null;
  };

  const nonCompliantRows: NonCompliantRow[] = [];
  for (const emp of allEmployees) {
    if (allRequired.length === 0 || isCompliant(emp.id)) continue;
    const missing: string[] = [];
    let maxOverdueDays = 0;
    for (const req of allRequired) {
      const k = `${emp.id}:${req.id}`;
      const prog = progressByKey.get(k);
      if (!prog || prog.total === 0 || prog.completed < prog.total) {
        missing.push(req.title);
        // Check if enrolled and due
        const enr = allEnrollments.find((e) => e.profile_id === emp.id && e.course_id === req.id);
        if (enr?.due_date) {
          const overdueDays = Math.max(0, Math.ceil((now.getTime() - new Date(enr.due_date).getTime()) / (1000 * 60 * 60 * 24)));
          if (overdueDays > maxOverdueDays) maxOverdueDays = overdueDays;
        }
      }
    }
    if (missing.length > 0) {
      nonCompliantRows.push({
        id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        department: emp.department,
        missing_courses: missing,
        max_overdue_days: maxOverdueDays,
        last_login_at: emp.last_login_at,
      });
    }
  }
  nonCompliantRows.sort((a, b) => b.max_overdue_days - a.max_overdue_days);

  // ── Certificate expiry buckets ─────────────────────────────
  type CertExpiry = { full_name: string; email: string; course: string; expires_at: string; days: number };

  const courseTitleMap = new Map(allRequired.map((c) => [c.id, c.title]));
  // Also gather non-required course titles for certs
  const { data: allCoursesForTitles } = await sb.from("uni_courses").select("id, title");
  for (const c of allCoursesForTitles ?? []) courseTitleMap.set(c.id, c.title);

  const empMap = new Map(allEmployees.map((e) => [e.id, e]));

  const expiring7:  CertExpiry[] = [];
  const expiring14: CertExpiry[] = [];
  const expiring30: CertExpiry[] = [];

  for (const cert of allCerts) {
    if (!cert.expires_at) continue;
    const expDate = new Date(cert.expires_at);
    if (expDate < now) continue; // already expired — not in these buckets
    const emp = empMap.get(cert.profile_id);
    if (!emp) continue;
    const days = daysUntil(cert.expires_at);
    const entry: CertExpiry = {
      full_name: emp.full_name,
      email: emp.email,
      course: courseTitleMap.get(cert.course_id) ?? cert.course_id,
      expires_at: cert.expires_at,
      days,
    };
    if (expDate <= in7)       expiring7.push(entry);
    else if (expDate <= in14) expiring14.push(entry);
    else if (expDate <= in30) expiring30.push(entry);
  }
  expiring7.sort((a, b) => a.days - b.days);
  expiring14.sort((a, b) => a.days - b.days);
  expiring30.sort((a, b) => a.days - b.days);
  const totalExpiringThisMonth = expiring7.length + expiring14.length + expiring30.length;

  // ── New hires (last 30 days) ───────────────────────────────
  const newHires = allEmployees.filter((e) => e.created_at && new Date(e.created_at) > ago30);
  type NewHireRow = { full_name: string; email: string; enrolled_required: number; completed_required: number; created_at: string };
  const newHireRows: NewHireRow[] = newHires.map((emp) => {
    let enrolled = 0;
    let completed = 0;
    for (const req of allRequired) {
      const enr = allEnrollments.find((e) => e.profile_id === emp.id && e.course_id === req.id);
      if (enr) {
        enrolled++;
        const k = `${emp.id}:${req.id}`;
        const prog = progressByKey.get(k);
        if (prog && prog.total > 0 && prog.completed === prog.total) completed++;
      }
    }
    return { full_name: emp.full_name, email: emp.email, enrolled_required: enrolled, completed_required: completed, created_at: emp.created_at };
  });

  const PAGE_PAD = "clamp(28px,4vw,52px) clamp(24px,6vw,64px)";
  const TABLE_HEADER_STYLE: React.CSSProperties = {
    padding: "10px 14px", textAlign: "left",
    fontSize: 10, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.8px",
    color: "#687383", whiteSpace: "nowrap",
  };

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
          <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
            ← Admin
          </Link>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
            HR Training Overview
          </p>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui", marginBottom: 4 }}>
            Employee Training
          </h1>
          <p style={{ fontSize: 12, color: "#687383" }}>Internal use — authorized HR personnel only</p>
        </div>
        <a
          href="/api/university/admin/export"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "11px 20px", borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none",
            alignSelf: "flex-end",
          }}
        >
          ↓ Export CSV
        </a>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 72px" }}>

        {/* Compliance summary — big numbers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            {
              value: `${overallPct}%`,
              color: pctColor(overallPct),
              label: "Overall Compliance",
              sub: `${compliantCount} of ${totalEmployees} employees`,
            },
            { value: totalEmployees, color: "#071a2e", label: "Active Employees" },
            { value: allRequired.length, color: "#071a2e", label: "Required Courses" },
            {
              value: totalExpiringThisMonth,
              color: totalExpiringThisMonth > 0 ? "#f58220" : "#34d399",
              label: "Certs Expiring This Month",
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

        {/* Department breakdown */}
        {deptRows.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
              Department Breakdown
            </h2>
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#071a2e" }}>
                    {["Department", "Employees", "Compliant", "%", "Status"].map((h) => (
                      <th key={h} style={TABLE_HEADER_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptRows.map((row, i) => (
                    <tr key={row.dept} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, color: "#071a2e" }}>{row.dept}</td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.total}</td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.compliant}</td>
                      <td style={{ padding: "11px 14px", fontWeight: 700, color: pctColor(row.pct) }}>{row.pct}%</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 20,
                          background: row.pct >= 90 ? "#d1fae5" : row.pct >= 70 ? "#fff3cd" : "#fee2e2",
                          color: row.pct >= 90 ? "#065f46" : row.pct >= 70 ? "#92400e" : "#991b1b",
                        }}>
                          {row.pct >= 90 ? "On Track" : row.pct >= 70 ? "Needs Attention" : "At Risk"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Non-compliant employees */}
        {nonCompliantRows.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
              Missing Required Training
            </h2>
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#071a2e" }}>
                    {["Employee", "Department", "Missing Courses", "Days Overdue", "Last Active"].map((h) => (
                      <th key={h} style={TABLE_HEADER_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nonCompliantRows.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.full_name}</div>
                        <div style={{ fontSize: 11, color: "#687383" }}>{row.email}</div>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.department ?? "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        {row.missing_courses.slice(0, 3).map((c, j) => (
                          <div key={j} style={{ fontSize: 12, color: "#f87171" }}>{c}</div>
                        ))}
                        {row.missing_courses.length > 3 && (
                          <div style={{ fontSize: 11, color: "#687383" }}>+{row.missing_courses.length - 3} more</div>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {row.max_overdue_days > 0 ? (
                          <span style={{ fontWeight: 700, color: "#f87171" }}>{row.max_overdue_days}d</span>
                        ) : (
                          <span style={{ color: "#687383" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#687383" }}>
                        {formatDate(row.last_login_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Certificate expiry panel */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
            Certificate Expiry
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { label: "Critical — Expiring in 7 days", items: expiring7, borderColor: "#f87171", bg: "#fef2f2", tagColor: "#f87171" },
              { label: "Urgent — Expiring in 14 days",  items: expiring14, borderColor: "#f58220", bg: "#fff8ed", tagColor: "#f58220" },
              { label: "Warning — Expiring in 30 days", items: expiring30, borderColor: "#fbbf24", bg: "#fffbeb", tagColor: "#b45309" },
            ].map(({ label, items, borderColor, bg, tagColor }) => (
              <div key={label} style={{ borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: tagColor }}>{label}</span>
                  <span style={{ fontSize: 12, color: "#687383", marginLeft: 8 }}>{items.length} cert{items.length !== 1 ? "s" : ""}</span>
                </div>
                {items.length === 0 ? (
                  <div style={{ padding: "16px", fontSize: 12, color: "#687383" }}>None</div>
                ) : (
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: "#071a2e" }}>{item.full_name}</div>
                        <div style={{ color: "#687383", marginTop: 1 }}>{item.course}</div>
                        <div style={{ color: tagColor, marginTop: 2, fontSize: 11 }}>
                          Expires {formatDate(item.expires_at)} ({item.days}d)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* New hires */}
        {newHireRows.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
              New Hires — Last 30 Days ({newHireRows.length})
            </h2>
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#071a2e" }}>
                    {["Employee", "Joined", "Required Enrolled", "Required Complete", "Progress"].map((h) => (
                      <th key={h} style={TABLE_HEADER_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {newHireRows.map((row, i) => {
                    const pct = row.enrolled_required > 0
                      ? Math.round((row.completed_required / row.enrolled_required) * 100)
                      : 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.full_name}</div>
                          <div style={{ fontSize: 11, color: "#687383" }}>{row.email}</div>
                        </td>
                        <td style={{ padding: "11px 14px", color: "#687383", fontSize: 12 }}>
                          {formatDate(row.created_at)}
                        </td>
                        <td style={{ padding: "11px 14px", color: "#687383" }}>{row.enrolled_required}</td>
                        <td style={{ padding: "11px 14px", fontWeight: 600, color: pctColor(pct) }}>{row.completed_required}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ height: 6, width: 80, background: "#dfe4e8", borderRadius: 3 }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#118568" : "#f58220", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "#118568" : "#071a2e" }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
