import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Compliance Exemptions",
  robots: { index: false, follow: false },
};

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ExemptionsPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/exemptions");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();

  const [
    { data: exemptions },
    { data: courses },
    { data: employees },
  ] = await Promise.all([
    sb
      .from("uni_cert_exemptions")
      .select(`
        id, justification, granted_at, expires_at, revoked_at,
        profile_id, course_id,
        profiles:profile_id ( full_name, email, department ),
        uni_courses:course_id ( title ),
        grantor:granted_by ( full_name )
      `)
      .order("granted_at", { ascending: false }),
    sb.from("uni_courses").select("id, title").eq("is_published", true).order("sort_order"),
    sb.from("profiles")
      .select("id, full_name, email, department")
      .eq("is_active", true)
      .eq("university_access", true)
      .order("full_name"),
  ]);

  const now = new Date();
  const active   = (exemptions ?? []).filter(e => !e.revoked_at && (!e.expires_at || new Date(e.expires_at) > now));
  const expired  = (exemptions ?? []).filter(e => !e.revoked_at && e.expires_at && new Date(e.expires_at) <= now);
  const revoked  = (exemptions ?? []).filter(e => !!e.revoked_at);

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
          <Link href="/university/admin/compliance" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
            ← Compliance
          </Link>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
            HR Administration
          </p>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
            Compliance Exemptions
          </h1>
          <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
            Grant documented exemptions for required training. Each requires a written justification.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Active Exemptions",  value: active.length,  color: "#f58220" },
            { label: "Expired",            value: expired.length, color: "#687383" },
            { label: "Revoked",            value: revoked.length, color: "#687383" },
          ].map(s => (
            <div key={s.label} style={{ background: "#f7f8fa", border: "1px solid #dfe4e8", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "Manrope" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#687383", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grant new exemption form */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
            Grant New Exemption
          </h2>
          <form
            action={`/api/university/admin/exemptions`}
            method="POST"
            style={{
              background: "#f7f8fa", border: "1px solid #dfe4e8",
              borderRadius: 12, padding: "24px",
              display: "flex", flexDirection: "column", gap: 14,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                  Employee <span style={{ color: "#f58220" }}>*</span>
                </label>
                <select name="profile_id" required style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                  <option value="">Select employee…</option>
                  {(employees ?? []).map(e => (
                    <option key={e.id} value={e.id}>{e.full_name} — {e.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                  Course <span style={{ color: "#f58220" }}>*</span>
                </label>
                <select name="course_id" required style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                  <option value="">Select course…</option>
                  {(courses ?? []).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Justification <span style={{ color: "#f58220" }}>*</span>
              </label>
              <textarea
                name="justification"
                required
                minLength={20}
                rows={3}
                placeholder="Document the business reason for this exemption (minimum 20 characters)…"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
                Exemption expires (optional)
              </label>
              <input
                type="date"
                name="expires_at"
                min={new Date().toISOString().split("T")[0]}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit" }}
              />
            </div>
            <div>
              <button
                type="submit"
                style={{
                  padding: "10px 24px", borderRadius: 9,
                  background: "linear-gradient(135deg,#FF9847,#F37021)",
                  color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Grant Exemption
              </button>
            </div>
          </form>
          <p style={{ fontSize: 12, color: "#687383", marginTop: 10 }}>
            Note: exemptions are saved via <code>/api/university/admin/exemptions</code> (POST). All grants are written to the audit log.
          </p>
        </section>

        {/* Active exemptions table */}
        {active.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
              Active Exemptions ({active.length})
            </h2>
            <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #dfe4e8" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "#071a2e" }}>
                    {["Employee","Course","Granted","Expires","Justification",""].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.map((ex, i) => {
                    const emp = ex.profiles as unknown as { full_name: string; email: string } | null;
                    const crs = ex.uni_courses as unknown as { title: string } | null;
                    return (
                      <tr key={ex.id} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#071a2e" }}>{emp?.full_name ?? "—"}</div>
                          <div style={{ fontSize: 11, color: "#687383" }}>{emp?.email}</div>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#071a2e" }}>{crs?.title ?? "—"}</td>
                        <td style={{ padding: "12px 14px", color: "#687383", fontSize: 12 }}>{fmtDate(ex.granted_at)}</td>
                        <td style={{ padding: "12px 14px", color: ex.expires_at ? "#b23b3b" : "#34d399", fontSize: 12, fontWeight: ex.expires_at ? 700 : 400 }}>
                          {ex.expires_at ? fmtDate(ex.expires_at) : "Permanent"}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#687383", fontSize: 12, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ex.justification}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <form action={`/api/university/admin/exemptions/${ex.id}/revoke`} method="POST" style={{ display: "inline" }}>
                            <button
                              type="submit"
                              style={{ fontSize: 12, fontWeight: 600, color: "#b91c1c", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                              onClick={e => { if (!confirm("Revoke this exemption? The employee will become non-compliant.")) e.preventDefault(); }}
                            >
                              Revoke
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Empty state */}
        {(exemptions ?? []).length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#687383", background: "#f7f8fa", borderRadius: 12, border: "1px solid #dfe4e8" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No exemptions on record</p>
            <p style={{ fontSize: 13 }}>Grant an exemption above when a documented compliance exception is required.</p>
          </div>
        )}
      </div>
    </div>
  );
}
