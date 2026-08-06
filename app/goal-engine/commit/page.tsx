/**
 * /goal-engine/commit — Commitment Form (standalone dark design)
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveGoal, getCommitment, fmt$ } from "@/lib/goal-engine";
import { CommitFormDark } from "@/components/goal-engine/CommitFormDark";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommitPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  const goal = await getActiveGoal();
  const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", sand:"#F8FAFC", white:"#fff" };

  if (!goal) {
    return (
      <div style={{ padding:"32px 20px 60px", background:C.sand, minHeight:"100vh" }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <Link href="/goal-engine/dashboard" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Back</Link>
          <div style={{ marginTop:20, background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"60px 24px", textAlign:"center", boxShadow:"0 2px 12px rgba(15,23,42,0.06)" }}>
            <p style={{ fontSize:48, margin:"0 0 16px" }}>🎯</p>
            <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800, color:C.ink }}>No Active Goal</h2>
            <p style={{ margin:0, fontSize:13, color:C.muted }}>Leadership hasn&apos;t launched a goal yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const commitment = await getCommitment(goal.id, profile.id);

  return (
    <div style={{ padding:"32px 24px 60px", background:C.sand, minHeight:"100vh" }}>
    <div style={{ maxWidth:660, margin:"0 auto" }}>
      <Link href="/goal-engine/dashboard" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>
        ← Dashboard
      </Link>

      <div style={{ marginTop:24, marginBottom:28 }}>
        <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>SLICE by HCMG</p>
        <h1 style={{ margin:"6px 0 0", fontSize:28, fontWeight:900, color:C.ink, letterSpacing:"-0.3px" }}>Claim Your Slice 🥧</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>{goal.month_label}</p>
      </div>

      {/* Company context — navy card stays, it's the brand accent */}
      <div style={{
        background:C.navy,
        border:"1px solid rgba(243,112,33,0.2)",
        borderRadius:16, padding:"20px 24px", marginBottom:24,
      }}>
        <p style={{ margin:"0 0 14px", fontSize:9, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Company Goal · {goal.month_label}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          <div>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)" }}>Funded Volume</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>{fmt$(goal.funded_volume_goal)}</p>
          </div>
          <div>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)" }}>Units</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>{goal.funded_units_goal} Loans</p>
          </div>
        </div>
        {goal.clo_message && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ margin:"0 0 4px", fontSize:9, color:"rgba(255,255,255,0.35)", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase" }}>Leadership Message</p>
            <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.6)", fontStyle:"italic" }}>&ldquo;{goal.clo_message}&rdquo;</p>
          </div>
        )}
      </div>

      <CommitFormDark
        goalMonthId={goal.id}
        monthLabel={goal.month_label}
        fundedVolumeGoal={goal.funded_volume_goal}
        fundedUnitsGoal={goal.funded_units_goal}
        existingCommitment={commitment}
      />
    </div>
    </div>
  );
}
