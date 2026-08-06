/**
 * /goal-engine/awards — Trophy Room
 * All-time award archive for the logged-in LO.
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { fmt$ } from "@/lib/goal-engine";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", sand:"#F8FAFC", white:"#ffffff" };

const AWARD_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  "🏆": { bg:"#fffbeb", border:"#fde68a", color:"#92400e" },
  "🔥": { bg:"#fff7ed", border:"#fed7aa", color:"#9a3412" },
  "💰": { bg:"#f0fdf4", border:"#bbf7d0", color:"#166534" },
  "🎯": { bg:"#eff6ff", border:"#bfdbfe", color:"#1e40af" },
  "👑": { bg:"#faf5ff", border:"#d8b4fe", color:"#6b21a8" },
  "📈": { bg:"#ecfdf5", border:"#a7f3d0", color:"#065f46" },
  "⚡": { bg:"#fef9c3", border:"#fde047", color:"#854d0e" },
  "💎": { bg:"#f0f9ff", border:"#bae6fd", color:"#075985" },
};

function getAwardStyle(emoji: string | null) {
  return AWARD_COLORS[emoji ?? "🏆"] ?? { bg:"#fffbeb", border:"#fde68a", color:"#92400e" };
}

export default async function TrophyRoomPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  const sb = createServiceClient();

  const { data: awards } = await sb
    .from("goal_awards")
    .select(`
      *,
      goal_months(month_label, month_year, month_num)
    `)
    .eq("profile_id", profile.id)
    .order("issued_at", { ascending: false });

  const grouped: Record<string, typeof awards> = {};
  (awards ?? []).forEach(a => {
    const key = a.goal_months?.month_label ?? "—";
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(a);
  });

  const totalAwards    = awards?.length ?? 0;
  const milionClub     = awards?.filter(a => a.award_type.startsWith("million_dollar")).length ?? 0;
  const perfectGoal    = awards?.filter(a => a.award_type.startsWith("perfect_goal")).length ?? 0;
  const champAwards    = awards?.filter(a => a.award_type.includes("champion")).length ?? 0;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif", color:C.ink }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/dashboard" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Dashboard</Link>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:16 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>🏆</div>
          <div>
            <h1 style={{ margin:0, fontSize:28, fontWeight:900, color:C.ink }}>Trophy Room</h1>
            <p style={{ margin:"3px 0 0", fontSize:14, color:C.muted }}>{profile.full_name} · All-Time Recognition</p>
          </div>
        </div>
      </div>

      {/* Career summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }} className="ge-grid-4">
        {[
          { label:"Total Awards",       value:totalAwards.toString(),  navy:true },
          { label:"Champion Awards",    value:champAwards.toString()   },
          { label:"Million Dollar Club", value:milionClub.toString()   },
          { label:"Perfect Goals",      value:perfectGoal.toString()   },
        ].map(s => (
          <div key={s.label} style={{
            background: s.navy ? C.navy : C.white,
            border: s.navy ? "none" : `1px solid ${C.line}`,
            borderRadius:18, padding:20,
            boxShadow: s.navy ? "0 8px 32px rgba(20,40,80,0.25)" : "0 2px 8px rgba(15,23,42,0.05)",
          }}>
            <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color: s.navy ? "rgba(255,255,255,0.4)" : C.muted }}>{s.label}</p>
            <p style={{ margin:"8px 0 0", fontSize:28, fontWeight:900, color: s.navy ? "#fff" : C.ink }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {totalAwards === 0 && (
        <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:24, padding:"64px 32px", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🏆</div>
          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color:C.ink }}>No Awards Yet</h2>
          <p style={{ margin:"0 0 24px", fontSize:14, color:C.muted }}>Your Trophy Room will fill up as you hit goals and earn recognition.</p>
          <Link href="/goal-engine/commit" style={{ display:"inline-block", padding:"12px 24px", borderRadius:12, textDecoration:"none", background:"linear-gradient(135deg,#FF9847,#F37021)", color:"#fff", fontSize:13, fontWeight:800 }}>
            Claim My Slice →
          </Link>
        </div>
      )}

      {/* Awards by month */}
      {Object.entries(grouped).map(([monthLabel, monthAwards]) => (
        <div key={monthLabel} style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 14px", fontSize:11, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.muted }}>
            {monthLabel}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }} className="ge-grid-3">
            {(monthAwards ?? []).map(award => {
              const style = getAwardStyle(award.award_emoji);
              const stats = award.stats_snapshot as Record<string, unknown> | null;
              return (
                <div key={award.id} style={{
                  background:style.bg, border:`1.5px solid ${style.border}`,
                  borderRadius:20, padding:20,
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, border:`2px solid ${style.border}`, flexShrink:0 }}>
                      {award.award_emoji ?? "🏆"}
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:14, fontWeight:800, color:style.color }}>{award.award_label}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>{monthLabel}</p>
                    </div>
                  </div>
                  {stats && (
                    <div style={{ paddingTop:12, borderTop:`1px solid ${style.border}` }}>
                      {Object.entries(stats).slice(0,3).map(([k, v]) => (
                        <p key={k} style={{ margin:"0 0 2px", fontSize:11, color:style.color }}>
                          <strong>{k.replace(/_/g," ")}:</strong>{" "}
                          {typeof v === "number" && v > 10000 ? fmt$(v) : String(v)}
                        </p>
                      ))}
                    </div>
                  )}
                  {award.cert_number && (
                    <p style={{ margin:"10px 0 0", fontSize:10, color:C.muted, fontFamily:"monospace" }}>
                      Cert #{award.cert_number}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width:900px) { .ge-grid-3 { grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width:600px) { .ge-grid-3 { grid-template-columns:1fr !important; } .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
