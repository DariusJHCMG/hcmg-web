import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Audit Log",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 100;

const ACTION_LABELS: Record<string, string> = {
  certificate_issued:          "Certificate issued",
  certificate_revoked:         "Certificate revoked",
  certificate_expired_auto:    "Certificate expired (auto)",
  exemption_granted:           "Exemption granted",
  exemption_revoked:           "Exemption revoked",
  quiz_passed:                 "Quiz passed",
  quiz_failed:                 "Quiz failed",
  user_role_updated:           "User role updated",
  user_access_updated:         "User access updated",
  org_unit_created:            "Org unit created",
  org_unit_deactivated:        "Org unit deactivated",
};

const ACTION_COLORS: Record<string, string> = {
  certificate_issued:       "#34d399",
  certificate_revoked:      "#f87171",
  certificate_expired_auto: "#f87171",
  exemption_granted:        "#f58220",
  exemption_revoked:        "#687383",
  quiz_passed:              "#34d399",
  quiz_failed:              "#f87171",
  user_role_updated:        "#3b82f6",
  user_access_updated:      "#3b82f6",
  org_unit_created:         "#a78bfa",
  org_unit_deactivated:     "#687383",
};

function fmtDate(d: string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export default async function AuditLogPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ action?: string; actor?: string; before?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/audit-log");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();

  let query = sb
    .from("uni_audit_log")
    .select("id, actor_id, actor_email, action, entity_type, entity_id, details, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (searchParams.action) {
    query = query.eq("action", searchParams.action);
  }
  if (searchParams.actor) {
    query = query.ilike("actor_email", `%${searchParams.actor}%`);
  }
  if (searchParams.before) {
    query = query.lt("created_at", searchParams.before);
  }

  const { data: logs } = await query;

  // Get distinct actions for the filter dropdown
  const { data: distinctActions } = await sb
    .from("uni_audit_log")
    .select("action")
    .order("action");

  const actionSet = new Set((distinctActions ?? []).map(r => r.action));

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>
          ← Admin
        </Link>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
          Security &amp; Compliance
        </p>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          Audit Log
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
          Complete record of all privileged actions in HCMG University.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Filters */}
        <form method="GET" style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
              Action
            </label>
            <select
              name="action"
              defaultValue={searchParams.action ?? ""}
              style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit", background: "#fff" }}
            >
              <option value="">All actions</option>
              {[...actionSet].map(a => (
                <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>
              Actor email
            </label>
            <input
              name="actor"
              type="text"
              defaultValue={searchParams.actor ?? ""}
              placeholder="Filter by email…"
              style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 13, fontFamily: "inherit" }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "9px 20px", borderRadius: 8,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            Filter
          </button>
          {(searchParams.action || searchParams.actor) && (
            <Link
              href="/university/admin/audit-log"
              style={{ fontSize: 13, color: "#687383", alignSelf: "center", textDecoration: "underline" }}
            >
              Clear
            </Link>
          )}
        </form>

        {/* Log table */}
        {(logs ?? []).length > 0 ? (
          <div style={{ overflowX: "auto", border: "1px solid #dfe4e8", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#071a2e" }}>
                  {["Timestamp", "Action", "Actor", "Entity", "IP", "Details"].map(h => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#687383",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(logs ?? []).map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa", verticalAlign: "top" }}>
                    <td style={{ padding: "11px 14px", color: "#687383", whiteSpace: "nowrap" }}>
                      {fmtDate(row.created_at)}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        display: "inline-block",
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                        background: `${ACTION_COLORS[row.action] ?? "#687383"}18`,
                        color: ACTION_COLORS[row.action] ?? "#687383",
                      }}>
                        {ACTION_LABELS[row.action] ?? row.action}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#071a2e" }}>
                      {row.actor_email ?? <span style={{ color: "#687383" }}>system</span>}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#687383" }}>
                      {row.entity_type && (
                        <span>{row.entity_type}</span>
                      )}
                      {row.entity_id && (
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#aab4be", marginTop: 2 }}>
                          {row.entity_id.slice(0, 8)}…
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#687383", fontFamily: "monospace", fontSize: 11 }}>
                      {row.ip_address ?? "—"}
                    </td>
                    <td style={{ padding: "11px 14px", maxWidth: 280 }}>
                      {row.details && (
                        <details>
                          <summary style={{ cursor: "pointer", fontSize: 11, color: "#687383" }}>View</summary>
                          <pre style={{
                            marginTop: 6, padding: "8px 10px", background: "#f0f2f5",
                            borderRadius: 6, fontSize: 10, overflowX: "auto",
                            whiteSpace: "pre-wrap", wordBreak: "break-all", maxWidth: 260,
                          }}>
                            {JSON.stringify(row.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#687383", background: "#f7f8fa", borderRadius: 12, border: "1px solid #dfe4e8" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No audit records match your filters</p>
            <p style={{ fontSize: 13 }}>Try clearing the filters or check back after actions are performed.</p>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 12, color: "#687383" }}>
          Showing the most recent {PAGE_SIZE} entries.
          All certificate issues, revocations, exemptions, role changes, and admin actions are recorded here.
        </p>
      </div>
    </div>
  );
}
