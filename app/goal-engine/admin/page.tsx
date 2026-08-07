/**
 * /goal-engine/admin — Goal creation & management (admin/CLO only)
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { getAllGoals } from "@/lib/goal-engine";
import { GoalCreateForm } from "@/components/goal-engine/GoalCreateForm";
import { GoalAdminCard } from "@/components/goal-engine/GoalAdminCard";
import { SeedDemoButton } from "@/components/goal-engine/SeedDemoButton";
import { BackfillButton } from "@/components/goal-engine/BackfillButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

export default async function GoalEngineAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");
  if (!isAdmin(profile)) redirect("/goal-engine/dashboard");

  const goals  = await getAllGoals();
  const active = goals.filter(g => g.is_published);
  const drafts = goals.filter(g => !g.is_published);

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:12 }}>
        <div>
          <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Administration</p>
          <h1 style={{ margin:"6px 0 0", fontSize:28, fontWeight:900, color:C.ink }}>Manage Goals</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>Create monthly goals, manage emails, run awards.</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Link href="/goal-engine/admin/users" style={{
            padding:"10px 20px", borderRadius:12, textDecoration:"none",
            background:C.navy, color:"#fff", fontSize:13, fontWeight:700,
          }}>
            👥 Users
          </Link>
          <Link href="/goal-engine/admin/arive" style={{
            padding:"10px 20px", borderRadius:12, textDecoration:"none",
            background:"linear-gradient(135deg,#FF9847,#F37021)",
            color:"#fff", fontSize:13, fontWeight:700,
          }}>
            🔗 ARIVE Setup
          </Link>
          <Link href="/goal-engine/admin/webhook-log" style={{
            padding:"10px 20px", borderRadius:12, textDecoration:"none",
            background:C.white, border:`1.5px solid ${C.line}`,
            color:C.ink, fontSize:13, fontWeight:700,
            boxShadow:"0 1px 4px rgba(15,23,42,0.06)",
          }}>
            📡 Webhook Log
          </Link>
          <Link href="/goal-engine/admin/dashboard" style={{
            padding:"10px 20px", borderRadius:12, textDecoration:"none",
            background:C.white, border:`1.5px solid ${C.line}`,
            color:C.ink, fontSize:13, fontWeight:700,
            boxShadow:"0 1px 4px rgba(15,23,42,0.06)",
          }}>
            📊 Manager View
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }} className="ge-grid-4">
        {[
          { label:"Total Goals",     value:goals.length.toString() },
          { label:"Active",          value:active.length.toString(), accent:true },
          { label:"Drafts",          value:drafts.length.toString(), warn:true },
          { label:"Zapier Endpoint", value:"/api/goal-engine/zapier", small:true },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:16, padding:20, boxShadow:"0 1px 4px rgba(15,23,42,0.05)" }}>
            <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted }}>{s.label}</p>
            <p style={{ margin:"6px 0 0", fontSize:s.small ? 11 : 26, fontWeight:900, fontFamily:s.small?"monospace":"inherit", wordBreak:"break-all",
              color: s.accent ? "#16a34a" : s.warn ? "#d97706" : C.ink }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Seed Demo Data */}
      {goals.length === 0 && (
        <div style={{ background:"#fffbeb", border:"1.5px solid #fed7aa", borderRadius:16, padding:"20px 24px", marginBottom:24 }}>
          <p style={{ margin:"0 0 6px", fontSize:14, fontWeight:800, color:"#92400e" }}>🌱 No goals yet — seed demo data to get started</p>
          <p style={{ margin:"0 0 14px", fontSize:12, color:"#92400e" }}>
            Creates a current-month goal with $20M target and sample commitment + production data for your account.
            Run the <strong>Supabase migration first</strong>.
          </p>
          <SeedDemoButton />
        </div>
      )}

      {/* Backfill tool — always shown when goals exist */}
      {goals.length > 0 && <BackfillButton />}

      {/* Create form */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:28, marginBottom:24, boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
        <h2 style={{ margin:"0 0 4px", fontSize:16, fontWeight:800, color:C.ink }}>Create New Monthly Goal</h2>
        <p style={{ margin:"0 0 24px", fontSize:13, color:C.muted }}>
          Publishing automatically emails every active LO with the announcement.
        </p>
        <GoalCreateForm />
      </div>

      {/* Existing goals */}
      {goals.length > 0 && (
        <div>
          <h2 style={{ margin:"0 0 16px", fontSize:16, fontWeight:800, color:C.ink }}>All Goals</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {goals.map(goal => (
              <GoalAdminCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width:700px) { .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
