"use client";

/**
 * HarryWidget — HARRY AI coaching panel component.
 * Named HARRY AI in the UI. Never "Bob AI" or "Goal Engine AI".
 *
 * Usage:
 *   <HarryWidget insightType="lo_coaching" />
 *   <HarryWidget insightType="executive_briefing" />
 */

import { useState, useEffect } from "react";
import type { HarryInsightType } from "@/lib/database.types";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", sand:"#F8FAFC", white:"#ffffff" };

interface HarryWidgetProps {
  insightType?: HarryInsightType;
  targetProfileId?: string;
  compact?: boolean;
}

interface Insight {
  id: string;
  result_text: string;
  insight_type: string;
  created_at: string;
  feedback: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  lo_coaching:           "Coaching",
  executive_briefing:    "Executive Briefing",
  pace_explanation:      "Pace Analysis",
  focus_recommendation:  "Focus Recommendation",
  off_pace_alert:        "Off-Pace Alert",
  branch_insight:        "Branch Insight",
  milestone_summary:     "Milestone",
};

export function HarryWidget({ insightType = "lo_coaching", targetProfileId, compact = false }: HarryWidgetProps) {
  const [insight,    setInsight]    = useState<Insight | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback,   setFeedback]   = useState<string | null>(null);
  const [dismissed,  setDismissed]  = useState(false);

  useEffect(() => {
    fetchLatest();
  }, [insightType]);

  async function fetchLatest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/goal-engine/harry?type=${insightType}`);
      const { insights } = await res.json();
      if (insights?.length) {
        setInsight(insights[0]);
        setFeedback(insights[0].feedback ?? null);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function generate() {
    setGenerating(true);
    setInsight(null);
    try {
      const body: Record<string, string> = { insight_type: insightType };
      if (targetProfileId) body.target_profile_id = targetProfileId;
      const res = await fetch("/api/goal-engine/harry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { insight: newInsight, result } = await res.json();
      if (newInsight) { setInsight(newInsight); setFeedback(null); }
      else if (result) setInsight({ id:"", result_text:result, insight_type:insightType, created_at:new Date().toISOString(), feedback:null });
    } catch { /* silent */ }
    finally { setGenerating(false); }
  }

  async function sendFeedback(fb: string) {
    if (!insight?.id) return;
    setFeedback(fb);
    await fetch("/api/goal-engine/harry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: insight.id, feedback: fb }),
    });
  }

  async function dismiss() {
    if (!insight?.id) return;
    setDismissed(true);
    await fetch("/api/goal-engine/harry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: insight.id, dismiss: true }),
    });
  }

  if (dismissed) return null;

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.line}`,
      borderRadius: compact ? 16 : 20,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
    }}>
      {/* Header */}
      <div style={{
        background: C.navy,
        padding: compact ? "14px 18px" : "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `2px solid ${C.orange}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>H</div>
          <div>
            <p style={{ margin:0, fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing:".02em" }}>HARRY AI</p>
            <p style={{ margin:0, fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:".12em" }}>
              {TYPE_LABELS[insightType] ?? insightType}
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {insight && (
            <button onClick={dismiss} title="Dismiss" style={{
              background:"transparent", border:`1px solid rgba(255,255,255,0.15)`,
              borderRadius:6, padding:"3px 8px", color:"rgba(255,255,255,0.4)",
              fontSize:10, cursor:"pointer",
            }}>✕</button>
          )}
          <button
            onClick={generate}
            disabled={generating}
            style={{
              background: generating ? "rgba(255,255,255,0.08)" : "rgba(243,112,33,0.25)",
              border: "1px solid rgba(243,112,33,0.4)",
              borderRadius: 8, padding: "5px 12px",
              color: generating ? "rgba(255,255,255,0.35)" : "#FF9847",
              fontSize: 11, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {generating ? "Thinking…" : insight ? "↻ Refresh" : "Ask HARRY"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: compact ? "16px 18px" : "20px 24px" }}>
        {loading ? (
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height:8, flex:i===2?2:1, background:C.line, borderRadius:4, animation:`pulse 1.5s ${i*0.3}s infinite` }} />
            ))}
          </div>
        ) : !insight ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.7 }}>
              Click <strong style={{ color:C.ink }}>Ask HARRY</strong> to get a personalized insight based on your current production data.
            </p>
          </div>
        ) : (
          <>
            {/* Disclaimer */}
            <p style={{ margin:"0 0 10px", fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:C.muted }}>
              Based on your SLICE production data · AI-generated recommendation
            </p>
            {/* Insight text */}
            <p style={{ margin:"0 0 16px", fontSize: compact ? 13 : 14, color:C.ink, lineHeight:1.8 }}>
              {insight.result_text}
            </p>
            {/* Timestamp + Feedback */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, paddingTop:12, borderTop:`1px solid ${C.line}` }}>
              <span style={{ fontSize:10, color:C.muted }}>
                {new Date(insight.created_at).toLocaleString("en-US", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" })}
              </span>
              <div style={{ display:"flex", gap:6 }}>
                <span style={{ fontSize:10, color:C.muted, alignSelf:"center" }}>Was this helpful?</span>
                {(["helpful","not_helpful"] as const).map(fb => (
                  <button
                    key={fb}
                    onClick={() => sendFeedback(fb)}
                    style={{
                      padding:"3px 10px", borderRadius:6, fontSize:10, fontWeight:700,
                      border: `1px solid ${feedback===fb ? C.orange : C.line}`,
                      background: feedback===fb ? "rgba(243,112,33,0.1)" : C.white,
                      color: feedback===fb ? C.orange : C.muted,
                      cursor:"pointer",
                    }}
                  >
                    {fb === "helpful" ? "👍 Yes" : "👎 No"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
    </div>
  );
}
