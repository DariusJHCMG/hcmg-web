"use client";

import { useState, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

type Step = "password" | "mfa-enroll" | "mfa-verify";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const [step, setStep]         = useState<Step>("password");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Stored between steps
  const factorIdRef    = useRef<string>("");
  const challengeIdRef = useRef<string>("");
  const qrCodeRef      = useRef<string>("");
  const secretRef      = useRef<string>("");

  // ── Step 1: password ────────────────────────────────────────────────────────
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user) { setError("Sign in failed. Please try again."); setLoading(false); return; }

      // Check for existing TOTP factors
      const { data: factors } = await sb.auth.mfa.listFactors();
      const totp = factors?.totp ?? [];

      if (totp.length > 0) {
        // Factor already enrolled — go straight to verify
        factorIdRef.current = totp[0].id;
        const { data: challengeData, error: challengeErr } = await sb.auth.mfa.challenge({ factorId: totp[0].id });
        if (challengeErr || !challengeData) { setError("MFA challenge failed. Please try again."); setLoading(false); return; }
        challengeIdRef.current = challengeData.id;
        setStep("mfa-verify");
      } else {
        // No factor — force enrollment
        const { data: enrollData, error: enrollErr } = await sb.auth.mfa.enroll({ factorType: "totp", issuer: "HCMG", friendlyName: "HCMG Portal" });
        if (enrollErr || !enrollData) { setError("Could not start MFA setup. Please try again."); setLoading(false); return; }
        factorIdRef.current = enrollData.id;
        qrCodeRef.current   = enrollData.totp.qr_code;
        secretRef.current   = enrollData.totp.secret;
        setStep("mfa-enroll");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    }
    setLoading(false);
  }

  // ── Step 2a: verify after enrollment ───────────────────────────────────────
  async function handleEnrollVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sb = createBrowserClient();
      // Challenge then verify to confirm enrollment
      const { data: challengeData, error: challengeErr } = await sb.auth.mfa.challenge({ factorId: factorIdRef.current });
      if (challengeErr || !challengeData) { setError("Challenge failed. Please try again."); setLoading(false); return; }
      const { error: verifyErr } = await sb.auth.mfa.verify({
        factorId:    factorIdRef.current,
        challengeId: challengeData.id,
        code:        code.replace(/\s/g, ""),
      });
      if (verifyErr) { setError("Incorrect code. Check your authenticator app and try again."); setLoading(false); return; }
      await redirect(sb);
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  }

  // ── Step 2b: verify existing factor ────────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const { error: verifyErr } = await sb.auth.mfa.verify({
        factorId:    factorIdRef.current,
        challengeId: challengeIdRef.current,
        code:        code.replace(/\s/g, ""),
      });
      if (verifyErr) { setError("Incorrect code. Check your authenticator app and try again."); setLoading(false); return; }
      await redirect(sb);
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  }

  async function redirect(sb: ReturnType<typeof createBrowserClient>) {
    const meRes = await fetch("/api/auth/me");
    const me = meRes.ok ? await meRes.json() : {};
    const dest = next || (me.role === "loan_officer" ? "/portal" : "/admin");
    window.location.href = dest;
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{margin:0;padding:0;background:#f7f8fa}
        .login-wrap{
          display:flex;min-height:100vh;
          font-family:'Montserrat',system-ui,sans-serif;
          background:#f7f8fa;
        }
        .login-left{
          width:50%;min-height:100vh;
          background:linear-gradient(145deg,#142850 0%,#1a3260 100%);
          display:flex;flex-direction:column;justify-content:space-between;
          padding:48px;
        }
        .login-right{
          width:50%;min-height:100vh;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:56px 40px;background:#f7f8fa;
        }
        @media(max-width:860px){
          .login-left{display:none}
          .login-right{width:100%}
        }
        .login-input{
          width:100%;padding:12px 16px;border-radius:12px;
          border:1.5px solid #E2E8F0;background:#fff;
          font-size:14px;color:#1A2B42;outline:none;
          font-family:inherit;transition:border-color .15s,box-shadow .15s;
        }
        .login-input:focus{
          border-color:#F37021;
          box-shadow:0 0 0 3px rgba(243,112,33,.12);
        }
        .login-btn{
          width:100%;padding:15px 24px;border-radius:14px;
          background:linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%);
          color:#fff;font-size:15px;font-weight:700;border:none;
          cursor:pointer;font-family:inherit;letter-spacing:.02em;
          transition:opacity .15s;
        }
        .login-btn:disabled{background:#CBD5E1;cursor:not-allowed;opacity:.75}
        .login-btn:hover:not(:disabled){opacity:.92}
        .mfa-code-input{
          width:100%;padding:16px;border-radius:12px;
          border:1.5px solid #E2E8F0;background:#fff;
          font-size:28px;font-weight:700;color:#1A2B42;
          letter-spacing:.35em;text-align:center;outline:none;
          font-family:'Montserrat',system-ui,sans-serif;
          transition:border-color .15s,box-shadow .15s;
        }
        .mfa-code-input:focus{
          border-color:#F37021;
          box-shadow:0 0 0 3px rgba(243,112,33,.12);
        }
        .secret-box{
          background:#f1f5f9;border:1px solid #E2E8F0;border-radius:10px;
          padding:10px 14px;font-family:'SFMono-Regular',Consolas,monospace;
          font-size:13px;color:#1A2B42;letter-spacing:.08em;
          word-break:break-all;text-align:center;margin-top:8px;
        }
      `}</style>

      <div className="login-wrap">
        {/* ── Left branding panel ── */}
        <div className="login-left">
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:44,height:44,borderRadius:12,flexShrink:0,
                background:"linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"-1px",
              }}>H</div>
              <span style={{ fontSize:22,fontWeight:800,color:"#fff",letterSpacing:".02em" }}>HCMG</span>
            </div>
            <p style={{ marginTop:6,fontSize:10,color:"#F37021",fontWeight:700,letterSpacing:".2em",textTransform:"uppercase" }}>
              Harris Capital Mortgage Group
            </p>
          </div>

          <div>
            <h2 style={{ fontSize:40,fontWeight:800,color:"#fff",lineHeight:1.15,marginBottom:18 }}>
              Your leads.<br/>Your pipeline.<br/>
              <span style={{ background:"linear-gradient(135deg,#FF9847,#F37021)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
                All in one place.
              </span>
            </h2>
            <p style={{ fontSize:14,color:"rgba(255,255,255,.55)",lineHeight:1.75,maxWidth:380 }}>
              Access your personal lead dashboard, funnel links, and team tools — built for HCMG loan officers and leadership.
            </p>
          </div>

          <div>
            {[
              { icon:"✉", text:"Instant lead notifications" },
              { icon:"→", text:"Personal funnel links" },
              { icon:"▦", text:"Real-time pipeline view" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
                <div style={{
                  width:34,height:34,borderRadius:9,flexShrink:0,
                  background:"rgba(243,112,33,.18)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:15,color:"#F37021",
                }}>{f.icon}</div>
                <span style={{ fontSize:13,color:"rgba(255,255,255,.7)",fontWeight:600 }}>{f.text}</span>
              </div>
            ))}
            <p style={{ marginTop:28,fontSize:10,color:"rgba(255,255,255,.22)",letterSpacing:".05em" }}>
              Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div style={{ width:"100%",maxWidth:400 }}>

            {/* ── STEP: password ── */}
            {step === "password" && (
              <>
                <h1 style={{ fontSize:30,fontWeight:800,color:"#1A2B42",marginBottom:6 }}>
                  Welcome back
                </h1>
                <p style={{ fontSize:14,color:"#64748B",marginBottom:36 }}>
                  Sign in to your HCMG portal
                </p>
                <form onSubmit={handlePassword}>
                  <div style={{ marginBottom:18 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#1A2B42",textTransform:"uppercase",letterSpacing:".1em",marginBottom:7 }}>
                      Email address
                    </label>
                    <input
                      className="login-input"
                      type="email" required autoComplete="email"
                      placeholder="you@hcmgloans.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom:26 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7 }}>
                      <label style={{ fontSize:11,fontWeight:700,color:"#1A2B42",textTransform:"uppercase",letterSpacing:".1em" }}>
                        Password
                      </label>
                      <a href="/reset-password" style={{ fontSize:12,color:"#F37021",textDecoration:"underline",fontWeight:600 }}>
                        Forgot password?
                      </a>
                    </div>
                    <input
                      className="login-input"
                      type="password" required autoComplete="current-password"
                      placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <ErrorBox message={error} />}
                  <button type="submit" disabled={loading} className="login-btn">
                    {loading ? "Signing in…" : "Sign in →"}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP: mfa-enroll ── */}
            {step === "mfa-enroll" && (
              <>
                <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#FF9847,#F37021)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🔐</div>
                  <h1 style={{ fontSize:24,fontWeight:800,color:"#1A2B42" }}>Set up two-factor auth</h1>
                </div>
                <p style={{ fontSize:13,color:"#64748B",marginBottom:24,lineHeight:1.6 }}>
                  HCMG requires MFA on all accounts. Scan the QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>1Password</strong>, then enter the 6-digit code below.
                </p>
                {qrCodeRef.current && (
                  <div style={{ display:"flex",justifyContent:"center",marginBottom:16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeRef.current} alt="MFA QR code" style={{ width:180,height:180,borderRadius:12,border:"2px solid #E2E8F0" }} />
                  </div>
                )}
                <p style={{ fontSize:11,color:"#94A3B8",textAlign:"center",marginBottom:2 }}>Can't scan? Enter this key manually:</p>
                <div className="secret-box">{secretRef.current}</div>
                <form onSubmit={handleEnrollVerify} style={{ marginTop:24 }}>
                  <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#1A2B42",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8 }}>
                    6-digit code
                  </label>
                  <input
                    className="mfa-code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                  {error && <ErrorBox message={error} style={{ marginTop:16 }} />}
                  <button type="submit" disabled={loading || code.length < 6} className="login-btn" style={{ marginTop:20 }}>
                    {loading ? "Verifying…" : "Confirm & sign in →"}
                  </button>
                </form>
              </>
            )}

            {/* ── STEP: mfa-verify ── */}
            {step === "mfa-verify" && (
              <>
                <div style={{ marginBottom:8, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#FF9847,#F37021)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🔐</div>
                  <h1 style={{ fontSize:24,fontWeight:800,color:"#1A2B42" }}>Two-factor authentication</h1>
                </div>
                <p style={{ fontSize:13,color:"#64748B",marginBottom:32,lineHeight:1.6 }}>
                  Open your authenticator app and enter the 6-digit code for <strong>HCMG Portal</strong>.
                </p>
                <form onSubmit={handleVerify}>
                  <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#1A2B42",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8 }}>
                    6-digit code
                  </label>
                  <input
                    className="mfa-code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                  {error && <ErrorBox message={error} style={{ marginTop:16 }} />}
                  <button type="submit" disabled={loading || code.length < 6} className="login-btn" style={{ marginTop:20 }}>
                    {loading ? "Verifying…" : "Sign in →"}
                  </button>
                </form>
                <p style={{ marginTop:16,fontSize:12,color:"#94A3B8",textAlign:"center" }}>
                  Lost access to your authenticator?{" "}
                  <a href="mailto:info@hcmgloans.com" style={{ color:"#F37021",textDecoration:"underline" }}>
                    Contact support
                  </a>
                </p>
              </>
            )}

            {step === "password" && (
              <>
                <p style={{ marginTop:28,fontSize:12,color:"#94A3B8",textAlign:"center" }}>
                  Trouble signing in?{" "}
                  <a href="mailto:info@hcmgloans.com" style={{ color:"#F37021",textDecoration:"underline" }}>
                    Contact support
                  </a>
                </p>
                <p style={{ marginTop:36,fontSize:11,color:"#CBD5E1",textAlign:"center" }}>
                  © {new Date().getFullYear()} Harris Capital Mortgage Group, LLC · NMLS# 1918223
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ErrorBox({ message, style }: { message: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      marginBottom:18,padding:"12px 16px",borderRadius:12,
      background:"#FFF5F5",border:"1.5px solid #FED7D7",
      fontSize:13,color:"#C53030",fontWeight:500,
      ...style,
    }}>
      {message}
    </div>
  );
}
