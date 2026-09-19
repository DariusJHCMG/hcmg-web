import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Compliance Dashboard",
  robots: { index: false, follow: false },
};

// ── helpers ───────────────────────────────────────────────────
function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function pctColor(pct: number): string {
  if (pct >= 90) return "#34d399";
  if (pct >= 70) return "#f58220";
  return "#f87171";
}

// ── page ─────────────────────────────────────────────────────
export default async function ComplianceDashboardPage() {
  // Admin-only — layout already guards trainer/learner, but we enforce admin explicitly
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/compliance");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();
  const now   = new Date();
  const in7   = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);
  const in14  = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in30  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    { data: requiredCourses },
    { data: employees },
    { data: enrollments },
    { data: progress },
    { data: certs },
  ] = await Promise.all([
    sb.from("uni_courses").select("id, title").eq("is_required", true).eq("is_published", true),
    sb.from("profiles").select("id, full_name, email, department").eq("is_active", true).eq("university_access", true),
    sb.from("uni_enrollments").select("profile_id, course_id, due_date, enrolled_at"),
    sb.from("uni_progress").select("profile_id, course_id, completed"),
    sb.from("uni_certificates").select("profile_id, course_id, issued_at, expires_at, revoked_at, revocation_reason"),
  ]);

  const allRequired    = requiredCourses ?? [];
  const allEmployees   = employees ?? [];
  const allEnrollments = enrollments ?? [];
  const allProgress    = progress ?? [];
  const allCerts       = certs ?? [];

  const totalEmployees = allEmployees.length;

  // ── Progress map ──────────────────────────────────────────
  const progressMap = new Map<string, { completed: number; total: number }>();
  for (const p of allProgress) {
    const k = `${p.profile_id}:${p.course_id}`;
    const cur = progressMap.get(k) ?? { completed: 0, total: 0 };
    cur.total++;
    if (p.completed) cur.completed++;
    progressMap.set(k, cur);
  }

  // ── Cert maps ─────────────────────────────────────────────
  const activeCertSet = new Map<string, string | null>(); // key -> expires_at
  const expiredCerts: { full_name: string; email: string; course: string; revocation_reason: string | null; expires_at: string | null }[] = [];

  for (const c of allCerts) {
    const k = `${c.profile_id}:${c.course_id}`;
    if (c.revoked_at) {
      // Treat "expired" revocations separately
      if (c.revocation_reason === "expired" || (c.expires_at && new Date(c.expires_at) < now)) {
        const emp = allEmployees.find((e) => e.id === c.profile_id);
        const course = allRequired.find((r) => r.id === c.course_id)?.title ?? c.course_id;
        if (emp) {
          expiredCerts.push({
            full_name: emp.full_name,
            email: emp.email,
            course,
            revocation_reason: c.revocation_reason,
            expires_at: c.expires_at,
          });
        }
      }
    } else {
      activeCertSet.set(k, c.expires_at ?? null);
    }
  }

  // ── "Fully compliant" = all required courses have 100% progress ──
  function isCompliant(empId: string): boolean {
    if (allRequired.length === 0) return true;
    for (const req of allRequired) {
      const k = `${empId}:${req.id}`;
      const prog = progressMap.get(k);
      if (!prog || prog.total === 0 || prog.completed < prog.total) return false;
    }
    return true;
  }

  const compliantCount = allEmployees.filter((e) => isCompliant(e.id)).length;
  const orgCompliancePct = totalEmployees > 0
    ? Math.round((compliantCount / totalEmployees) * 100)
    : 0;

  // ── Certificate expiry urgency buckets ────────────────────
  type CertExpiryItem = { full_name: string; email: string; course: string; expires_at: string; days: number };
  const critical: CertExpiryItem[] = [];
  const urgent:   CertExpiryItem[] = [];
  const warning:  CertExpiryItem[] = [];

  for (const cert of allCerts) {
    if (cert.revoked_at || !cert.expires_at) continue;
    const expDate = new Date(cert.expires_at);
    if (expDate < now) continue;
    const emp = allEmployees.find((e) => e.id === cert.profile_id);
    if (!emp) continue;
    const course = allRequired.find((r) => r.id === cert.course_id)?.title ?? cert.course_id;
    const days = daysUntil(cert.expires_at);
    const item: CertExpiryItem = { full_name: emp.full_name, email: emp.email, course, expires_at: cert.expires_at, days };
    if (expDate <= in7)       critical.push(item);
    else if (expDate <= in14) urgent.push(item);
    else if (expDate <= in30) warning.push(item);
  }
  [critical, urgent, warning].forEach((arr) => arr.sort((a, b) => a.days - b.days));

  // ── Per-course compliance stats ────────────────────────────
  type CourseComplianceRow = {
    id: string;
    title: string;
    enrolled: number;
    completed: number;
    certIssued: number;
    pct: number;
    overdue: number;
    expiringIn30: number;
  };

  const courseRows: CourseComplianceRow[] = allRequired.map((course) => {
    const courseEnrollments = allEnrollments.filter((e) => e.course_id === course.id);
    const enrolled = courseEnrollments.length;
    let completed = 0;
    let overdue = 0;
    for (const enr of courseEnrollments) {
      const k = `${enr.profile_id}:${course.id}`;
      const prog = progressMap.get(k);
      const pct = prog && prog.total > 0 ? prog.completed / prog.total : 0;
      if (pct === 1) completed++;
      if (pct < 1 && enr.due_date && new Date(enr.due_date) < now) overdue++;
    }
    const certIssued = allCerts.filter((c) => c.course_id === course.id && !c.revoked_at).length;
    const expiringIn30 = allCerts.filter((c) => {
      if (c.course_id !== course.id || c.revoked_at || !c.expires_at) return false;
      const d = new Date(c.expires_at);
      return d >= now && d <= in30;
    }).length;
    const pct = totalEmployees > 0 ? Math.round((completed / totalEmployees) * 100) : 0;
    return { id: course.id, title: course.title, enrolled, completed, certIssued, pct, overdue, expiringIn30 };
  });

  const PAGE_PAD = "clamp(28px,4vw,52px) clamp(24px,6vw,64px)";
  const TH: React.CSSProperties = {
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
            Compliance
          </p>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui", marginBottom: 4 }}>
            Compliance Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#b9c5d0" }}>Required training status across HCMG</p>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignSelf: "flex-end" }}>
          <a
            href="/api/university/admin/export"
            style={{
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "#fff", fontWeight: 600, fontSize: 12,
              textDecoration: "none",
            }}
          >
            ↓ Export
          </a>
          <Link
            href="/university/admin/exemptions"
            style={{
              padding: "10px 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              color: "#fff", fontWeight: 600, fontSize: 12,
              textDecoration: "none",
            }}
          >
            Exemptions →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 72px" }}>

        {/* Org compliance score — prominent */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 28,
          alignItems: "center",
          background: "#f7f8fa",
          border: "1px solid #dfe4e8",
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 32,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(48px,6vw,72px)",
              fontWeight: 900,
              fontFamily: "Manrope, system-ui",
              color: pctColor(orgCompliancePct),
              lineHeight: 1,
            }}>
              {orgCompliancePct}%
            </div>
            <div style={{ fontSize: 12, color: "#687383", marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Org Compliance
            </div>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#071a2e", marginBottom: 4 }}>
              {compliantCount} of {totalEmployees} employees fully compliant
            </div>
            <div style={{ fontSize: 13, color: "#687383", lineHeight: 1.6 }}>
              All required published courses must be 100% complete to be counted as compliant.
              {totalEmployees - compliantCount > 0 && (
                <> <strong style={{ color: "#f87171" }}>{totalEmployees - compliantCount} employees</strong> have incomplete required training.</>
              )}
            </div>
            {/* Summary row */}
            <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
              {[
                { label: "Critical (≤7d)", count: critical.length, color: "#f87171" },
                { label: "Urgent (≤14d)",  count: urgent.length,   color: "#f58220" },
                { label: "Warning (≤30d)", count: warning.length,  color: "#fbbf24" },
                { label: "Expired",        count: expiredCerts.length, color: "#687383" },
              ].map((b) => (
                <div key={b.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: b.color, fontFamily: "Manrope, system-ui" }}>{b.count}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate expiry urgency — 4 columns */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
            Certificate Expiry Urgency
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {[
              { label: "Critical", sub: "Expiring ≤ 7 days", items: critical, border: "#f87171", bg: "#fef2f2", color: "#f87171" },
              { label: "Urgent",   sub: "Expiring 8–14 days", items: urgent,   border: "#f58220", bg: "#fff8ed", color: "#f58220" },
              { label: "Warning",  sub: "Expiring 15–30 days", items: warning,  border: "#fbbf24", bg: "#fffbeb", color: "#b45309" },
              { label: "Expired",  sub: "Revoked / expired", items: expiredCerts.map(e => ({
                  full_name: e.full_name, email: e.email, course: e.course,
                  expires_at: e.expires_at ?? "", days: 0,
                })),
                border: "#dfe4e8", bg: "#f7f8fa", color: "#687383",
              },
            ].map(({ label, sub, items, border, bg, color }) => (
              <div key={label} style={{ border: `1px solid ${border}`, borderRadius: 10, background: bg, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{sub} · {items.length}</div>
                </div>
                {items.length === 0 ? (
                  <div style={{ padding: "14px", fontSize: 12, color: "#687383" }}>None</div>
                ) : (
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ padding: "8px 14px", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: "#071a2e" }}>{item.full_name}</div>
                        <div style={{ color: "#687383", fontSize: 11, marginTop: 1 }}>{item.course}</div>
                        {item.expires_at && (
                          <div style={{ color, fontSize: 11, marginTop: 1 }}>
                            {label === "Expired" ? "Expired" : `${item.days}d · `}
                            {formatDate(item.expires_at)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Required courses compliance table */}
        {courseRows.length > 0 ? (
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope, system-ui" }}>
              Required Courses
            </h2>
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "#071a2e" }}>
                    {["Course", "Enrolled", "Complete", "Cert Issued", "% Compliant", "Overdue", "Expiring (30d)"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseRows.map((row, i) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, color: "#071a2e", maxWidth: 260 }}>
                        {row.title}
                      </td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.enrolled}</td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.completed}</td>
                      <td style={{ padding: "11px 14px", color: "#687383" }}>{row.certIssued}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          fontWeight: 700,
                          color: pctColor(row.pct),
                          fontSize: 13,
                        }}>
                          {row.pct}%
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {row.overdue > 0 ? (
                          <span style={{ fontWeight: 700, color: "#f87171" }}>{row.overdue}</span>
                        ) : (
                          <span style={{ color: "#687383" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        {row.expiringIn30 > 0 ? (
                          <span style={{ fontWeight: 700, color: "#f58220" }}>{row.expiringIn30}</span>
                        ) : (
                          <span style={{ color: "#687383" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div style={{
            border: "1px solid #dfe4e8", borderRadius: 12,
            padding: "32px", textAlign: "center",
            color: "#687383", fontSize: 14,
          }}>
            No required published courses configured yet.{" "}
            <Link href="/university/admin/courses" style={{ color: "#f58220", textDecoration: "none", fontWeight: 600 }}>
              Manage courses →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
