"use client";

/**
 * /goal-engine/admin/arive — ARIVE × Zapier Integration Setup
 * Full step-by-step guide + live webhook tester for Darius.
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
const WEBHOOK_URL = `${SITE}/api/goal-engine/zapier`;

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

export default function ArivePage() {
  const [testEmail,  setTestEmail]  = useState("");
  const [testVolume, setTestVolume] = useState("485000");
  const [testSecret, setTestSecret] = useState("");
  const [testResult, setTestResult] = useState<TestResult>(null);
  const [testing,    setTesting]    = useState(false);
  const [sendingNative, setSendingNative] = useState(false);
  const [nativeResult,  setNativeResult]  = useState<TestResult>(null);

  async function runWebhookTest() {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch("/api/goal-engine/zapier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(testSecret ? { "x-zapier-secret": testSecret } : {}),
        },
        body: JSON.stringify({
          lo_email:     testEmail,
          loan_id:      `TEST-${Date.now()}`,
          funded_date:  new Date().toISOString().split("T")[0],
          funded_volume: parseFloat(testVolume) || 0,
          funded_unit:  1,
          app_date:     new Date().toISOString().split("T")[0],
          app_volume:   parseFloat(testVolume) || 0,
          app_unit:     1,
        }),
      });
      const data = await res.json();
      setTestResult({ ok: res.ok, data });
    } catch (e) {
      setTestResult({ ok: false, data: String(e) });
    }
    setTesting(false);
  }

  async function testNativeArive() {
    setSendingNative(true); setNativeResult(null);
    try {
      const res = await fetch("/api/goal-engine/arive-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-arive-secret": testSecret || "test" },
        body: JSON.stringify({
          event: "loan.funded",
          loan: {
            id: `ARIVE-TEST-${Date.now()}`,
            loanOfficerEmail: testEmail,
            loanAmount: parseFloat(testVolume) || 485000,
            fundedDate: new Date().toISOString().split("T")[0],
            applicationDate: new Date().toISOString().split("T")[0],
          }
        }),
      });
      const data = await res.json();
      setNativeResult({ ok: res.ok, data });
    } catch (e) {
      setNativeResult({ ok: false, data: String(e) });
    }
    setSendingNative(false);
  }

  const zapierPayloadExample = JSON.stringify({
    lo_email:      "johndoe@hcmgloans.com",
    lo_nmls:       "123456",
    loan_id:       "ARIVE-LN-00012345",
    funded_date:   "2025-07-15",
    funded_volume: 485000,
    funded_unit:   1,
    app_date:      "2025-07-01",
    app_volume:    485000,
    app_unit:      1,
  }, null, 2);

  const ariveNativePayload = JSON.stringify({
    event: "loan.funded",
    loan: {
      id:                 "ARIVE-LN-00012345",
      loanOfficerEmail:   "johndoe@hcmgloans.com",
      loanAmount:         485000,
      fundedDate:         "2025-07-15",
      applicationDate:    "2025-07-01",
    }
  }, null, 2);

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

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

      {/* Status banner */}
      <div style={{ background: "#f0fdf4", border:"1.5px solid #86efac", borderRadius:14, padding:"16px 20px", marginBottom:28, display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontSize:20 }}>✅</span>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#166534" }}>Webhook Endpoint Ready</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#166534" }}>Your SLICE webhook is live and waiting for ARIVE data.</p>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <code style={{ fontSize:11, background:"#dcfce7", padding:"4px 10px", borderRadius:6, color:"#166534", border:"1px solid #86efac", fontFamily:"monospace" }}>
            POST {WEBHOOK_URL}
          </code>
          <CopyButton text={WEBHOOK_URL} />
        </div>
      </div>

      {/* Option A: Zapier (recommended) */}
      <div style={{ background:C.navy, borderRadius:16, padding:"16px 24px", marginBottom:12, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:20 }}>⚡</span>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#fff" }}>Two Ways to Connect</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"rgba(255,255,255,0.6)" }}>Option A: Zapier (no-code, easiest) · Option B: ARIVE native webhook (direct)</p>
        </div>
      </div>

      {/* OPTION A: ZAPIER */}
      <div style={{ background:C.white, border:`2px solid ${C.orange}`, borderRadius:20, padding:"22px 28px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <span style={{ fontSize:18 }}>⚡</span>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>Option A — Zapier (Recommended)</p>
          <span style={{ background:"#fef9c3", color:"#854d0e", fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:99 }}>EASIEST</span>
        </div>

        <Step num={1} title="Create a Zapier account (free tier works)">
          <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.8 }}>
            Go to <strong style={{ color:C.ink }}>zapier.com</strong> and sign up for free. The free plan allows the zaps you need.
          </p>
        </Step>

        <Step num={2} title="Create a new Zap — trigger: ARIVE">
          <p style={{ margin:"0 0 12px", fontSize:13, color:C.muted, lineHeight:1.8 }}>In Zapier, click <strong style={{ color:C.ink }}>+ Create → Zap</strong>. Set the trigger:</p>
          <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}` }}>
            <tbody>
              <FieldRow field="App" value="ARIVE" note="Search for ARIVE in the app list" />
              <FieldRow field="Trigger Event" value="Loan Funded" note="Fires when a loan reaches Funded status" />
              <FieldRow field="Account" value="Your ARIVE account" note="Connect your HCMG ARIVE account" />
            </tbody>
          </table>
          <p style={{ margin:"12px 0 0", fontSize:12, color:C.muted }}>
            💡 Also create a second Zap with trigger <strong>Application Submitted</strong> to track pipeline data.
          </p>
        </Step>

        <Step num={3} title="Set the action — Webhooks by Zapier (POST)">
          <p style={{ margin:"0 0 12px", fontSize:13, color:C.muted, lineHeight:1.8 }}>Set the action app to <strong style={{ color:C.ink }}>Webhooks by Zapier</strong>:</p>
          <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}` }}>
            <tbody>
              <FieldRow field="Action Event"   value="POST" />
              <FieldRow field="URL"            value={WEBHOOK_URL} note="← Your SLICE webhook endpoint" />
              <FieldRow field="Payload Type"   value="json" />
              <FieldRow field="Header Name"    value="x-zapier-secret" note="Add a custom header" />
              <FieldRow field="Header Value"   value="(set ZAPIER_WEBHOOK_SECRET in Vercel)" note="Any secret string you choose" />
            </tbody>
          </table>
        </Step>

        <Step num={4} title="Map ARIVE fields to the payload">
          <p style={{ margin:"0 0 12px", fontSize:13, color:C.muted }}>In the Zapier action body, map these fields from the ARIVE trigger data:</p>
          <CodeBlock label="Expected JSON payload" code={zapierPayloadExample} />
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { field: "lo_email",      from: "ARIVE: Loan Officer Email",   required: true },
              { field: "lo_nmls",       from: "ARIVE: Loan Officer NMLS",    required: false },
              { field: "loan_id",       from: "ARIVE: Loan ID",              required: true },
              { field: "funded_date",   from: "ARIVE: Funded Date",          required: false },
              { field: "funded_volume", from: "ARIVE: Loan Amount",          required: false },
              { field: "funded_unit",   from: "Hard-code: 1",                required: false },
              { field: "app_date",      from: "ARIVE: Application Date",     required: false },
              { field: "app_volume",    from: "ARIVE: Loan Amount",          required: false },
              { field: "app_unit",      from: "Hard-code: 1",                required: false },
            ].map(f => (
              <div key={f.field} style={{ background:C.sand, borderRadius:8, padding:"10px 14px", border:`1px solid ${C.line}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <code style={{ fontSize:11, color:C.navy, fontWeight:700 }}>{f.field}</code>
                  {f.required && <span style={{ fontSize:9, background:"#fee2e2", color:"#991b1b", padding:"1px 5px", borderRadius:3, fontWeight:800 }}>required</span>}
                </div>
                <p style={{ margin:0, fontSize:11, color:C.muted }}>← {f.from}</p>
              </div>
            ))}
          </div>
        </Step>

        <Step num={5} title="Test and turn on the Zap">
          <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.8 }}>
            Use Zapier's built-in test to fire a sample payload. You should see <strong style={{ color:C.green }}>status: "created"</strong> in the response.
            Once confirmed, turn the Zap ON. Every funded loan in ARIVE will now automatically update SLICE.
          </p>
        </Step>
      </div>

      {/* OPTION B: Native webhook */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"22px 28px", marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
          <span style={{ fontSize:18 }}>🔌</span>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>Option B — ARIVE Native Webhook</p>
          <span style={{ background:C.sand, color:C.muted, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:99 }}>DIRECT</span>
        </div>
        <p style={{ margin:"0 0 16px", fontSize:13, color:C.muted, lineHeight:1.8 }}>
          If ARIVE supports outbound webhooks directly (check ARIVE Settings → Integrations → Webhooks),
          you can skip Zapier entirely. Use this endpoint and format:
        </p>
        <table style={{ width:"100%", borderCollapse:"collapse", borderRadius:10, overflow:"hidden", border:`1px solid ${C.line}`, marginBottom:16 }}>
          <tbody>
            <FieldRow field="Endpoint URL"  value={`${SITE}/api/goal-engine/arive-webhook`} />
            <FieldRow field="Secret Header" value="x-arive-secret" note="Set value in Vercel as ARIVE_WEBHOOK_SECRET" />
            <FieldRow field="Events"        value="loan.funded, loan.application_submitted" />
          </tbody>
        </table>
        <CodeBlock label="Expected ARIVE native payload" code={ariveNativePayload} />
      </div>

      {/* Live Webhook Tester */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"28px 32px", marginBottom:28, boxShadow:"0 1px 6px rgba(15,23,42,0.05)" }}>
        <h2 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:C.ink }}>🧪 Live Webhook Tester</h2>
        <p style={{ margin:"0 0 20px", fontSize:13, color:C.muted }}>Fire a test production record right now to verify your setup.</p>

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
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Funded Volume</label>
            <input
              type="number" value={testVolume} onChange={e => setTestVolume(e.target.value)}
              placeholder="485000"
              style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
            />
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.ink, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Webhook Secret (optional)</label>
          <input
            type="text" value={testSecret} onChange={e => setTestSecret(e.target.value)}
            placeholder="Leave blank if ZAPIER_WEBHOOK_SECRET not set yet"
            style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${C.line}`, fontSize:13, color:C.ink, outline:"none", fontFamily:"inherit", boxSizing:"border-box" as const }}
          />
        </div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <button
            onClick={runWebhookTest}
            disabled={!testEmail || testing}
            style={{
              padding:"12px 24px", borderRadius:12, border:"none",
              background: !testEmail ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
              color: !testEmail ? C.muted : "#fff",
              fontSize:13, fontWeight:800, cursor: testEmail ? "pointer" : "not-allowed",
            }}
          >
            {testing ? "Sending..." : "⚡ Test Zapier Webhook"}
          </button>
          <button
            onClick={testNativeArive}
            disabled={!testEmail || sendingNative}
            style={{
              padding:"12px 24px", borderRadius:12,
              border:`1.5px solid ${C.line}`,
              background: C.white,
              color: !testEmail ? C.muted : C.ink,
              fontSize:13, fontWeight:800, cursor: testEmail ? "pointer" : "not-allowed",
            }}
          >
            {sendingNative ? "Sending..." : "🔌 Test Native Webhook"}
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop:16, background: testResult.ok ? C.greenBg : C.redBg, border:`1px solid ${testResult.ok ? "#86efac" : "#fca5a5"}`, borderRadius:10, padding:"14px 18px" }}>
            <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color: testResult.ok ? C.green : C.red }}>
              {testResult.ok ? "✅ Zapier webhook test passed!" : "❌ Zapier webhook test failed"}
            </p>
            <pre style={{ margin:0, fontSize:11, color: testResult.ok ? "#166534" : "#991b1b", fontFamily:"monospace", overflowX:"auto" }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}

        {nativeResult && (
          <div style={{ marginTop:12, background: nativeResult.ok ? C.greenBg : C.redBg, border:`1px solid ${nativeResult.ok ? "#86efac" : "#fca5a5"}`, borderRadius:10, padding:"14px 18px" }}>
            <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:800, color: nativeResult.ok ? C.green : C.red }}>
              {nativeResult.ok ? "✅ Native webhook test passed!" : "❌ Native webhook test failed"}
            </p>
            <pre style={{ margin:0, fontSize:11, color: nativeResult.ok ? "#166534" : "#991b1b", fontFamily:"monospace", overflowX:"auto" }}>
              {JSON.stringify(nativeResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* LO Email Mapping */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"24px 28px", marginBottom:28 }}>
        <h2 style={{ margin:"0 0 8px", fontSize:15, fontWeight:800, color:C.ink }}>🔑 How SLICE Matches ARIVE Loans to Loan Officers</h2>
        <p style={{ margin:"0 0 16px", fontSize:13, color:C.muted, lineHeight:1.8 }}>
          SLICE matches incoming webhook data to a Supabase profile using:
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { priority: "1st", label: "NMLS match", desc: "lo_nmls in webhook → profiles.nmls column", icon:"🏆" },
            { priority: "2nd", label: "Email match", desc: "lo_email in webhook → profiles.email column", icon:"📧" },
          ].map(r => (
            <div key={r.priority} style={{ display:"flex", alignItems:"center", gap:14, background:C.sand, borderRadius:10, padding:"12px 16px", border:`1px solid ${C.line}` }}>
              <span style={{ fontSize:20 }}>{r.icon}</span>
              <div>
                <span style={{ fontSize:10, fontWeight:800, color:C.orange, textTransform:"uppercase", letterSpacing:"0.1em" }}>{r.priority} priority — </span>
                <strong style={{ fontSize:13, color:C.ink }}>{r.label}</strong>
                <p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14, background:"#fffbeb", border:"1px solid #fed7aa", borderRadius:10, padding:"12px 16px" }}>
          <p style={{ margin:0, fontSize:12, color:"#92400e", lineHeight:1.8 }}>
            <strong>⚠️ Important:</strong> Make sure each LO&apos;s Supabase profile email matches their ARIVE account email exactly.
            You can set this in <Link href="/goal-engine/admin" style={{ color:C.orange, fontWeight:700 }}>Admin → Manage Profiles</Link>.
          </p>
        </div>
      </div>

      {/* Env var checklist */}
      <div style={{ background:C.navy, borderRadius:20, padding:"24px 28px" }}>
        <h2 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800, color:"#fff" }}>🔐 Required Vercel Environment Variables</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { key: "ZAPIER_WEBHOOK_SECRET",  desc: "Any secret string (e.g. hcmg-arive-2025). Set same value in Zapier header." },
            { key: "ARIVE_WEBHOOK_SECRET",   desc: "If using native ARIVE webhooks. Set same value in ARIVE webhook config." },
            { key: "GOAL_ENGINE_TEST_MODE",  desc: "Set to false when ready for live emails." },
            { key: "GOAL_ENGINE_TEST_EMAIL", desc: "darius@hcmgloans.com — receives all test emails." },
            { key: "CRON_SECRET",            desc: "hcmg-cron-2025 — secures the weekly email cron job." },
          ].map(v => (
            <div key={v.key} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:14 }}>
              <code style={{ fontSize:12, color:"#f97316", fontFamily:"monospace", fontWeight:700, flexShrink:0 }}>{v.key}</code>
              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ margin:"16px 0 0", fontSize:12, color:"rgba(255,255,255,0.4)" }}>
          Vercel Dashboard → hcmg-web → Settings → Environment Variables → Add each key above
        </p>
      </div>

    </div>
  );
}
