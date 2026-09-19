"use client";

import { useState } from "react";
import { UniversitySidebar, UniversityMobileDrawer } from "@/components/university/UniversitySidebar";
import type { UniversityRole } from "@/lib/database.types";

interface Props {
  children: React.ReactNode;
  profileName: string;
  profileAvatar: string | null;
  universityRole: UniversityRole;
}

export function UniversityLayoutClient({ children, profileName, profileAvatar, universityRole }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = profileName
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff" }}>
      {/* Desktop sidebar — hidden on mobile via CSS class */}
      <UniversitySidebar universityRole={universityRole} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <UniversityMobileDrawer
          universityRole={universityRole}
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Main content column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #dfe4e8",
          background: "#fff",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 10,
              border: "1px solid #dfe4e8", background: "#fff", cursor: "pointer",
            }}
            aria-label="Open navigation"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="#071a2e" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }} />

          {/* Right: user chip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#687383" }}>
              {profileName}
            </span>
            {profileAvatar ? (
              <img src={profileAvatar} alt={profileName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg,#FF9847,#F37021)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
              }}>
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
