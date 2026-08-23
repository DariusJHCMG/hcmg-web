"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LiftOffLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/liftoff";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (!data.user) { setError("Sign in failed. Please try again."); setLoading(false); return; }
      window.location.href = next;
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Montserrat', system-ui, sans-serif",
    }}>

      {/* ── Left branding panel ── */}
      <div style={{
        width: "45%",
        minHeight: "100vh",
        background: "linear-gradient(145deg,#142850 0%,#1a3260 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 52px",
      }} className="hidden lg:flex">

        {/* Top — logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-1px",
            }}>H</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: ".02em" }}>HCMG</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#F37021", letterSpacing: ".2em", textTransform: "uppercase", marginTop: 2 }}>
                Harris Capital Mortgage Group
              </div>
            </div>
          </div>

          {/* Lift Off badge */}
          <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(243,112,33,0.15)", border: "1px solid rgba(243,112,33,0.3)",
            borderRadius: 50, padding: "8px 18px" }}>
            <span style={{ fontSize: 18 }}>🚀</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#FF9847", letterSpacing: ".1em", textTransform: "uppercase" }}>
              Lift Off
            </span>
          </div>
        </div>

        {/* Middle — headline */}
        <div>
          <h2 style={{ fontSize: 44, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            Submit.<br />Track.<br />
            <span style={{ background: "linear-gradient(135deg,#FF9847,#F37021)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Lift Off.
            </span>
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.75, maxWidth: 340 }}>
            The HCMG loan operations request system. Submit disclosures, submissions, lock requests, and more — all tracked in one place.
          </p>
        </div>

        {/* Bottom — features */}
        <div>
          {[
            { icon: "📋", text: "Register + Disclosure requests" },
            { icon: "🚀", text: "Full submission packages" },
            { icon: "🔒", text: "Lock requests with live pricing" },
          ].map(f => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(243,112,33,.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15,
              }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,.65)", fontWeight: 600 }}>{f.text}</span>
            </div>
          ))}
          <p style={{ marginTop: 28, fontSize: 10, color: "rgba(255,255,255,.2)", letterSpacing: ".05em" }}>
            Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F8FAFC",
        padding: "48px 32px",
      }}>

        {/* Mobile logo */}
        <div style={{ marginBottom: 36, textAlign: "center" }} className="lg:hidden">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#fff",
            }}>H</div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1A2B42" }}>HCMG</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#F37021", letterSpacing: ".15em", textTransform: "uppercase" }}>
            🚀 Lift Off
          </span>
        </div>

        <div style={{ width: "100%", maxWidth: 420 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 900, color: "#1A2B42" }}>
            Sign in
          </h1>
          <p style={{ margin: "0 0 36px", fontSize: 14, color: "#64748B" }}>
            Use your HCMG credentials to access Lift Off
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", marginBottom: 8,
                fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
                textTransform: "uppercase", color: "#1A2B42",
              }}>
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@hcmgloans.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  border: "2px solid #E2E8F0", background: "#fff",
                  fontSize: 15, color: "#1A2B42", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box" as const,
                  transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "#F37021"}
                onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
                  textTransform: "uppercase", color: "#1A2B42",
                }}>
                  Password
                </label>
                <a href="/reset-password" style={{ fontSize: 12, color: "#F37021", fontWeight: 700, textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  border: "2px solid #E2E8F0", background: "#fff",
                  fontSize: 15, color: "#1A2B42", outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box" as const,
                  transition: "border-color .15s",
                }}
                onFocus={e => e.target.style.borderColor = "#F37021"}
                onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 20, padding: "13px 18px", borderRadius: 12,
                background: "#FFF5F5", border: "1.5px solid #FECACA",
                fontSize: 13, color: "#DC2626", fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px 24px", borderRadius: 14,
                background: loading
                  ? "#CBD5E1"
                  : "linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%)",
                color: "#fff", fontSize: 16, fontWeight: 800,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: ".02em",
                boxShadow: loading ? "none" : "0 8px 24px rgba(243,112,33,0.35)",
                transition: "all .15s",
              }}
            >
              {loading ? "Signing in…" : "Enter Lift Off →"}
            </button>
          </form>

          <p style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "#94A3B8" }}>
            Need access?{" "}
            <a href="mailto:info@hcmgloans.com" style={{ color: "#F37021", fontWeight: 700, textDecoration: "none" }}>
              Contact support
            </a>
          </p>
          <p style={{ marginTop: 12, textAlign: "center", fontSize: 11, color: "#CBD5E1" }}>
            © {new Date().getFullYear()} Harris Capital Mortgage Group, LLC · NMLS# 1918223
          </p>
        </div>
      </div>
    </div>
  );
}
