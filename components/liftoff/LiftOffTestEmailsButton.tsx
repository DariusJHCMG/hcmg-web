"use client";

import { useState, useEffect } from "react";

export function LiftOffTestEmailsButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<string[]>([]);
  const [testMode, setTestMode] = useState<{ on: boolean; email: string } | null>(null);

  // Check test mode status on mount
  useEffect(() => {
    fetch("/api/liftoff/test-mode-status")
      .then(r => r.json())
      .then(d => setTestMode({ on: d.test_mode, email: d.test_email }))
      .catch(() => {});
  }, []);

  async function handleClick() {
    if (!confirm(
      "Send all 10 Liftoff email templates to darius@hcmgloans.com for proofing?\n\nNo DB changes will be made."
    )) return;

    setState("loading");
    setResult([]);

    try {
      const res = await fetch("/api/liftoff/test-emails", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setState("error");
        setResult([json.error ?? "Unknown error"]);
        return;
      }
      setState("done");
      setResult(json.emails ?? [`${json.sent_count} emails sent`]);
    } catch (err) {
      setState("error");
      setResult([String(err)]);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 flex-shrink-0">

      {/* Test mode status pill */}
      {testMode && (
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold border ${
          testMode.on
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <span>{testMode.on ? "✅" : "❌"}</span>
          {testMode.on
            ? `TEST MODE ON → ${testMode.email}`
            : "TEST MODE OFF — emails go to real recipients"}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleClick}
        disabled={state === "loading"}
        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="text-base">📧</span>
        {state === "loading" ? "Sending…" : "Send Test Emails"}
      </button>

      {/* Result */}
      {state === "done" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs max-w-xs">
          <p className="font-bold text-green-800 mb-1.5">
            ✅ {result.length} of 27 emails sent to darius@hcmgloans.com
          </p>
          <ul className="space-y-0.5">
            {result.map((line, i) => (
              <li key={i} className="text-green-700 font-mono">{line}</li>
            ))}
          </ul>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs max-w-xs">
          <p className="font-bold text-red-700 mb-1">❌ Send failed</p>
          {result.map((line, i) => (
            <p key={i} className="text-red-600 font-mono">{line}</p>
          ))}
        </div>
      )}

      {/* Label */}
      <p className="text-[10px] text-muted/60 text-right">
        Temp · admin only · no DB writes
      </p>
    </div>
  );
}
