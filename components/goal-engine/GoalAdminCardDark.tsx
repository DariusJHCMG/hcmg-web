"use client";

import { useState } from "react";
import type { GoalMonth } from "@/lib/database.types";

export function GoalAdminCardDark({ goal }: { goal: GoalMonth }) {
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState<string | null>(null);
  const [published, setPublished] = useState(goal.is_published);

  async function toggle() {
    setLoading(true); setMessage(null);
    const res  = await fetch(`/api/goal-engine/goals/${goal.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ is_published:!published }) });
    const data = await res.json();
    if (res.ok) { setPublished(!published); setMessage(!published ? "Published. Emails sent." : "Unpublished."); }
    else setMessage(data.error ?? "Failed.");
    setLoading(false);
  }

  async function runAwards() {
    setLoading(true); setMessage(null);
    const res  = await fetch("/api/goal-engine/awards", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ goal_month_id:goal.id }) });
    const data = await res.json();
    setMessage(res.ok ? `✅ ${data.issued} awards issued and emailed.` : (data.error ?? "Failed."));
    setLoading(false);
  }

  async function resend() {
    setLoading(true); setMessage(null);
    await fetch(`/api/goal-engine/goals/${goal.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ emails_sent:false }) });
    const res  = await fetch(`/api/goal-engine/goals/${goal.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ is_published:true }) });
    setMessage(res.ok ? "📧 Announcement emails re-sent." : "Failed to resend.");
    setLoading(false);
  }

  const volFmt = goal.funded_volume_goal.toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 });
  const dateRange = `${new Date(goal.start_date).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${new Date(goal.end_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  const BTN_BASE: React.CSSProperties = {
    padding:"7px 14px", borderRadius:10, cursor:"pointer",
    fontSize:12, fontWeight:700, fontFamily:"inherit",
    border:"1px solid rgba(255,255,255,0.1)", transition:"all 0.15s",
    opacity: loading ? 0.5 : 1,
  };

  return (
    <div style={{
      background:"rgba(255,255,255,0.04)",
      border: published ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.07)",
      borderRadius:16, padding:"20px 24px",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#fff" }}>{goal.month_label}</h3>
            {published
              ? <span style={{ padding:"2px 8px", borderRadius:99, background:"rgba(34,197,94,0.12)", color:"#4ade80", fontSize:10, fontWeight:700 }}>Published</span>
              : <span style={{ padding:"2px 8px", borderRadius:99, background:"rgba(245,158,11,0.12)", color:"#fbbf24", fontSize:10, fontWeight:700 }}>Draft</span>
            }
            {goal.emails_sent && <span style={{ padding:"2px 8px", borderRadius:99, background:"rgba(99,102,241,0.12)", color:"#a5b4fc", fontSize:10, fontWeight:700 }}>Emails Sent</span>}
          </div>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.35)" }}>{volFmt} · {goal.funded_units_goal} loans · {dateRange}</p>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <button onClick={toggle} disabled={loading} style={{
            ...BTN_BASE,
            background: published ? "rgba(245,158,11,0.1)" : "linear-gradient(135deg,#FF9847,#F37021)",
            color: published ? "#fbbf24" : "#fff",
            border: published ? "1px solid rgba(245,158,11,0.25)" : "none",
          }}>
            {loading ? "…" : published ? "Unpublish" : "Publish"}
          </button>
          {published && (
            <>
              <button onClick={resend} disabled={loading} style={{ ...BTN_BASE, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.7)" }}>
                📧 Resend
              </button>
              <button onClick={runAwards} disabled={loading} style={{ ...BTN_BASE, background:"rgba(251,191,36,0.08)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.2)" }}>
                🏆 Run Awards
              </button>
            </>
          )}
        </div>
      </div>
      {message && <p style={{ margin:"12px 0 0", fontSize:12, fontWeight:700, color:"#F37021" }}>{message}</p>}
    </div>
  );
}
