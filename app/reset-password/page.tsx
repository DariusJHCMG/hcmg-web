"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode]         = useState<"request" | "update">("request");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState("");

  // If Supabase redirects back with a hash/code, switch to "update" mode
  useEffect(() => {
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    if (code || type === "recovery") {
      setMode("update");
    }
  }, [searchParams]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createBrowserClient();
    const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE}/reset-password?type=recovery`,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Check your email for a password reset link.");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    setStatus("loading");
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Password updated! Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #E2E8F0", background: "#fff",
    fontSize: 14, color: "#1A2B42", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 700,
    color: "#1A2B42", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.08em",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f7f8fa", fontFamily: "Montserrat, sans-serif", padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: "0 auto 10px",
            background: "linear-gradient(135deg, #FF9847 0%, #F37021 50%, #C45213 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 900, color: "#fff",
          }}>H</div>
          <p style={{ fontSize: 11, color: "#F37021", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Harris Capital Mortgage Group
          </p>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A2B42", marginBottom: 6 }}>
          {mode === "request" ? "Reset your password" : "Set new password"}
        </h1>
        <p style={{ fontSize: 14, color: "#6B7B8D", marginBottom: 28 }}>
          {mode === "request"
            ? "Enter your HCMG email and we'll send a reset link."
            : "Choose a strong new password for your account."}
        </p>

        {status === "success" ? (
          <div style={{
            padding: "20px 24px", borderRadius: 16,
            background: "#F0FFF4", border: "1.5px solid #9AE6B4",
            fontSize: 14, color: "#276749", fontWeight: 600,
          }}>
            ✅ {message}
          </div>
        ) : (
          <form onSubmit={mode === "request" ? handleRequest : handleUpdate}>
            {mode === "request" ? (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email" required autoComplete="email"
                  placeholder="you@hcmgloans.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>New password</label>
                  <input
                    type="password" required autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Confirm new password</label>
                  <input
                    type="password" required autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {status === "error" && (
              <div style={{
                marginBottom: 16, padding: "12px 16px", borderRadius: 12,
                background: "#FFF5F5", border: "1px solid #FED7D7",
                fontSize: 13, color: "#C53030", fontWeight: 500,
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%", padding: "14px 24px", borderRadius: 14,
                background: status === "loading" ? "#ccc" : "linear-gradient(135deg, #FF9847 0%, #F37021 50%, #C45213 100%)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                border: "none", cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
              }}
            >
              {status === "loading"
                ? "Please wait…"
                : mode === "request" ? "Send reset link →" : "Update password →"}
            </button>
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: 13, color: "#9AABB8", textAlign: "center" }}>
          <a href="/login" style={{ color: "#F37021", textDecoration: "underline", fontWeight: 600 }}>
            ← Back to sign in
          </a>
        </p>

        <p style={{ marginTop: 32, fontSize: 11, color: "#C4D0DC", textAlign: "center" }}>
          © {new Date().getFullYear()} Harris Capital Mortgage Group, LLC · NMLS# 1918223
        </p>
      </div>
    </div>
  );
}
