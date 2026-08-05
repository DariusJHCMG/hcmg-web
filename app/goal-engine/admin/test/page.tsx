/**
 * /goal-engine/admin/test — Demo & Testing Control Panel
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { getActiveLoanOfficers } from "@/lib/goal-engine";
import { isTestMode, TEST_EMAIL } from "@/lib/goal-engine-mailer";
import Link from "next/link";
import { TestEmailPanel } from "@/components/goal-engine/TestEmailPanel";

export const dynamic = "force-dynamic";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

export default async function GoalEngineTestPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");
  if (!isAdmin(profile)) redirect("/goal-engine/dashboard");

  const los       = await getActiveLoanOfficers();
  const testMode  = isTestMode();
  const testEmail = TEST_EMAIL;

  return (
    <div style={{ maxWidth:1000, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:12 }}>
        <div>
          <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Manage Goals</Link>
          <p style={{ margin:"12px 0 0", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Administration</p>
          <h1 style={{ margin:"4px 0 0", fontSize:28, fontWeight:900, color:C.ink }}>Demo & Test Panel</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>Preview emails, impersonate LOs, and control test mode.</p>
        </div>
      </div>

      {/* Test Mode Banner */}
      <div style={{
        padding:"16px 20px", borderRadius:14, marginBottom:28,
        background: testMode ? "#fef9c3" : "#dcfce7",
        border: testMode ? "1.5px solid #fcd34d" : "1.5px solid #86efac",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", justifyContent:"space-between" }}>
          <div>
            <p style={{ margin:0, fontSize:14, fontWeight:800, color: testMode ? "#854d0e" : "#166534" }}>
              {testMode ? "🧪 TEST MODE IS ON" : "🚀 LIVE MODE — emails go to real LOs"}
            </p>
            <p style={{ margin:"3px 0 0", fontSize:12, color: testMode ? "#92400e" : "#166534" }}>
              {testMode
                ? `All goal engine emails are intercepted and sent to ${testEmail} instead of real LOs.`
                : "GOAL_ENGINE_TEST_MODE is false — all emails go to real recipients."}
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ padding:"6px 14px", borderRadius:8, background: testMode ? "#fcd34d" : "#86efac", fontSize:11, fontWeight:800, color: testMode ? "#78350f" : "#14532d" }}>
              {testMode ? "TEST" : "LIVE"}
            </div>
          </div>
        </div>
        {testMode && (
          <p style={{ margin:"10px 0 0", fontSize:11, color:"#92400e" }}>
            To go live: open <code style={{ background:"#fef08a", padding:"1px 5px", borderRadius:4 }}>.env.local</code> and set{" "}
            <code style={{ background:"#fef08a", padding:"1px 5px", borderRadius:4 }}>GOAL_ENGINE_TEST_MODE=false</code>, then redeploy.
          </p>
        )}
      </div>

      {/* Email Preview Panel — client component */}
      <TestEmailPanel testEmail={testEmail} />

      {/* Impersonate LO */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:28, marginBottom:24, boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
        <h2 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:C.ink }}>🎭 View as Loan Officer</h2>
        <p style={{ margin:"0 0 20px", fontSize:13, color:C.muted }}>
          Open any LO's dashboard view in a new tab. You'll see exactly what they see — their commitment form, KPI cards, leaderboard rank, and notifications.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {los.length === 0 && (
            <p style={{ margin:0, fontSize:13, color:C.muted }}>No active loan officers found. Run the demo seed first.</p>
          )}
          {los.map(lo => (
            <div key={lo.id} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 18px", borderRadius:12,
              background:C.sand, border:`1px solid ${C.line}`,
              flexWrap:"wrap", gap:10,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {lo.avatar_url
                  ? <img src={lo.avatar_url} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.line}` }} />
                  : <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff" }}>
                      {lo.full_name.split(" ").map((n: string) => n[0]).slice(0,2).join("")}
                    </div>
                }
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{lo.full_name}</p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:C.muted }}>{lo.email}{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <a href={`/goal-engine/dashboard?preview_as=${lo.id}`} target="_blank" rel="noopener noreferrer" style={{
                  padding:"7px 16px", borderRadius:10, textDecoration:"none",
                  background:C.navy, color:"#fff", fontSize:12, fontWeight:700,
                }}>
                  👁 Dashboard
                </a>
                <a href={`/goal-engine/commit?preview_as=${lo.id}`} target="_blank" rel="noopener noreferrer" style={{
                  padding:"7px 16px", borderRadius:10, textDecoration:"none",
                  background:"linear-gradient(135deg,#FF9847,#F37021)", color:"#fff", fontSize:12, fontWeight:700,
                }}>
                  🥧 Commit Form
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:28, boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
        <h2 style={{ margin:"0 0 16px", fontSize:16, fontWeight:800, color:C.ink }}>🔗 Quick Test Links</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }} className="test-grid-2">
          {[
            { label:"LO Dashboard",       href:"/goal-engine/dashboard",          desc:"What every LO sees" },
            { label:"Commit Form",         href:"/goal-engine/commit",             desc:"The 'Claim My Slice' form" },
            { label:"Leaderboard",         href:"/goal-engine/leaderboard",        desc:"Public ranking board" },
            { label:"Admin — Manage Goals",href:"/goal-engine/admin",              desc:"Create goals, run awards" },
            { label:"Manager Dashboard",   href:"/goal-engine/admin/dashboard",    desc:"All LOs, pace, attention" },
            { label:"Zapier Endpoint",     href:"/api/goal-engine/zapier",         desc:"POST production data here" },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{
              display:"block", padding:"14px 18px", borderRadius:12, textDecoration:"none",
              background:C.sand, border:`1px solid ${C.line}`,
            }}>
              <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{l.label}</p>
              <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>{l.desc}</p>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width:600px) { .test-grid-2 { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
