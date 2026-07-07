"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user)  { setError("Sign in failed. Please try again."); setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles").select("role").eq("id", data.user.id).single();

      const dest = next || (profile?.role === "loan_officer" ? "/portal" : "/admin");
      // Hard redirect — forces full page reload so server middleware sees the session cookie
      window.location.href = dest;
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
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

        {/* ── Right form panel ── */}
        <div className="login-right">
          <div style={{ width:"100%",maxWidth:400 }}>
            <h1 style={{ fontSize:30,fontWeight:800,color:"#1A2B42",marginBottom:6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize:14,color:"#64748B",marginBottom:36 }}>
              Sign in to your HCMG portal
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
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

              {/* Password */}
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

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom:18,padding:"12px 16px",borderRadius:12,
                  background:"#FFF5F5",border:"1.5px solid #FED7D7",
                  fontSize:13,color:"#C53030",fontWeight:500,
                }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <p style={{ marginTop:28,fontSize:12,color:"#94A3B8",textAlign:"center" }}>
              Trouble signing in?{" "}
              <a href="mailto:info@harriscapitalmortgage.com" style={{ color:"#F37021",textDecoration:"underline" }}>
                Contact support
              </a>
            </p>
            <p style={{ marginTop:36,fontSize:11,color:"#CBD5E1",textAlign:"center" }}>
              © {new Date().getFullYear()} Harris Capital Mortgage Group, LLC · NMLS# 1918223
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
