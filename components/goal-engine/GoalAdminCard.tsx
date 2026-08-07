"use client";

import { useState, useEffect } from "react";
import type { GoalMonth } from "@/lib/database.types";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

export function GoalAdminCard({ goal }: { goal: GoalMonth }) {
  const [loading,          setLoading]          = useState(false);
  const [message,          setMessage]          = useState<string | null>(null);
  const [msgOk,            setMsgOk]            = useState(true);
  const [published,        setPublished]        = useState(goal.is_published);
  const [assignedCount,    setAssignedCount]    = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/goal-engine/goal-assignments?goal_month_id=${goal.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAssignedCount(d.assignments?.length ?? 0); })
      .catch(() => {});
  }, [goal.id]);

  async function toggle() {
    setLoading(true); setMessage(null);
    const res  = await fetch(`/api/goal-engine/goals/${goal.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ is_published:!published }) });
    const data = await res.json();
    if (res.ok) { setPublished(!published); setMsgOk(true); setMessage(!published ? "✅ Published. Emails sent." : "Unpublished."); }
    else { setMsgOk(false); setMessage(data.error ?? "Failed."); }
    setLoading(false);
  }

  async function runAwards() {
    setLoading(true); setMessage(null);
    const res  = await fetch("/api/goal-engine/awards", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ goal_month_id:goal.id }) });
    const data = await res.json();
    setMsgOk(res.ok);
    setMessage(res.ok ? `✅ ${data.issued} awards issued and emailed.` : (data.error ?? "Failed."));
    setLoading(false);
  }

  async function resend() {
    setLoading(true); setMessage(null);
    const res  = await fetch(`/api/goal-engine/goals/${goal.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ _resend:true }) });
    const data = await res.json();
    setMsgOk(res.ok); setMessage(res.ok ? "📧 Announcement emails re-sent." : (data.error ?? "Failed to resend."));
    setLoading(false);
  }

  async function forceClose() {
    if (!confirm(`Force-close ${goal.month_label}? This runs the end-of-month award engine, sends recap emails, and closes the goal. This cannot be undone.`)) return;
    setLoading(true); setMessage(null);
    const res  = await fetch("/api/goal-engine/end-of-month", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ force:true }) });
    const data = await res.json();
    setMsgOk(res.ok);
    setMessage(res.ok ? `✅ Month closed. ${data.emails_sent ?? 0} recap emails sent. ${data.awards_issued ?? 0} awards issued.` : (data.error ?? data.message ?? "Failed."));
    setLoading(false);
  }

  const volFmt    = goal.funded_volume_goal.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 });
  const dateRange = `${new Date(goal.start_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${new Date(goal.end_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  const BTN: React.CSSProperties = {
    padding:"7px 16px", borderRadius:10, cursor:"pointer",
    fontSize:12, fontWeight:700, fontFamily:"inherit", border:"none",
    opacity: loading ? 0.5 : 1,
  };

  return (
    <div style={{
      background: C.white,
      border: published ? "1.5px solid #86efac" : `1px solid ${C.line}`,
      borderRadius:16, padding:"20px 24px",
      boxShadow:"0 1px 4px rgba(15,23,42,0.05)",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>{goal.month_label}</h3>
            {published
              ? <span style={{ padding:"2px 10px", borderRadius:99, background:"#dcfce7", color:"#166534", fontSize:10, fontWeight:700 }}>Published</span>
              : <span style={{ padding:"2px 10px", borderRadius:99, background:"#fef9c3", color:"#854d0e", fontSize:10, fontWeight:700 }}>Draft</span>
            }
            {goal.emails_sent && <span style={{ padding:"2px 10px", borderRadius:99, background:"#ede9fe", color:"#5b21b6", fontSize:10, fontWeight:700 }}>Emails Sent</span>}
          </div>
          <p style={{ margin:0, fontSize:12, color:C.muted }}>
            {volFmt} · {goal.funded_units_goal} loans · {dateRange}
            {assignedCount !== null && (
              <span style={{ marginLeft:8, padding:"1px 8px", borderRadius:99, background: assignedCount === 0 ? "#fef9c3" : "#eff6ff", color: assignedCount === 0 ? "#854d0e" : "#1e40af", fontSize:10, fontWeight:700 }}>
                {assignedCount === 0 ? "⚠ No assignees" : `👥 ${assignedCount} assigned`}
              </span>
            )}
          </p>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <a href={`/goal-engine/admin/goals/${goal.id}/assignments`} style={{
            ...BTN,
            background:"#eff6ff", color:"#1e40af",
            border:"1px solid #bfdbfe",
            textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4,
          }}>
            👥 Assignees{assignedCount !== null ? ` (${assignedCount})` : ""}
          </a>
          <button onClick={toggle} disabled={loading} style={{
            ...BTN,
            background: published ? "#fef9c3" : "linear-gradient(135deg,#FF9847,#F37021)",
            color: published ? "#854d0e" : "#fff",
          }}>
            {loading ? "…" : published ? "Unpublish" : "Publish"}
          </button>
          {published && (
            <>
              <button onClick={resend} disabled={loading} style={{ ...BTN, background:C.sand, color:C.ink, border:`1px solid ${C.line}` }}>
                📧 Resend
              </button>
              <button onClick={runAwards} disabled={loading} style={{ ...BTN, background:"#fef9c3", color:"#854d0e" }}>
                🏆 Run Awards
              </button>
              <button onClick={forceClose} disabled={loading} style={{ ...BTN, background:"#fee2e2", color:"#991b1b", border:"1px solid #fecaca" }}>
                🔒 Force Close
              </button>
            </>
          )}
        </div>
      </div>
      {message && (
        <p style={{ margin:"12px 0 0", fontSize:12, fontWeight:700, color: msgOk ? "#16a34a" : "#dc2626" }}>
          {message}
        </p>
      )}
    </div>
  );
}
