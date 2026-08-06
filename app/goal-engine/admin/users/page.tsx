"use client";

/**
 * /goal-engine/admin/users
 * Shows all HCMG team members from profiles table.
 * "Sync" button ensures every profile has a Supabase auth login.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

type ProfileRow = {
  id: string; email: string; full_name: string;
  role: "admin" | "loan_officer"; nmls: string | null; avatar_url: string | null;
};

type SyncResult = {
  email: string; name: string; role: string;
  action: "exists" | "invited" | "skipped"; error?: string;
};

type SyncResponse = {
  success: boolean; message: string; total: number;
  sendInvites: boolean; results: SyncResult[];
};

export default function UsersPage() {
  const [profiles,    setProfiles]    = useState<ProfileRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [sendInvites, setSendInvites] = useState(true);
  const [result,      setResult]      = useState<SyncResponse | null>(null);
  const [error,       setError]       = useState("");

  // Load current profiles
  useEffect(() => {
    fetch("/api/goal-engine/profiles-list")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setProfiles(d.profiles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const admins = profiles.filter(p => p.role === "admin");
  const los    = profiles.filter(p => p.role === "loan_officer");

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Back to Admin</Link>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
            👥
          </div>
          <div>
            <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:C.orange }}>Administration</p>
            <h1 style={{ margin:"4px 0 0", fontSize:26, fontWeight:900, color:C.ink }}>Team Members</h1>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.muted }}>
              {loading ? "Loading…" : `${profiles.length} members · ${admins.length} admin · ${los.length} loan officers`}
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background:C.navy, borderRadius:16, padding:"18px 24px", marginBottom:24 }}>
        <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:800, color:"#fff" }}>⚡ How Logins Work</p>
        <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.8 }}>
          Every person in this list already has a profile. The <strong style={{ color:"#fff" }}>Sync Logins</strong> button
          checks whether each profile has an active Supabase auth account. Anyone missing one will receive
          an <strong style={{ color:C.orange }}>invite email</strong> to set their SLICE password.
          Safe to run any time — fully idempotent.
        </p>
      </div>

      {/* Team table */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>HCMG Team</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>All active team members with SLICE access</p>
          </div>
        </div>
        {loading ? (
          <p style={{ padding:"40px 24px", textAlign:"center", color:C.muted, fontSize:14 }}>Loading team members…</p>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.sand }}>
                {["Name", "Email", "SLICE Role", "NMLS"].map(h => (
                  <th key={h} style={{ padding:"10px 18px", fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} style={{ borderBottom:`1px solid ${C.line}` }}>
                  <td style={{ padding:"12px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      ) : (
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>
                          {p.full_name.split(" ").map(n => n[0]).slice(0,2).join("")}
                        </div>
                      )}
                      <span style={{ fontSize:13, fontWeight:800, color:C.ink }}>{p.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px 18px", fontSize:13, color:C.muted }}>{p.email}</td>
                  <td style={{ padding:"12px 18px" }}>
                    <span style={{
                      padding:"2px 10px", borderRadius:99, fontSize:10, fontWeight:800,
                      background: p.role === "admin" ? "#eff6ff" : "#f0fdf4",
                      color:      p.role === "admin" ? "#1e40af" : "#166534",
                    }}>
                      {p.role === "admin" ? "Admin" : "Loan Officer"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 18px", fontSize:12, color:C.muted, fontFamily:"monospace" }}>
                    {p.nmls || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sync Controls */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"24px 28px", marginBottom:24 }}>
        <h2 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800, color:C.ink }}>🔄 Sync Logins</h2>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:"14px 18px", borderRadius:12, background:C.sand, border:`1px solid ${C.line}` }}>
          <input
            type="checkbox" id="send-invites"
            checked={sendInvites}
            onChange={e => setSendInvites(e.target.checked)}
            style={{ width:16, height:16, cursor:"pointer", accentColor:C.orange }}
          />
          <label htmlFor="send-invites" style={{ cursor:"pointer", fontSize:13, color:C.ink, lineHeight:1.5 }}>
            <strong>Send invite emails to new users</strong>
            <span style={{ display:"block", fontSize:12, color:C.muted }}>
              Anyone without a login gets an email to set their SLICE password.
            </span>
          </label>
        </div>

        <button onClick={runSync} disabled={syncing} style={{
          padding:"12px 28px", borderRadius:12, border:"none",
          background: syncing ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
          color: syncing ? C.muted : "#fff",
          fontSize:14, fontWeight:800, cursor: syncing ? "not-allowed" : "pointer",
          fontFamily:"inherit",
        }}>
          {syncing ? "Syncing…" : "🔄 Sync HCMG Team Logins"}
        </button>

        {error && (
          <div style={{ marginTop:16, padding:"14px 18px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", fontSize:13, color:"#991b1b" }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden" }}>
          <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.line}`, background:"#f0fdf4", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:20 }}>✅</span>
            <div>
              <p style={{ margin:0, fontSize:14, fontWeight:800, color:"#166534" }}>Sync Complete</p>
              <p style={{ margin:"2px 0 0", fontSize:12, color:"#166534" }}>{result.message}</p>
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:C.sand }}>
                {["Name","Email","Role","Status"].map(h => (
                  <th key={h} style={{ padding:"10px 18px", fontSize:9, fontWeight:800, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.results.map((r, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.line}` }}>
                  <td style={{ padding:"10px 18px", fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</td>
                  <td style={{ padding:"10px 18px", fontSize:12, color:C.muted }}>{r.email}</td>
                  <td style={{ padding:"10px 18px" }}>
                    <span style={{
                      padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800,
                      background: r.role === "admin" ? "#eff6ff" : "#f0fdf4",
                      color:      r.role === "admin" ? "#1e40af" : "#166534",
                    }}>{r.role === "admin" ? "Admin" : "Loan Officer"}</span>
                  </td>
                  <td style={{ padding:"10px 18px" }}>
                    <span style={{
                      padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800,
                      background: r.action === "invited" ? "#dcfce7" : r.action === "exists" ? "#f1f5f9" : "#fee2e2",
                      color:      r.action === "invited" ? "#166534" : r.action === "exists" ? C.muted : "#991b1b",
                    }}>
                      {r.action === "invited" ? "✓ Invite sent" : r.action === "exists" ? "Already set up" : `⚠ ${r.error ?? "Skipped"}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
