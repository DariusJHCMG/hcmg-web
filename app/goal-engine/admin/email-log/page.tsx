/**
 * /goal-engine/admin/email-log — Email Delivery Log
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", sand:"#F8FAFC", white:"#ffffff" };

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  sent:       { bg:"#eff6ff", color:"#1e40af" },
  delivered:  { bg:"#f0fdf4", color:"#166534" },
  opened:     { bg:"#ecfdf5", color:"#065f46" },
  clicked:    { bg:"#dcfce7", color:"#14532d" },
  bounced:    { bg:"#fee2e2", color:"#991b1b" },
  complained: { bg:"#fef2f2", color:"#7f1d1d" },
  failed:     { bg:"#fee2e2", color:"#991b1b" },
  queued:     { bg:"#fef9c3", color:"#854d0e" },
};

const TYPE_LABELS: Record<string, string> = {
  announcement:    "Announcement",
  reminder_initial:"Reminder (Initial)",
  reminder_final:  "Reminder (Final)",
  weekly:          "Weekly Progress",
  off_pace:        "Off-Pace Alert",
  end_of_month:    "End of Month",
  award:           "Award",
  milestone:       "Company Milestone",
};

export default async function EmailLogPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");
  if (!isAdmin(profile)) redirect("/goal-engine/dashboard");

  const sb = createServiceClient();

  // Pagination: last 100
  const { data: logs } = await sb
    .from("goal_email_log")
    .select(`
      id, email_type, recipient_email, subject,
      status, sent_at, delivered_at, opened_at, bounced_at,
      resend_id, profile_id,
      goal_months(month_label)
    `)
    .order("sent_at", { ascending: false })
    .limit(100);

  // Stats
  const total     = logs?.length ?? 0;
  const delivered = logs?.filter(l => l.status === "delivered" || l.status === "opened").length ?? 0;
  const bounced   = logs?.filter(l => l.status === "bounced").length ?? 0;
  const failed    = logs?.filter(l => l.status === "failed").length ?? 0;
  const delivRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Admin</Link>
          <h1 style={{ margin:"12px 0 0", fontSize:26, fontWeight:900, color:C.ink }}>Email Log</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>All SLICE emails sent via Resend · Last 100</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="ge-grid-4">
        {[
          { label:"Total Sent",        value:total.toString()           },
          { label:"Delivered",         value:delivered.toString(),      accent:true },
          { label:"Delivery Rate",     value:`${delivRate}%`            },
          { label:"Bounced/Failed",    value:(bounced+failed).toString(),  warn:true },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:16, padding:20 }}>
            <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:C.muted }}>{s.label}</p>
            <p style={{ margin:"6px 0 0", fontSize:26, fontWeight:900, color: s.accent ? "#16a34a" : s.warn ? "#dc2626" : C.ink }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
            <thead>
              <tr style={{ background:C.sand }}>
                {["Type","Recipient","Month","Status","Sent At","Delivered","Opened","Resend ID"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}`, whiteSpace:"nowrap" as const }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map(log => {
                const s = STATUS_COLORS[log.status ?? "sent"] ?? STATUS_COLORS.sent;
                return (
                  <tr key={log.id} style={{ borderBottom:`1px solid ${C.line}` }}>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:700, color:C.ink }}>
                        {TYPE_LABELS[log.email_type] ?? log.email_type}
                      </span>
                    </td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>{log.recipient_email}</td>
                    <td style={{ padding:"12px 14px", fontSize:12, color:C.muted }}>
                      {(log.goal_months as { month_label?: string } | null)?.month_label ?? "—"}
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800, background:s.bg, color:s.color }}>
                        {log.status ?? "sent"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 14px", fontSize:11, color:C.muted, whiteSpace:"nowrap" as const }}>
                      {log.sent_at ? new Date(log.sent_at).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }) : "—"}
                    </td>
                    <td style={{ padding:"12px 14px", fontSize:11, color:C.muted }}>
                      {log.delivered_at ? "✓" : "—"}
                    </td>
                    <td style={{ padding:"12px 14px", fontSize:11, color:C.muted }}>
                      {log.opened_at ? "✓" : "—"}
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      {log.resend_id
                        ? <code style={{ fontSize:10, color:C.muted, fontFamily:"monospace" }}>{(log.resend_id as string).slice(0,12)}…</code>
                        : <span style={{ fontSize:11, color:C.muted }}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(logs?.length ?? 0) === 0 && (
          <p style={{ padding:"48px 24px", textAlign:"center", fontSize:14, color:C.muted }}>No emails sent yet.</p>
        )}
      </div>

      <style>{`@media (max-width:700px) { .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }`}</style>
    </div>
  );
}
