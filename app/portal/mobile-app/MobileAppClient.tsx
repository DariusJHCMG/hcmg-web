"use client";

import { useState } from "react";

type Device = "ios" | "android" | "other";

const DEVICE_OPTIONS: { value: Device; label: string; icon: string; desc: string }[] = [
  { value: "ios",     label: "iPhone / iPad",  icon: "🍎", desc: "Safari · Add to Home Screen" },
  { value: "android", label: "Android",         icon: "🤖", desc: "Chrome · Install App prompt" },
];

interface Props {
  defaultEmail: string;
}

export default function MobileAppClient({ defaultEmail }: Props) {
  const [device,  setDevice]  = useState<Device | null>(null);
  const [email,   setEmail]   = useState(defaultEmail);
  const [status,  setStatus]  = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  async function send() {
    if (!email || !device) return;
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/portal/mobile-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, device }),
      });
      const json = await res.json();
      if (!res.ok) { setErrMsg(json.error ?? "Failed to send"); setStatus("error"); return; }
      setStatus("sent");
    } catch {
      setErrMsg("Network error — try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Mobile App</h1>
        <p className="mt-1 text-sm text-muted">
          Install the HCMG portal on your phone — no App Store required.
          Enter your email and we&apos;ll send step-by-step install instructions.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <p className="mb-4 text-sm font-extrabold text-ink">How it works</p>
        <ol className="space-y-3">
          {[
            { n: "1", text: "Select your device type below" },
            { n: "2", text: "Enter your email address" },
            { n: "3", text: "Open the email on your phone and follow the steps" },
            { n: "4", text: "The HCMG portal icon appears on your home screen" },
          ].map(s => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#142850,#1e3a6e)" }}>
                {s.n}
              </span>
              <span className="text-sm text-ink pt-0.5">{s.text}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#142850,#F37021)" }} />
        <div className="p-6 space-y-5">

          {/* Device picker */}
          <div>
            <p className="mb-3 text-sm font-bold text-ink">1. Select your device</p>
            <div className="grid grid-cols-2 gap-3">
              {DEVICE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setDevice(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                    device === opt.value
                      ? "border-[#142850] bg-[#142850]/5"
                      : "border-line bg-white hover:border-[#142850]/30"
                  }`}>
                  <span className="text-3xl">{opt.icon}</span>
                  <span className="text-sm font-bold text-ink">{opt.label}</span>
                  <span className="text-[11px] text-muted">{opt.desc}</span>
                  {device === opt.value && (
                    <span className="mt-1 rounded-full bg-[#142850] px-2 py-0.5 text-[10px] font-bold text-white">Selected ✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email input */}
          <div>
            <p className="mb-2 text-sm font-bold text-ink">2. Enter your email</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="you@example.com"
                disabled={status === "sending" || status === "sent"}
                className="flex-1 rounded-xl border border-line bg-sand px-4 py-2.5 text-sm text-ink placeholder:text-muted/50
                           focus:border-[#142850] focus:outline-none focus:ring-2 focus:ring-[#142850]/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Send button */}
          {status === "sent" ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              ✓ Email sent! Open it on your phone and follow the steps to install.
            </div>
          ) : (
            <button
              onClick={send}
              disabled={!email || !device || status === "sending"}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "linear-gradient(90deg,#142850,#1e3a6e)" }}>
              {status === "sending" ? "Sending…" : "Send Install Link →"}
            </button>
          )}

          {status === "error" && (
            <p className="text-xs font-semibold text-red-600">{errMsg}</p>
          )}

          {/* Reset */}
          {status === "sent" && (
            <button onClick={() => { setStatus("idle"); setEmail(defaultEmail); setDevice(null); }}
              className="w-full text-xs font-semibold text-muted hover:text-ink transition-colors">
              Send to a different email
            </button>
          )}
        </div>
      </div>

      {/* Already installed note */}
      <div className="rounded-xl border border-line bg-sand px-4 py-3">
        <p className="text-xs text-muted">
          <strong className="text-ink">Already installed?</strong> The app opens directly to your dashboard with no browser navigation bar.
          You can re-install at any time by following the steps above.
        </p>
      </div>

    </div>
  );
}
