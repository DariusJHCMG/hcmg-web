"use client";

import { useState } from "react";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

const TEMPLATES = [
  { key: "announcement", emoji: "🥧", label: "Announcement",     desc: "Goal launch — 'Claim Your Slice'" },
  { key: "reminder",     emoji: "⏰", label: "Reminder",          desc: "No commitment submitted yet" },
  { key: "weekly",       emoji: "📊", label: "Weekly Progress",   desc: "Monday morning update with stats" },
  { key: "off_pace",     emoji: "🔴", label: "Off-Pace Alert",    desc: "LO is behind their goal pace" },
  { key: "milestone",    emoji: "🎉", label: "Company Milestone", desc: "Company hit 75% of goal" },
  { key: "end_of_month", emoji: "🏁", label: "End of Month",      desc: "Final results + personal recap" },
  { key: "award",        emoji: "🏆", label: "Award Certificate", desc: "You've earned a badge this month" },
] as const;

type TemplateKey = typeof TEMPLATES[number]["key"];

interface Props {
  testEmail: string;
}

export function TestEmailPanel({ testEmail }: Props) {
  const [sending,   setSending]   = useState<TemplateKey | "all" | null>(null);
  const [results,   setResults]   = useState<Record<string, "sent" | "error">>({});
  const [lastBatch, setLastBatch] = useState<string | null>(null);

  async function sendTemplate(key: TemplateKey | "all") {
    setSending(key);
    setLastBatch(null);

    const url = key === "all"
      ? "/api/goal-engine/test-send"
      : `/api/goal-engine/test-send?template=${key}`;

    try {
      const res  = await fetch(url, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        const newResults: Record<string, "sent" | "error"> = {};
        if (key === "all") {
          TEMPLATES.forEach(t => { newResults[t.key] = "sent"; });
          setLastBatch(`✅ All 7 templates sent to ${testEmail}`);
        } else {
          newResults[key] = "sent";
          setLastBatch(`✅ Sent "${key}" to ${testEmail}`);
        }
        setResults(prev => ({ ...prev, ...newResults }));
      } else {
        if (key === "all") {
          const errResults: Record<string, "sent" | "error"> = {};
          TEMPLATES.forEach(t => { errResults[t.key] = "error"; });
          setResults(prev => ({ ...prev, ...errResults }));
        } else {
          setResults(prev => ({ ...prev, [key]: "error" }));
        }
        setLastBatch(`⚠️ ${data.error ?? "Send failed"}`);
      }
    } catch {
      setLastBatch("⚠️ Network error — check console");
    } finally {
      setSending(null);
    }
  }

  const isLoading = sending !== null;

  return (
    <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:28, marginBottom:24, boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.ink }}>📧 Email Template Preview</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>
            Send any or all templates to <strong style={{ color:C.ink }}>{testEmail}</strong> to preview them in your inbox.
          </p>
        </div>
        <button
          onClick={() => sendTemplate("all")}
          disabled={isLoading}
          style={{
            padding:"10px 22px", borderRadius:12, border:"none", cursor: isLoading ? "not-allowed":"pointer",
            background: isLoading ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
            color: isLoading ? C.muted : "#fff",
            fontSize:13, fontWeight:800, fontFamily:"inherit",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {sending === "all" ? "Sending all…" : "🚀 Send All 7 Templates"}
        </button>
      </div>

      {lastBatch && (
        <div style={{
          margin:"12px 0 16px", padding:"10px 14px", borderRadius:10,
          background: lastBatch.startsWith("✅") ? "#dcfce7" : "#fee2e2",
          border: `1px solid ${lastBatch.startsWith("✅") ? "#86efac" : "#fca5a5"}`,
          fontSize:13, fontWeight:600,
          color: lastBatch.startsWith("✅") ? "#166534" : "#991b1b",
        }}>
          {lastBatch}
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
        {TEMPLATES.map(t => {
          const status  = results[t.key];
          const loading = sending === t.key;
          return (
            <div key={t.key} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 16px", borderRadius:12,
              background: status === "sent" ? "#f0fdf4" : status === "error" ? "#fff5f5" : C.sand,
              border: `1px solid ${status === "sent" ? "#86efac" : status === "error" ? "#fca5a5" : C.line}`,
              flexWrap:"wrap", gap:8,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>{t.emoji}</span>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{t.label}</p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:C.muted }}>{t.desc}</p>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {status === "sent" && (
                  <span style={{ fontSize:11, fontWeight:700, color:"#16a34a" }}>✓ Sent</span>
                )}
                {status === "error" && (
                  <span style={{ fontSize:11, fontWeight:700, color:"#dc2626" }}>✗ Failed</span>
                )}
                <button
                  onClick={() => sendTemplate(t.key)}
                  disabled={isLoading}
                  style={{
                    padding:"6px 14px", borderRadius:8, border:`1px solid ${C.line}`,
                    background: loading ? C.line : C.white,
                    color: loading ? C.muted : C.ink,
                    fontSize:12, fontWeight:700, cursor: isLoading ? "not-allowed":"pointer",
                    fontFamily:"inherit", opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
