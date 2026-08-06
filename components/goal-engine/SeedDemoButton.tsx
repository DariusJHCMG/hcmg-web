"use client";

import { useState } from "react";

export function SeedDemoButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function seed() {
    setStatus("loading");
    try {
      const res  = await fetch("/api/goal-engine/seed-demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) { setStatus("ok");  setMsg(data.message ?? "Demo data seeded!"); }
      else        { setStatus("err"); setMsg(data.error   ?? "Error seeding data."); }
    } catch (e) {
      setStatus("err");
      setMsg(String(e));
    }
  }

  return (
    <div>
      <button
        onClick={seed}
        disabled={status === "loading"}
        style={{
          padding: "10px 20px",
          borderRadius: 12,
          border: "none",
          background:
            status === "ok"  ? "#dcfce7" :
            status === "err" ? "#fee2e2" :
            "linear-gradient(135deg,#FF9847,#F37021)",
          color:
            status === "ok"  ? "#166534" :
            status === "err" ? "#991b1b" :
            "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {status === "loading" ? "Seeding…" :
         status === "ok"      ? "✅ Seeded!" :
         status === "err"     ? "❌ Failed" :
         "🌱 Seed Demo Data"}
      </button>
      {msg && (
        <p style={{
          margin: "6px 0 0",
          fontSize: 11,
          color: status === "ok" ? "#166534" : "#991b1b",
          lineHeight: 1.6,
        }}>
          {msg}
        </p>
      )}
    </div>
  );
}
