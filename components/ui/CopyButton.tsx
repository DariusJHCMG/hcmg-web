"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold transition-colors"
      style={{
        color: copied ? "#16a34a" : undefined,
        borderColor: copied ? "#86efac" : undefined,
        background: copied ? "#f0fdf4" : undefined,
      }}
    >
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}
