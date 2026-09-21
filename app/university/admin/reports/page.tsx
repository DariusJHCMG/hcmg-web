import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Reports",
  robots: { index: false, follow: false },
};

export default async function AdminReportsPage(
  { searchParams }: { searchParams: Promise<Record<string, string>> }
) {
  // Reports expose all employee training data — university_admin only
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/reports");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sp = await searchParams;
  const filterQ        = sp.q?.trim().toLowerCase() ?? "";
  const filterStatus   = sp.status ?? "";
  const filterRequired = sp.required ?? "";

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

  const allRows = (enrollments ?? []).map(e => {
    const p   = (e.profiles as unknown) as { full_name: string; email: string; role: string; department: string | null } | null;
    const c   = (e.uni_courses as unknown) as { id: string; title: string; is_required: boolean } | null;
    const key = `${e.profile_id}:${e.course_id}`;
    const prog = progMap.get(key) ?? { completed: 0, total: 0, lastWatched: null };
    const pct  = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
    const isOverdue = e.due_date && pct < 100 && new Date(e.due_date) < new Date();
    return { p, c, prog, pct, isOverdue, hasCert: certSet.has(key), dueDate: e.due_date, lastWatched: prog.lastWatched };
  });

  // Apply server-side filters
  const rows = allRows.filter(r => {
    if (filterQ) {
      const name  = r.p?.full_name?.toLowerCase() ?? "";
      const email = r.p?.email?.toLowerCase() ?? "";
      if (!name.includes(filterQ) && !email.includes(filterQ)) return false;
    }
    if (filterStatus === "complete"    && r.pct !== 100)  return false;
    if (filterStatus === "in_progress" && (r.pct === 100 || r.isOverdue)) return false;
    if (filterStatus === "overdue"     && !r.isOverdue)   return false;
    if (filterRequired === "yes"       && !r.c?.is_required) return false;
    if (filterRequired === "no"        && r.c?.is_required)  return false;
    return true;
  });

  // Build summary stats (always from unfiltered total)
  const totalRows     = allRows.length;
  const overdueCount  = allRows.filter(r => r.isOverdue).length;
  const completedCount  = allRows.filter(r => r.pct === 100).length;
  const certIssuedCount = allRows.filter(r => r.hasCert).length;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Admin</Link>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
            Completion Reports
          </h1>
          <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
            {totalRows} enrollment{totalRows !== 1 ? "s" : ""} · {completedCount} complete · {overdueCount > 0 ? `${overdueCount} overdue · ` : ""}{certIssuedCount} certificates
          </p>
        </div>
        <a href="/api/university/admin/export" style={{
          padding: "11px 22px", borderRadius: 10,
          background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
          color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", alignSelf: "flex-end",
        }}>
          ↓ Export CSV
        </a>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px clamp(16px,4vw,40px) 64px" }}>
        {/* Search + filter bar */}
        <form method="GET" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1.5px solid #dfe4e8", borderRadius: 8,
            padding: "0 12px", background: "#fff", height: 38, flex: "1 1 200px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#687383" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              name="q"
              type="search"
              defaultValue={filterQ}
              placeholder="Search by name or email…"
              style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", flex: 1, color: "#071a2e" }}
            />
          </div>
          <select
            name="status"
            defaultValue={filterStatus}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 12, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
          >
            <option value="">All status</option>
            <option value="complete">Complete</option>
            <option value="in_progress">In Progress</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            name="required"
            defaultValue={filterRequired}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 12, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
          >
            <option value="">All courses</option>
            <option value="yes">Required only</option>
            <option value="no">Optional only</option>
          </select>
          <button type="submit" style={{ padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg,#FF9847,#F37021)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Filter
          </button>
          <Link href="/university/admin/reports" style={{ fontSize: 12, color: "#687383", alignSelf: "center", textDecoration: "underline" }}>
            Clear
          </Link>
        </form>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total enrollments", value: totalRows, color: "#071a2e" },
            { label: "Completed",         value: completedCount, color: "#118568" },
            { label: "Overdue",           value: overdueCount, color: overdueCount > 0 ? "#b91c1c" : "#687383" },
            { label: "Certified",         value: certIssuedCount, color: "#3b82f6" },
          ].map(s => (
            <div key={s.label} style={{ padding: "10px 16px", background: "#f7f8fa", border: "1px solid #dfe4e8", borderRadius: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "Manrope" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#687383" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #dfe4e8", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 780 }}>
            <thead>
              <tr style={{ background: "#071a2e" }}>
                {["Employee","Course","Required","Due Date","Progress","Last Active","Certificate"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#687383", fontSize: 13 }}>
                    No enrollment records found.
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#071a2e" }}>{row.p?.full_name ?? "—"}</div>
                    <div style={{ fontSize: 11, color: "#687383" }}>{row.p?.email}</div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#071a2e", fontWeight: 500 }}>{row.c?.title ?? "—"}</td>
                  <td style={{ padding: "12px 14px", color: row.c?.is_required ? "#b23b3b" : "#687383" }}>
                    {row.c?.is_required ? "Yes" : "No"}
                  </td>
                  <td style={{ padding: "12px 14px", color: row.isOverdue ? "#b23b3b" : "#687383", fontWeight: row.isOverdue ? 700 : 400 }}>
                    {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}
                    {row.isOverdue && <span style={{ fontSize: 10, marginLeft: 4, background: "rgba(185,28,28,0.1)", padding: "1px 5px", borderRadius: 4 }}>OVERDUE</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ height: 6, width: 80, background: "#dfe4e8", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct === 100 ? "#118568" : "#f58220", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: row.pct === 100 ? "#118568" : "#071a2e" }}>{row.pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#687383", fontSize: 12 }}>
                    {row.lastWatched ? new Date(row.lastWatched).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
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
        <p style={{ marginTop: 12, fontSize: 12, color: "#687383" }}>
          Showing {rows.length}{rows.length !== allRows.length ? ` of ${allRows.length} filtered` : ""} enrollment{rows.length !== 1 ? "s" : ""}.{" "}
          Use <a href="/api/university/admin/export" style={{ color: "#f58220" }}>Export CSV</a> for a full download.
        </p>
      </div>
    </div>
  );
}
