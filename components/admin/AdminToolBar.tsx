"use client";

import Link from "next/link";

/**
 * Thin admin-only banner shown at the top of SLICE, HCMG U, and LiftOff.
 * Gives admins a clear "you are an admin" indicator and a one-click way
 * back to the admin portal from any internal tool.
 *
 * Props:
 *   backHref  — where "Back to Admin" links to (default "/admin")
 *   toolName  — the name of the current tool, shown in the banner
 */
export function AdminToolBar({
  backHref = "/admin",
  toolName,
}: {
  backHref?: string;
  toolName: string;
}) {
  return (
    <div style={{
      background: "#142850",
      borderBottom: "1px solid rgba(243,112,33,0.3)",
      padding: "6px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Left: admin indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "#F37021",
        }}>
          ⚙ Admin View
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>·</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 600, letterSpacing: "0.08em" }}>
          {toolName}
        </span>
      </div>

      {/* Right: back button */}
      <Link
        href={backHref}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 10, fontWeight: 800, color: "#fff",
          background: "rgba(243,112,33,0.2)",
          border: "1px solid rgba(243,112,33,0.4)",
          borderRadius: 6, padding: "3px 10px",
          textDecoration: "none", letterSpacing: "0.04em",
          transition: "background 0.15s",
        }}
      >
        ← Back to Admin
      </Link>
    </div>
  );
}
