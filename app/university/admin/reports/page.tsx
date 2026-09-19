import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Reports",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  // Enrollments with profile + course info
  const { data: enrollments } = await sb
    .from("uni_enrollments")
    .select(`
      profile_id, course_id, due_date, enrolled_at,
      profiles:profile_id ( full_name, email, role, department ),
      uni_courses:course_id ( id, title, is_required )
    `)
    .order("enrolled_at", { ascending: false });

  // Progress
  const { data: allProgress } = await sb
    .from("uni_progress")
    .select("profile_id, course_id, completed, last_watched_at");

  // Certificates
  const { data: allCerts } = await sb
    .from("uni_certificates")
    .select("profile_id, course_id, issued_at")
    .is("revoked_at", null);

  // Build per-enrollment progress
  const progMap = new Map<string, { completed: number; total: number; lastWatched: string | null }>();
  for (const p of (allProgress ?? [])) {
    const k = `${p.profile_id}:${p.course_id}`;
    const cur = progMap.get(k) ?? { completed: 0, total: 0, lastWatched: null };
    cur.total++;
    if (p.completed) cur.completed++;
    if (!cur.lastWatched || p.last_watched_at > cur.lastWatched) cur.lastWatched = p.last_watched_at;
    progMap.set(k, cur);
  }

  const certSet = new Set((allCerts ?? []).map(c => `${c.profile_id}:${c.course_id}`));

  const rows = (enrollments ?? []).map(e => {
    const p   = (e.profiles as unknown) as { full_name: string; email: string; role: string; department: string | null } | null;
    const c   = (e.uni_courses as unknown) as { id: string; title: string; is_required: boolean } | null;
    const key = `${e.profile_id}:${e.course_id}`;
    const prog = progMap.get(key) ?? { completed: 0, total: 0, lastWatched: null };
    const pct  = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    const isOverdue = e.due_date && pct < 100 && new Date(e.due_date) < new Date();
    return { p, c, prog, pct, isOverdue, hasCert: certSet.has(key), dueDate: e.due_date, lastWatched: prog.lastWatched };
  });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Admin</Link>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
            Completion Reports
          </h1>
        </div>
        <a href="/api/university/admin/export" style={{
          padding: "11px 22px", borderRadius: 10,
          background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
          color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none",
        }}>
          ↓ Export CSV
        </a>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 780 }}>
          <thead>
            <tr style={{ background: "#071a2e" }}>
              {["Employee","Course","Required","Due Date","Progress","Last Active","Certificate"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                <td style={{ padding: "12px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.p?.full_name ?? "—"}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{row.p?.email}</div>
                </td>
                <td style={{ padding: "12px 12px", color: "#071a2e", fontWeight: 500 }}>{row.c?.title ?? "—"}</td>
                <td style={{ padding: "12px 12px", color: row.c?.is_required ? "#b23b3b" : "#687383" }}>
                  {row.c?.is_required ? "Yes" : "No"}
                </td>
                <td style={{ padding: "12px 12px", color: row.isOverdue ? "#b23b3b" : "#687383", fontWeight: row.isOverdue ? 700 : 400 }}>
                  {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}
                  {row.isOverdue && <span style={{ fontSize: 10, marginLeft: 4 }}>OVERDUE</span>}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ height: 6, width: 80, background: "#dfe4e8", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct === 100 ? "#118568" : "#f58220", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: row.pct === 100 ? "#118568" : "#071a2e" }}>{row.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: "12px 12px", color: "#687383", fontSize: 12 }}>
                  {row.lastWatched ? new Date(row.lastWatched).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "12px 12px" }}>
                  {row.hasCert ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399" }}>✓ Issued</span>
                  ) : (
                    <span style={{ fontSize: 11, color: "#687383" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
