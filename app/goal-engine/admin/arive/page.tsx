"use client";

/**
 * /goal-engine/admin/arive — ARIVE × Zapier Integration Setup
 * Accurate documentation of how both webhook routes actually work.
 */

import { useState } from "react";
import Link from "next/link";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
  green: "#16a34a", greenBg: "#dcfce7",
  red: "#dc2626",  redBg: "#fee2e2",
  amber: "#d97706", amberBg: "#fef9c3",
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com";
const ZAPIER_URL = `${SITE}/api/goal-engine/zapier`;
const ARIVE_URL  = `${SITE}/api/goal-engine/arive-webhook`;

type TestResult = { ok: boolean; data: unknown } | null;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy} style={{
      padding:"4px 12px", borderRadius:6, border:`1px solid ${C.line}`,
      background: copied ? C.greenBg : C.white, color: copied ? C.green : C.ink,
      fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.2s",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ background:"#0f1b2d", borderRadius:12, overflow:"hidden", marginBottom:8 }}>
      {label && (
        <div style={{ padding:"8px 16px", borderBottom:`1px solid rgba(255,255,255,0.08)`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre style={{ margin:0, padding:"16px", fontSize:12, color:"#e2e8f0", fontFamily:"'Menlo','Monaco','Consolas',monospace", overflowX:"auto", lineHeight:1.6 }}>
        {code}
      </pre>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"28px 32px", marginBottom:20, boxShadow:"0 1px 6px rgba(15,23,42,0.05)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff", flexShrink:0 }}>
          {num}
        </div>
        <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.ink }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldRow({ field, value, note }: { field: string; value: string; note?: string }) {
  return (
    <tr style={{ borderBottom:`1px solid ${C.line}` }}>
      <td style={{ padding:"12px 16px", fontSize:12, fontWeight:700, color:C.ink, whiteSpace:"nowrap" as const }}>{field}</td>
      <td style={{ padding:"12px 16px" }}>
        <code style={{ fontSize:12, background:C.sand, padding:"2px 8px", borderRadius:4, color:C.navy, border:`1px solid ${C.line}` }}>{value}</code>
      </td>
      {note && <td style={{ padding:"12px 16px", fontSize:11, color:C.muted }}>{note}</td>}
    </tr>
  );
}

function ResultBox({ result, label }: { result: TestResult; label: string }) {
  if (!result) return null;
  return (
    <div style={{ marginTop:14, background: result.ok ? C.greenBg : C.redBg, border:`1px solid ${result.ok ? "#86efac" : "#fca5a5"}`, borderRadius:10, padding:"14px 18px" }}>
      <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color: result.ok ? C.green : C.red }}>
        {result.ok ? `✅ ${label} passed!` : `❌ ${label} failed`}
      </p>
      <pre style={{ margin:0, fontSize:11, color: result.ok ? "#166534" : "#991b1b", fontFamily:"monospace", overflowX:"auto" }}>
        {JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}

export default function ArivePage() {
  const [testEmail,  setTestEmail]  = useState("");
  const [testVolume, setTestVolume] = useState("485000");
  const [testLoanId, setTestLoanId] = useState("");
  const [testSecret, setTestSecret] = useState("");

  const [testingZapFunded,  setTestingZapFunded]  = useState(false);
  const [testingZapApp,     setTestingZapApp]      = useState(false);
  const [testingNative,     setTestingNative]      = useState(false);
  const [zapFundedResult,   setZapFundedResult]    = useState<TestResult>(null);
  const [zapAppResult,      setZapAppResult]       = useState<TestResult>(null);
  const [nativeResult,      setNativeResult]       = useState<TestResult>(null);

  const loanIdForTest = testLoanId || `TEST-${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];

  async function testZapFunded() {
    setTestingZapFunded(true); setZapFundedResult(null);
    try {
      const res = await fetch(ZAPIER_URL, {
        method:"POST",
        headers: { "Content-Type":"application/json", ...(testSecret ? { "x-zapier-secret": testSecret } : {}) },
        body: JSON.stringify({
          lo_email:      testEmail,
          loan_id:       loanIdForTest,
          funded_date:   today,
          funded_volume: parseFloat(testVolume) || 485000,
          funded_unit:   1,
        }),
      });
      setZapFundedResult({ ok: res.ok, data: await res.json() });
    } catch (e) { setZapFundedResult({ ok:false, data: String(e) }); }
    setTestingZapFunded(false);
  }

  async function testZapApp() {
    setTestingZapApp(true); setZapAppResult(null);
    try {
      const res = await fetch(ZAPIER_URL, {
        method:"POST",
        headers: { "Content-Type":"application/json", ...(testSecret ? { "x-zapier-secret": testSecret } : {}) },
        body: JSON.stringify({
          lo_email:   testEmail,
          loan_id:    loanIdForTest,
          app_date:   today,
          app_volume: parseFloat(testVolume) || 485000,
          app_unit:   1,
        }),
      });
      setZapAppResult({ ok: res.ok, data: await res.json() });
    } catch (e) { setZapAppResult({ ok:false, data: String(e) }); }
    setTestingZapApp(false);
  }

  async function testNativeArive() {
    setTestingNative(true); setNativeResult(null);
    try {
      const res = await fetch(ARIVE_URL, {
        method:"POST",
        headers: { "Content-Type":"application/json", ...(testSecret ? { "x-arive-secret": testSecret } : {}) },
        body: JSON.stringify({
          event: "loan.funded",
          loan: {
            id:               loanIdForTest,
            loanOfficerEmail: testEmail,
            loanAmount:       parseFloat(testVolume) || 485000,
            fundedDate:       today,
            applicationDate:  today,
          },
        }),
      });
      setNativeResult({ ok: res.ok, data: await res.json() });
    } catch (e) { setNativeResult({ ok:false, data: String(e) }); }
    setTestingNative(false);
  }

  /* ── Payload samples ── */
  const zapierFundedPayload = JSON.stringify({
    lo_nmls:       "123456",
    lo_email:      "johndoe@hcmgloans.com",
    loan_id:       "ARIVE-LN-00012345",
    funded_date:   "2025-07-15",
    funded_volume: 485000,
    funded_unit:   1,
  }, null, 2);

  const zapierAppPayload = JSON.stringify({
    lo_nmls:    "123456",
    lo_email:   "johndoe@hcmgloans.com",
    loan_id:    "ARIVE-LN-00012345",
    app_date:   "2025-07-01",
    app_volume: 485000,
    app_unit:   1,
  }, null, 2);

  const ariveNativeFundedPayload = JSON.stringify({
    event: "loan.funded",
    loan: {
      id:               "ARIVE-LN-00012345",
      loanOfficerNmls:  "123456",
      loanOfficerEmail: "johndoe@hcmgloans.com",
      loanOfficerId:    "arive-internal-id",
      loanAmount:       485000,
      fundedDate:       "2025-07-15",
      applicationDate:  "2025-07-01",
    },
  }, null, 2);

  const ariveNativeAppPayload = JSON.stringify({
    event: "loan.application_submitted",
    loan: {
      id:               "ARIVE-LN-00012345",
      loanOfficerNmls:  "123456",
      loanOfficerEmail: "johndoe@hcmgloans.com",
      loanOfficerId:    "arive-internal-id",
      loanAmount:       485000,
      applicationDate:  "2025-07-01",
    },
  }, null, 2);

  const canTest = !!testEmail;

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Back to Admin</Link>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            🔗
          </div>
          <div>
            <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Integration Setup</p>
            <h1 style={{ margin:"4px 0 0", fontSize:26, fontWeight:900, color:C.ink }}>ARIVE × SLICE Integration</h1>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.muted }}>Connect ARIVE to SLICE so funded loans automatically update the leaderboard.</p>
          </div>
        </div>
      </div>

      {/* Endpoint URLs */}
      <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:14, padding:"16px 20px", marginBottom:12 }}>
        <p style={{ margin:"0 0 10px", fontSize:12, fontWeight:800, color:"#166534" }}>✅ Both webhook endpoints are live</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { label:"Zapier endpoint",        url:ZAPIER_URL },
            { label:"ARIVE native endpoint",  url:ARIVE_URL  },
          ].map(e => (
            <div key={e.url} style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#166534", minWidth:160 }}>{e.label}</span>
              <code style={{ fontSize:11, background:"#dcfce7", padding:"3px 10px", borderRadius:6, color:"#166534", border:"1px solid #86efac", fontFamily:"monospace" }}>
                POST {e.url}
              </code>
              <CopyButton text={e.url} />
            </div>
          ))}
        </div>
      </div>

      {/* How SLICE matches loans to LOs */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"24px 28px", marginBottom:20, boxShadow:"0 1px 6px rgba(15,23,42,0.05)" }}>
        <h2 style={{ margin:"0 0 6px", fontSize:15, fontWeight:800, color:C.ink }}>🔑 How SLICE Matches a Loan to a Loan Officer</h2>
        <p style={{ margin:"0 0 16px", fontSize:13, color:C.muted, lineHeight:1.8 }}>
          SLICE tries three lookups in priority order. The first match wins.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
          {[
            { priority:"1st", icon:"🏆", label:"NMLS", zapier:"lo_nmls", native:"loanOfficerNmls", desc:"Most reliable — never changes per LO." },
            { priority:"2nd", icon:"📧", label:"Email", zapier:"lo_email", native:"loanOfficerEmail", desc:"Fallback. Must match SLICE profile email exactly." },
            { priority:"3rd", icon:"🔑", label:"ARIVE LO ID", zapier:"(not supported)", native:"loanOfficerId", desc:"Native webhook only. Set arive_lo_id in Team Members." },
          ].map(r => (
            <div key={r.priority} style={{ background:C.sand, borderRadius:12, padding:"14px 16px", border:`1px solid ${C.line}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:18 }}>{r.icon}</span>
                <div>
                  <span style={{ fontSize:9, fontWeight:800, color:C.orange, textTransform:"uppercase", letterSpacing:".1em" }}>{r.priority} priority</span>
                  <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{r.label}</p>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div><span style={{ fontSize:10, color:C.muted }}>Zapier field: </span><code style={{ fontSize:10, color:C.navy }}>{r.zapier}</code></div>
                <div><span style={{ fontSize:10, color:C.muted }}>ARIVE field: </span><code style={{ fontSize:10, color:C.navy }}>{r.native}</code></div>
              </div>
              <p style={{ margin:"8px 0 0", fontSize:11, color:C.muted, lineHeight:1.5 }}>{r.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ margin:0, fontSize:12, color:"#92400e", lineHeight:1.8 }}>
            <strong>⚠️ Important:</strong> Make sure each LO&apos;s Supabase profile email matches their ARIVE account email exactly.
            NMLS is strongly preferred — it&apos;s immune to email typos and address changes.
            You can verify in <Link href="/goal-engine/admin" style={{ color:C.orange, fontWeight:700 }}>Admin → Manage Goals</Link>.
          </p>
        </div>
      </div>

      {/* How the merge logic works */}
      <div style={{ background:C.navy, borderRadius:20, padding:"24px 28px", marginBottom:20 }}>
        <h2 style={{ margin:"0 0 12px", fontSize:15, fontWeight:800, color:"#fff" }}>⚡ How the Merge Logic Works — One Row Per Loan</h2>
        <p style={{ margin:"0 0 16px", fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.8 }}>
          SLICE stores <strong style={{ color:"#fff" }}>one row per loan per LO</strong>, keyed on <code style={{ color:"#f97316" }}>(loan_id, profile_id)</code>.
          App and funded events merge into the same row — they never overwrite each other.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          {[
            { title:"App event arrives first", body:"Row created with app_date + app_volume. funded_date and funded_volume are null." },
            { title:"Funded event arrives later", body:"Same row updated: funded_date + funded_volume added. App fields untouched." },
            { title:"Funded event arrives first (ARIVE skipped app event)", body:"Row created with funded fields. App fields filled with funded_date as best-effort fallback." },
            { title:"Same event fires twice (ARIVE retry)", body:"Idempotent. Same (loan_id, profile_id) key → update in place. No duplicate rows, no data lost." },
          ].map(item => (
            <div key={item.title} style={{ background:"rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
              <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color:"#f97316" }}>{item.title}</p>
              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, background:"rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
          <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.8 }}>
            <strong style={{ color:"#fff" }}>📅 Goal month is matched by date, not by today.</strong>{" "}
            The <code style={{ color:"#f97316" }}>funded_date</code> or <code style={{ color:"#f97316" }}>app_date</code> in the payload
            is matched to the goal month whose <code style={{ color:"#f97316" }}>start_date</code>–<code style={{ color:"#f97316" }}>end_date</code> contains it.
            This means a loan funded on July 31 will always count toward the July goal even if it arrives after July ends.
            If no date-matching goal is found, the currently active goal is used as a fallback.
          </p>
        </div>
      </div>

      {/* Option banners */}
      <div style={{ background:C.navy, borderRadius:16, padding:"16px 24px", marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:20 }}>⚡</span>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#fff" }}>Two Ways to Connect ARIVE to SLICE</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"rgba(255,255,255,0.6)" }}>Option A: Zapier (no-code, easiest) · Option B: ARIVE native webhook (direct)</p>
        </div>
      </div>

      {/* ════════════ OPTION A: ZAPIER ════════════ */}
      <div style={{ background:C.white, border:`2px solid ${C.orange}`, borderRadius:20, padding:"22px 28px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <span style={{ fontSize:18 }}>⚡</span>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>Option A — Zapier (Recommended)</p>
          <span style={{ background:"#fef9c3", color:"#854d0e", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:99 }}>EASIEST</span>
        </div>

        <Step num={1} title="Create a Zapier account (free tier works)">
          <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.8 }}>
            Go to <strong style={{ color:C.ink }}>zapier.com</strong> and sign up. The free plan supports the two Zaps you need.
          </p>
        </Step>

        <Step num={2} title="Create TWO Zaps — one per event type">
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
            <p style={{ margin:0, fontSize:12, color:"#92400e", lineHeight:1.8 }}>
              <strong>Why two Zaps?</strong> Each Zap only has access to its own event&apos;s fields.
              Sending both events from one Zap would corrupt the merge — the second fire would
              appear to have empty funded or app fields, overwriting good data. Two Zaps = clean, safe merge.
            </p>
          </div>

          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:800, color:C.ink }}>Zap 1 — Loan Funded</p>
          <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}`, marginBottom:16 }}>
            <tbody>
              <FieldRow field="Trigger App"    value="ARIVE" />
              <FieldRow field="Trigger Event"  value="Loan Funded" note="Fires when a loan reaches Funded status" />
              <FieldRow field="Action App"     value="Webhooks by Zapier" />
              <FieldRow field="Action Event"   value="POST" />
              <FieldRow field="URL"            value={ZAPIER_URL} note="← Your SLICE Zapier endpoint" />
              <FieldRow field="Payload Type"   value="json" />
              <FieldRow field="Header"         value="x-zapier-secret: (optional — see env vars below)" />
            </tbody>
          </table>
          <CodeBlock label="Zap 1 — funded event body" code={zapierFundedPayload} />
          <div style={{ marginTop:8, marginBottom:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { field:"lo_nmls",       from:"ARIVE: Loan Officer NMLS",  required:true,  note:"Preferred — most reliable" },
              { field:"lo_email",      from:"ARIVE: Loan Officer Email",  required:false, note:"Fallback to NMLS" },
              { field:"loan_id",       from:"ARIVE: Loan ID",             required:true,  note:"Required for dedup / merge" },
              { field:"funded_date",   from:"ARIVE: Close Date / Funded Date", required:true,  note:"Used to match the goal month" },
              { field:"funded_volume", from:"ARIVE: Loan Amount",         required:true,  note:"Dollar amount" },
              { field:"funded_unit",   from:"Hard-code: 1",               required:false, note:"SLICE always counts 1 per row" },
            ].map(f => (
              <div key={f.field} style={{ background:C.sand, borderRadius:8, padding:"10px 14px", border:`1px solid ${C.line}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <code style={{ fontSize:11, color:C.navy, fontWeight:700 }}>{f.field}</code>
                  {f.required && <span style={{ fontSize:9, background:"#fee2e2", color:"#991b1b", padding:"1px 5px", borderRadius:3, fontWeight:800 }}>required</span>}
                </div>
                <p style={{ margin:0, fontSize:11, color:C.muted }}>← {f.from}</p>
                {f.note && <p style={{ margin:"2px 0 0", fontSize:10, color:C.orange }}>{f.note}</p>}
              </div>
            ))}
          </div>

          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:800, color:C.ink }}>Zap 2 — Application Submitted</p>
          <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}`, marginBottom:16 }}>
            <tbody>
              <FieldRow field="Trigger App"    value="ARIVE" />
              <FieldRow field="Trigger Event"  value="Application Submitted" note="Fires when a new application is created" />
              <FieldRow field="Action App"     value="Webhooks by Zapier" />
              <FieldRow field="Action Event"   value="POST" />
              <FieldRow field="URL"            value={ZAPIER_URL} note="← Same endpoint as Zap 1" />
              <FieldRow field="Payload Type"   value="json" />
            </tbody>
          </table>
          <CodeBlock label="Zap 2 — application event body" code={zapierAppPayload} />
          <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { field:"lo_nmls",    from:"ARIVE: Loan Officer NMLS",  required:true,  note:"Preferred — most reliable" },
              { field:"lo_email",   from:"ARIVE: Loan Officer Email",  required:false, note:"Fallback to NMLS" },
              { field:"loan_id",    from:"ARIVE: Loan ID",             required:true,  note:"Required for dedup / merge" },
              { field:"app_date",   from:"ARIVE: Application Date",    required:true,  note:"Used to match the goal month" },
              { field:"app_volume", from:"ARIVE: Loan Amount",         required:true,  note:"Dollar amount" },
              { field:"app_unit",   from:"Hard-code: 1",               required:false, note:"SLICE always counts 1 per row" },
            ].map(f => (
              <div key={f.field} style={{ background:C.sand, borderRadius:8, padding:"10px 14px", border:`1px solid ${C.line}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <code style={{ fontSize:11, color:C.navy, fontWeight:700 }}>{f.field}</code>
                  {f.required && <span style={{ fontSize:9, background:"#fee2e2", color:"#991b1b", padding:"1px 5px", borderRadius:3, fontWeight:800 }}>required</span>}
                </div>
                <p style={{ margin:0, fontSize:11, color:C.muted }}>← {f.from}</p>
                {f.note && <p style={{ margin:"2px 0 0", fontSize:10, color:C.orange }}>{f.note}</p>}
              </div>
            ))}
          </div>
        </Step>

        <Step num={3} title="How SLICE detects which event type Zapier sent">
          <p style={{ margin:"0 0 12px", fontSize:13, color:C.muted, lineHeight:1.8 }}>
            Unlike the native webhook, Zapier doesn&apos;t send an <code style={{ background:C.sand, padding:"1px 6px", borderRadius:4, color:C.navy }}>event</code> field.
            SLICE determines the event type by inspecting which fields are present:
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ background:C.sand, borderRadius:10, padding:"14px 16px", border:`1px solid ${C.line}` }}>
              <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color:C.navy }}>Funded event detected when:</p>
              <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                Payload contains <code style={{ color:C.navy }}>funded_date</code> and/or <code style={{ color:C.navy }}>funded_volume</code>
              </p>
            </div>
            <div style={{ background:C.sand, borderRadius:10, padding:"14px 16px", border:`1px solid ${C.line}` }}>
              <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color:C.navy }}>Application event detected when:</p>
              <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                Payload contains <code style={{ color:C.navy }}>app_date</code> and/or <code style={{ color:C.navy }}>app_volume</code> (but no funded fields)
              </p>
            </div>
          </div>
          <div style={{ marginTop:12, background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px" }}>
            <p style={{ margin:0, fontSize:12, color:"#991b1b", lineHeight:1.8 }}>
              <strong>⚠️ Never send both funded and app fields in one Zap.</strong> If <code>funded_date</code> is present,
              SLICE treats the whole payload as a funded event — meaning app fields in the same payload would be
              ignored in favor of what&apos;s already in the database.
            </p>
          </div>
        </Step>

        <Step num={4} title="Test and activate both Zaps">
          <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.8 }}>
            Use Zapier&apos;s built-in test to fire a sample payload. A successful response will return{" "}
            <code style={{ background:C.sand, padding:"1px 6px", borderRadius:4, color:C.green, fontWeight:700 }}>&quot;status&quot;: &quot;created&quot;</code>{" "}
            or <code style={{ background:C.sand, padding:"1px 6px", borderRadius:4, color:C.green, fontWeight:700 }}>&quot;status&quot;: &quot;updated&quot;</code>.
            Once confirmed, turn both Zaps ON. Every funded loan and new application in ARIVE will now automatically flow into SLICE.
          </p>
        </Step>
      </div>

      {/* ════════════ OPTION B: NATIVE WEBHOOK ════════════ */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"22px 28px", marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <span style={{ fontSize:18 }}>🔌</span>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>Option B — ARIVE Native Webhook</p>
          <span style={{ background:C.sand, color:C.muted, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:99 }}>DIRECT</span>
        </div>
        <p style={{ margin:"0 0 16px", fontSize:13, color:C.muted, lineHeight:1.8 }}>
          If ARIVE supports outbound webhooks (check <strong>ARIVE Settings → Integrations → Webhooks</strong>),
          you can skip Zapier entirely and have ARIVE post directly to SLICE.
          The native route also supports a 3rd LO match priority (<code style={{ background:C.sand, padding:"1px 5px", borderRadius:4, color:C.navy }}>loanOfficerId</code>).
        </p>

        <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}`, marginBottom:20 }}>
          <tbody>
            <FieldRow field="Endpoint URL"   value={ARIVE_URL} />
            <FieldRow field="Events"         value="loan.funded, loan.application_submitted" note="Also accepts LOAN_FUNDED, APPLICATION_SUBMITTED variants" />
            <FieldRow field="Auth header"    value="x-arive-secret: <your secret>" note="Optional — if ARIVE_WEBHOOK_SECRET env var is set" />
            <FieldRow field="Also accepted"  value="x-webhook-secret  or  Authorization: Bearer <secret>" note="All three auth header styles work" />
          </tbody>
        </table>

        <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:800, color:C.ink }}>Funded event payload</p>
        <CodeBlock label="loan.funded" code={ariveNativeFundedPayload} />

        <p style={{ margin:"16px 0 8px", fontSize:13, fontWeight:800, color:C.ink }}>Application event payload</p>
        <CodeBlock label="loan.application_submitted" code={ariveNativeAppPayload} />

        <div style={{ marginTop:12, background:C.sand, borderRadius:10, padding:"12px 16px", border:`1px solid ${C.line}` }}>
          <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.8 }}>
            <strong style={{ color:C.ink }}>loanOfficerId</strong> is the 3rd-priority LO match (native webhook only).
            To use it, set the <code style={{ color:C.navy }}>arive_lo_id</code> field on each LO&apos;s profile in{" "}
            <Link href="/goal-engine/admin" style={{ color:C.orange, fontWeight:700 }}>Admin → Team Members</Link>.
          </p>
        </div>
      </div>

      {/* ════════════ LIVE TESTER ════════════ */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"28px 32px", marginBottom:28, boxShadow:"0 1px 6px rgba(15,23,42,0.05)" }}>
        <h2 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:C.ink }}>🧪 Live Webhook Tester</h2>
        <p style={{ margin:"0 0 20px", fontSize:13, color:C.muted }}>
          Fire a test record directly against the live endpoints. Each button sends only the fields for its event type — matching how real Zaps work.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>LO Email *</label>
            <input
              type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
              placeholder="johndoe@hcmgloans.com"
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Funded Volume ($)</label>
            <input
              type="number" value={testVolume} onChange={e => setTestVolume(e.target.value)}
              placeholder="485000"
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
            />
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Loan ID (optional — auto-generated if blank)</label>
            <input
              type="text" value={testLoanId} onChange={e => setTestLoanId(e.target.value)}
              placeholder="TEST-1234  (leave blank to auto)"
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Webhook Secret (leave blank if not set)</label>
            <input
              type="text" value={testSecret} onChange={e => setTestSecret(e.target.value)}
              placeholder="Only needed if ZAPIER_WEBHOOK_SECRET / ARIVE_WEBHOOK_SECRET is set"
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
            />
          </div>
        </div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button
            onClick={testZapFunded}
            disabled={!canTest || testingZapFunded}
            style={{
              padding:"12px 22px", borderRadius:12, border:"none",
              background: !canTest ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
              color: !canTest ? C.muted : "#fff",
              fontSize:13, fontWeight:800, cursor: canTest ? "pointer" : "not-allowed", fontFamily:"inherit",
            }}
          >{testingZapFunded ? "Sending…" : "⚡ Zapier — Funded Event"}</button>

          <button
            onClick={testZapApp}
            disabled={!canTest || testingZapApp}
            style={{
              padding:"12px 22px", borderRadius:12, border:`1.5px solid ${C.orange}`,
              background: C.white,
              color: !canTest ? C.muted : C.orange,
              fontSize:13, fontWeight:800, cursor: canTest ? "pointer" : "not-allowed", fontFamily:"inherit",
            }}
          >{testingZapApp ? "Sending…" : "⚡ Zapier — Application Event"}</button>

          <button
            onClick={testNativeArive}
            disabled={!canTest || testingNative}
            style={{
              padding:"12px 22px", borderRadius:12, border:`1.5px solid ${C.line}`,
              background: C.white,
              color: !canTest ? C.muted : C.ink,
              fontSize:13, fontWeight:800, cursor: canTest ? "pointer" : "not-allowed", fontFamily:"inherit",
            }}
          >{testingNative ? "Sending…" : "🔌 Native — Funded Event"}</button>
        </div>

        {!canTest && (
          <p style={{ margin:"12px 0 0", fontSize:12, color:C.muted }}>Enter an LO email above to enable the test buttons.</p>
        )}

        <ResultBox result={zapFundedResult}  label="Zapier funded event" />
        <ResultBox result={zapAppResult}     label="Zapier application event" />
        <ResultBox result={nativeResult}     label="Native webhook funded event" />
      </div>

      {/* Env vars */}
      <div style={{ background:C.navy, borderRadius:20, padding:"24px 28px" }}>
        <h2 style={{ margin:"0 0 6px", fontSize:15, fontWeight:800, color:"#fff" }}>🔐 Vercel Environment Variables</h2>
        <p style={{ margin:"0 0 16px", fontSize:12, color:"rgba(255,255,255,0.45)" }}>
          Vercel Dashboard → hcmg-web → Settings → Environment Variables
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { key:"ZAPIER_WEBHOOK_SECRET",  optional:true,  desc:"Secret string sent in Zapier header x-zapier-secret. Optional — if not set, the Zapier endpoint accepts all requests (rely on the secret URL instead)." },
            { key:"ARIVE_WEBHOOK_SECRET",   optional:true,  desc:"Secret for ARIVE native webhook header x-arive-secret. Optional — same policy as above." },
            { key:"GOAL_ENGINE_TEST_MODE",  optional:false, desc:"Set to false in production. When true, all goal emails are redirected to GOAL_ENGINE_TEST_EMAIL." },
            { key:"GOAL_ENGINE_TEST_EMAIL", optional:false, desc:"e.g. darius@hcmgloans.com — receives all emails while test mode is on." },
            { key:"CRON_SECRET",            optional:false, desc:"Secures the weekly email cron job at /api/goal-engine/weekly-email." },
          ].map(v => (
            <div key={v.key} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
                <code style={{ fontSize:12, color:"#f97316", fontFamily:"monospace", fontWeight:700 }}>{v.key}</code>
                {v.optional
                  ? <span style={{ fontSize:9, background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.5)", padding:"1px 6px", borderRadius:3, fontWeight:800 }}>OPTIONAL</span>
                  : <span style={{ fontSize:9, background:"#dc2626", color:"#fff", padding:"1px 6px", borderRadius:3, fontWeight:800 }}>REQUIRED</span>
                }
              </div>
              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
