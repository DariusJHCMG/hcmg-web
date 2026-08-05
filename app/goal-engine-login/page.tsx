"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function GoalEngineLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/goal-engine/dashboard";
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = createBrowserClient();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user) { setError("Sign in failed."); setLoading(false); return; }
      window.location.href = next;
    } catch { setError("Unexpected error."); setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width:"45%", minHeight:"100vh",
        background:"#142850",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"48px 52px",
      }} className="hidden lg:flex">
        <div>
          <img src="/SLICE.png" alt="SLICE by HCMG" style={{ height:52, width:"auto" }} />
        </div>
        <div>
          <h2 style={{ margin:"0 0 16px", fontSize:44, fontWeight:900, color:"#fff", lineHeight:1.1 }}>
            Own your number.<br />
            <span style={{ color:"#F37021" }}>Track every dollar.</span>
          </h2>
          <p style={{ margin:0, fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.8, maxWidth:380 }}>
            The HCMG monthly production operating system. Commit, compete, and get recognized.
          </p>
        </div>
        <div>
          {[
            { icon:"🥧", text:"Monthly commitment tracking" },
            { icon:"📊", text:"Real-time leaderboard" },
            { icon:"🏆", text:"Automated awards & recognition" },
            { icon:"📧", text:"Weekly progress emails from Darius" },
          ].map(f => (
            <div key={f.text} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <div style={{
                width:36, height:36, borderRadius:10, flexShrink:0,
                background:"rgba(243,112,33,0.18)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
              }}>{f.icon}</div>
              <span style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.65)" }}>{f.text}</span>
            </div>
          ))}
          <p style={{ marginTop:32, fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:".05em" }}>
            Harris Capital Mortgage Group, LLC · NMLS# 1918223
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:"#F8FAFC", padding:"48px 32px",
      }}>
        {/* Mobile logo */}
        <div style={{ marginBottom:32, textAlign:"center" }} className="lg:hidden">
          <img src="/SLICE.png" alt="SLICE by HCMG" style={{ height:48, width:"auto", margin:"0 auto" }} />
        </div>

        <div style={{ width:"100%", maxWidth:420 }}>
          <h1 style={{ margin:"0 0 6px", fontSize:32, fontWeight:900, color:"#1A2B42" }}>Sign in</h1>
          <p style={{ margin:"0 0 36px", fontSize:14, color:"#64748B" }}>
            Use your HCMG credentials to access SLICE
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", marginBottom:8, fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#1A2B42" }}>
                Email Address
              </label>
              <input
                type="email" required autoComplete="email"
                placeholder="you@hcmgloans.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{
                  width:"100%", padding:"14px 18px", borderRadius:14,
                  border:"2px solid #E2E8F0", background:"#fff",
                  fontSize:15, color:"#1A2B42", outline:"none",
                  fontFamily:"inherit", boxSizing:"border-box" as const,
                  transition:"border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "#F37021"}
                onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#1A2B42" }}>
                  Password
                </label>
                <a href="/reset-password" style={{ fontSize:12, color:"#F37021", fontWeight:700, textDecoration:"none" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password" required autoComplete="current-password"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{
                  width:"100%", padding:"14px 18px", borderRadius:14,
                  border:"2px solid #E2E8F0", background:"#fff",
                  fontSize:15, color:"#1A2B42", outline:"none",
                  fontFamily:"inherit", boxSizing:"border-box" as const,
                }}
                onFocus={e => e.target.style.borderColor = "#F37021"}
                onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>

            {error && (
              <div style={{
                marginBottom:20, padding:"13px 18px", borderRadius:12,
                background:"#FFF5F5", border:"1.5px solid #FECACA",
                fontSize:13, color:"#DC2626", fontWeight:600,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"16px 24px", borderRadius:14,
              background: loading ? "#CBD5E1" : "linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%)",
              color:"#fff", fontSize:16, fontWeight:800,
              border:"none", cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"inherit", letterSpacing:".02em",
              boxShadow: loading ? "none" : "0 8px 24px rgba(243,112,33,0.35)",
              transition:"all .15s",
            }}>
              {loading ? "Signing in…" : "Enter SLICE →"}
            </button>
          </form>

          <p style={{ marginTop:28, textAlign:"center", fontSize:12, color:"#94A3B8" }}>
            Need access?{" "}
            <a href="mailto:info@hcmgloans.com" style={{ color:"#F37021", fontWeight:700, textDecoration:"none" }}>
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
