"use client";

/**
 * /goal-engine/admin/users
 * Sync HCMG team members into SLICE.
 * Shows all HCMG team members, their SLICE role, and sync status.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

type SyncResult = {
  email: string;
  name: string;
  role: "admin" | "loan_officer";
  action: "created" | "updated" | "skipped";
  error?: string;
};

type SyncResponse = {
  success: boolean;
  message: string;
  sendInvites: boolean;
  results: SyncResult[];
};

const ROLE_LABELS: Record<string, string> = {
  admin:        "Admin",
  loan_officer: "Loan Officer",
};

const WIRE_ROLES: Record<string, string> = {
  clo:             "Chief Lending Officer",
  ceo:             "CEO",
  president:       "President",
  lo:              "Loan Officer",
  loan_officer:    "Loan Officer",
  ops:             "Operations",
  recruiter:       "Recruiter",
  branch_manager:  "Branch Manager",
  vp:              "VP",
  processor:       "Processor",
};

const HCMG_USERS = [
  { name: "Darius James",      email: "darius@hcmgloans.com",   role: "admin",        wireRole: "clo",       nmls: "1097168" },
  { name: "Lamont Harris",     email: "lamont@hcmgloans.com",   role: "admin",        wireRole: "ceo",       nmls: "491049"  },
  { name: "Ranada Harris",     email: "ranada@hcmgloans.com",   role: "loan_officer", wireRole: "ops",       nmls: null      },
  { name: "Juan Garcia",       email: "johnny@hcmgloans.com",   role: "loan_officer", wireRole: "recruiter", nmls: null      },
  { name: "Astrine Covington", email: "astrine@hcmgloans.com",  role: "loan_officer", wireRole: "president", nmls: null      },
];

export default function UsersPage() {
  const [syncing,     setSyncing]     = useState(false);
  const [sendInvites, setSendInvites] = useState(true);
  const [result,      setResult]      = useState<SyncResponse | null>(null);
  const [error,       setError]       = useState("");

  async function runSync() {
    setSyncing(true); setError(""); setResult(null);
    try {
      const res  = await fetch("/api/goal-engine/sync-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendInvites }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error ?? "Sync failed");
    } catch (e) { setError(String(e)); }
    setSyncing(false);
  }

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Back to Admin</Link>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            👥
          </div>
          <div>
            <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Administration</p>
            <h1 style={{ margin:"4px 0 0", fontSize:26, fontWeight:900, color:C.ink }}>User Management</h1>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.muted }}>Sync HCMG team members into SLICE.</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:C.navy, borderRadius:16, padding:"20px 24px", marginBottom:24 }}>
        <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:800, color:"#fff" }}>⚡ How User Sync Works</p>
        <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.8 }}>
          Clicking <strong style={{ color:"#fff" }}>Sync Users</strong> reads every active HCMG user from the platform database
          and creates a SLICE account for each one. New users receive a <strong style={{ color:"#F37021" }}>password reset email</strong> so
          they can set their own SLICE password. Existing users are updated. Safe to run any time — fully idempotent.
        </p>
        <div style={{ display:"flex", gap:12, marginTop:16, flexWrap:"wrap" }}>
          {[
            { label:"Source",   value:"HCMG Team Portal — User & Membership tables" },
            { label:"Tenant",   value:"Harris Capital Mortgage Group" },
            { label:"Invites",  value:"Sent via Supabase → user@hcmgloans.com" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 14px" }}>
              <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{s.label}: </span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current HCMG User List */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.line}` }}>
          <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>HCMG Team ({HCMG_USERS.length} members)</p>
          <p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>Users who will be synced into SLICE</p>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.sand }}>
              {["Name", "Email", "Platform Role", "SLICE Role", "NMLS"].map(h => (
                <th key={h} style={{ padding:"10px 18px", fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HCMG_USERS.map(user => (
              <tr key={user.email} style={{ borderBottom:`1px solid ${C.line}` }}>
                <td style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>
                      {user.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                    <span style={{ fontSize:13, fontWeight:800, color:C.ink }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding:"14px 18px", fontSize:13, color:C.muted }}>{user.email}</td>
                <td style={{ padding:"14px 18px" }}>
                  <code style={{ fontSize:11, background:C.sand, padding:"2px 8px", borderRadius:4, color:C.ink, border:`1px solid ${C.line}` }}>
                    {WIRE_ROLES[user.wireRole] ?? user.wireRole}
                  </code>
                </td>
                <td style={{ padding:"14px 18px" }}>
                  <span style={{
                    padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:800,
                    background: user.role === "admin" ? "#eff6ff" : "#f0fdf4",
                    color:      user.role === "admin" ? "#1e40af" : "#166534",
                  }}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td style={{ padding:"14px 18px", fontSize:12, color:C.muted, fontFamily:"monospace" }}>
                  {user.nmls ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sync Controls */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"24px 28px", marginBottom:24 }}>
        <h2 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800, color:C.ink }}>🔄 Sync Users Now</h2>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:"14px 18px", borderRadius:12, background:C.sand, border:`1px solid ${C.line}` }}>
          <input
            type="checkbox"
            id="send-invites"
            checked={sendInvites}
            onChange={e => setSendInvites(e.target.checked)}
            style={{ width:16, height:16, cursor:"pointer", accentColor:C.orange }}
          />
          <label htmlFor="send-invites" style={{ cursor:"pointer", fontSize:13, color:C.ink, lineHeight:1.5 }}>
            <strong>Send password-reset invite emails</strong>
            <span style={{ display:"block", fontSize:12, color:C.muted }}>
              New users receive an email to set their SLICE password. Uncheck if you want to sync silently first.
            </span>
          </label>
        </div>

        <button
          onClick={runSync}
          disabled={syncing}
          style={{
            padding:"12px 28px", borderRadius:12, border:"none",
            background: syncing ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
            color: syncing ? C.muted : "#fff",
            fontSize:14, fontWeight:800, cursor: syncing ? "not-allowed" : "pointer",
            fontFamily:"inherit",
          }}
        >
          {syncing ? "Syncing…" : "🔄 Sync HCMG Team Members"}
        </button>

        {error && (
          <div style={{ marginTop:16, padding:"14px 18px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", fontSize:13, color:"#991b1b" }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Sync Results */}
      {result && (
        <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden" }}>
          <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.line}`, background:"#f0fdf4", display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:20 }}>✅</span>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:800, color:"#166534" }}>Sync Complete</p>
              <p style={{ margin:"2px 0 0", fontSize:12, color:"#166534" }}>{result.message}</p>
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.sand }}>
                {["Name", "Email", "Role", "Action", "Notes"].map(h => (
                  <th key={h} style={{ padding:"10px 18px", fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.results.map((r, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.line}` }}>
                  <td style={{ padding:"12px 18px", fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</td>
                  <td style={{ padding:"12px 18px", fontSize:12, color:C.muted }}>{r.email}</td>
                  <td style={{ padding:"12px 18px" }}>
                    <span style={{
                      padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800,
                      background: r.role === "admin" ? "#eff6ff" : "#f0fdf4",
                      color:      r.role === "admin" ? "#1e40af" : "#166534",
                    }}>
                      {ROLE_LABELS[r.role]}
                    </span>
                  </td>
                  <td style={{ padding:"12px 18px" }}>
                    <span style={{
                      padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800,
                      background: r.action === "created" ? "#dcfce7" : r.action === "updated" ? "#eff6ff" : "#fee2e2",
                      color:      r.action === "created" ? "#166534" : r.action === "updated" ? "#1e40af" : "#991b1b",
                    }}>
                      {r.action === "created" ? "✓ Created" : r.action === "updated" ? "↑ Updated" : "⚠ Skipped"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 18px", fontSize:11, color: r.error ? "#991b1b" : C.muted }}>
                    {r.error
                      ? `Error: ${r.error}`
                      : r.action === "created" && result.sendInvites
                      ? "Invite email sent"
                      : r.action === "updated"
                      ? "Profile updated"
                      : "—"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:"16px 24px", background:C.sand, borderTop:`1px solid ${C.line}` }}>
            <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.8 }}>
              <strong style={{ color:C.ink }}>Next step:</strong> Each new user will receive an email to set their SLICE password.
              They can then sign in at <code style={{ background:C.white, padding:"1px 6px", borderRadius:4, border:`1px solid ${C.line}` }}>/goal-engine-login</code> with their HCMG email.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
