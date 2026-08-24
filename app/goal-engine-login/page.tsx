"use client";

import { useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function GoalEngineLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

type Step = "password" | "mfa-enroll" | "mfa-verify";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/goal-engine/dashboard";

  const [step, setStep]         = useState<Step>("password");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [code,     setCode]     = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const factorIdRef    = useRef<string>("");
  const challengeIdRef = useRef<string>("");
  const qrCodeRef      = useRef<string>("");
  const secretRef      = useRef<string>("");

  // ── Step 1: password ──────────────────────────────────────────────────────
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = createBrowserClient();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user) { setError("Sign in failed."); setLoading(false); return; }

      const { data: factors } = await sb.auth.mfa.listFactors();
      const totp = factors?.totp ?? [];

      if (totp.length > 0) {
        factorIdRef.current = totp[0].id;
        const { data: challengeData, error: challengeErr } = await sb.auth.mfa.challenge({ factorId: totp[0].id });
        if (challengeErr || !challengeData) { setError("MFA challenge failed. Please try again."); setLoading(false); return; }
        challengeIdRef.current = challengeData.id;
        setStep("mfa-verify");
      } else {
        const { data: enrollData, error: enrollErr } = await sb.auth.mfa.enroll({ factorType: "totp", issuer: "HCMG", friendlyName: "HCMG SLICE" });
        if (enrollErr || !enrollData) { setError("Could not start MFA setup. Please try again."); setLoading(false); return; }
        factorIdRef.current = enrollData.id;
        qrCodeRef.current   = enrollData.totp.qr_code;
        secretRef.current   = enrollData.totp.secret;
        setStep("mfa-enroll");
      }
    } catch { setError("Unexpected error."); }
    setLoading(false);
  }

  // ── Step 2a: verify after enrollment ─────────────────────────────────────
  async function handleEnrollVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = createBrowserClient();
      const { data: challengeData, error: challengeErr } = await sb.auth.mfa.challenge({ factorId: factorIdRef.current });
      if (challengeErr || !challengeData) { setError("Challenge failed. Please try again."); setLoading(false); return; }
      const { error: verifyErr } = await sb.auth.mfa.verify({
        factorId:    factorIdRef.current,
        challengeId: challengeData.id,
        code:        code.replace(/\s/g, ""),
      });
      if (verifyErr) { setError("Incorrect code. Check your authenticator app and try again."); setLoading(false); return; }
      window.location.href = next;
    } catch { setError("Unexpected error."); setLoading(false); }
  }

  // ── Step 2b: verify existing factor ──────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = createBrowserClient();
      const { error: verifyErr } = await sb.auth.mfa.verify({
        factorId:    factorIdRef.current,
        challengeId: challengeIdRef.current,
        code:        code.replace(/\s/g, ""),
      });
      if (verifyErr) { setError("Incorrect code. Check your authenticator app and try again."); setLoading(false); return; }
      window.location.href = next;
    } catch { setError("Unexpected error."); setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"14px 18px", borderRadius:14,
    border:"2px solid #E2E8F0", background:"#fff",
    fontSize:15, color:"#1A2B42", outline:"none",
    fontFamily:"inherit", boxSizing:"border-box",
  };
  const codeInputStyle: React.CSSProperties = {
    width:"100%", padding:"16px", borderRadius:12,
    border:"2px solid #E2E8F0", background:"#fff",
    fontSize:28, fontWeight:700, color:"#1A2B42",
    letterSpacing:".35em", textAlign:"center", outline:"none",
    fontFamily:"inherit",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width:"45%", minHeight:"100vh",
        background:"#ffffff",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"48px 52px",
        borderRight:"1px solid #E2E8F0",
      }} className="hidden lg:flex">
        <img src="/SLICE.png" alt="SLICE" style={{ width:"72%", maxWidth:380, height:"auto" }} />
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#64748B" }}>by</span>
          <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height:18, width:"auto" }} />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:"#F8FAFC", padding:"48px 32px",
      }}>
        {/* Mobile logo */}
        <div style={{ marginBottom:36, textAlign:"center" }} className="lg:hidden">
          <img src="/SLICE.png" alt="SLICE" style={{ height:80, width:"auto", margin:"0 auto 10px" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#F37021" }}>by</span>
            <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height:13, width:"auto" }} />
          </div>
        </div>

        <div style={{ width:"100%", maxWidth:420 }}>

          {/* ── STEP: password ── */}
          {step === "password" && (
            <>
              <h1 style={{ margin:"0 0 6px", fontSize:32, fontWeight:900, color:"#1A2B42" }}>Sign in</h1>
              <p style={{ margin:"0 0 36px", fontSize:14, color:"#64748B" }}>
                Use your HCMG credentials to access SLICE
              </p>
              <form onSubmit={handlePassword}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", marginBottom:8, fontSize:11, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:"#1A2B42" }}>
                    Email Address
                  </label>
                  <input
                    type="email" required autoComplete="email"
                    placeholder="you@hcmgloans.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#F37021"}
                    onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
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
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#F37021"}
                    onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
                {error && <ErrorBox message={error} />}
                <button type="submit" disabled={loading} style={btnStyle(loading)}>
                  {loading ? "Signing in…" : "Enter SLICE →"}
                </button>
              </form>
              <p style={{ marginTop:28, textAlign:"center", fontSize:12, color:"#94A3B8" }}>
                Need access?{" "}
                <a href="mailto:info@hcmgloans.com" style={{ color:"#F37021", fontWeight:700, textDecoration:"none" }}>
                  Contact support
                </a>
              </p>
            </>
          )}

          {/* ── STEP: mfa-enroll ── */}
          {step === "mfa-enroll" && (
            <>
              <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🔐</div>
                <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:"#1A2B42" }}>Set up two-factor auth</h1>
              </div>
              <p style={{ fontSize:13, color:"#64748B", marginBottom:24, lineHeight:1.6 }}>
                HCMG requires MFA on all accounts. Scan the QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>, then enter the 6-digit code below.
              </p>
              {qrCodeRef.current && (
                <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeRef.current} alt="MFA QR code" style={{ width:180, height:180, borderRadius:12, border:"2px solid #E2E8F0" }} />
                </div>
              )}
              <p style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginBottom:2 }}>Can't scan? Enter this key manually:</p>
              <div style={{ background:"#f1f5f9", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 14px", fontFamily:"'SFMono-Regular',Consolas,monospace", fontSize:13, color:"#1A2B42", letterSpacing:".08em", wordBreak:"break-all", textAlign:"center", marginTop:8 }}>
                {secretRef.current}
              </div>
              <form onSubmit={handleEnrollVerify} style={{ marginTop:24 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1A2B42", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>
                  6-digit code
                </label>
                <input
                  type="text" inputMode="numeric" autoComplete="one-time-code"
                  placeholder="000000" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  style={codeInputStyle}
                  onFocus={e => e.target.style.borderColor = "#F37021"}
                  onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                />
                {error && <ErrorBox message={error} style={{ marginTop:16 }} />}
                <button type="submit" disabled={loading || code.length < 6} style={{ ...btnStyle(loading || code.length < 6), marginTop:20 }}>
                  {loading ? "Verifying…" : "Confirm & sign in →"}
                </button>
              </form>
            </>
          )}

          {/* ── STEP: mfa-verify ── */}
          {step === "mfa-verify" && (
            <>
              <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🔐</div>
                <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:"#1A2B42" }}>Two-factor authentication</h1>
              </div>
              <p style={{ fontSize:13, color:"#64748B", marginBottom:32, lineHeight:1.6 }}>
                Open your authenticator app and enter the 6-digit code for <strong>HCMG SLICE</strong>.
              </p>
              <form onSubmit={handleVerify}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1A2B42", textTransform:"uppercase", letterSpacing:".1em", marginBottom:8 }}>
                  6-digit code
                </label>
                <input
                  type="text" inputMode="numeric" autoComplete="one-time-code"
                  placeholder="000000" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  style={codeInputStyle}
                  onFocus={e => e.target.style.borderColor = "#F37021"}
                  onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                />
                {error && <ErrorBox message={error} style={{ marginTop:16 }} />}
                <button type="submit" disabled={loading || code.length < 6} style={{ ...btnStyle(loading || code.length < 6), marginTop:20 }}>
                  {loading ? "Verifying…" : "Sign in →"}
                </button>
              </form>
              <p style={{ marginTop:16, fontSize:12, color:"#94A3B8", textAlign:"center" }}>
                Lost access to your authenticator?{" "}
                <a href="mailto:info@hcmgloans.com" style={{ color:"#F37021", fontWeight:700, textDecoration:"none" }}>Contact support</a>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    width:"100%", padding:"16px 24px", borderRadius:14,
    background: disabled ? "#CBD5E1" : "linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%)",
    color:"#fff", fontSize:16, fontWeight:800,
    border:"none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily:"inherit", letterSpacing:".02em",
    boxShadow: disabled ? "none" : "0 8px 24px rgba(243,112,33,0.35)",
    transition:"all .15s",
  };
}

function ErrorBox({ message, style }: { message: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      marginBottom:16, padding:"13px 18px", borderRadius:12,
      background:"#FFF5F5", border:"1.5px solid #FECACA",
      fontSize:13, color:"#DC2626", fontWeight:600,
      ...style,
    }}>
      {message}
    </div>
  );
}
