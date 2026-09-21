"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { UniversityRole } from "@/lib/database.types";

// ── SVG icon helpers ─────────────────────────────────────────────────────────

function Ico({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {children}
    </span>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></Ico>,
  book:      <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></Ico>,
  rocket:    <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg></Ico>,
  search:    <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></Ico>,
  cert:      <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></Ico>,
  team:      <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></Ico>,
  admin:     <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></Ico>,
  courses:   <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></Ico>,
  media:     <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></Ico>,
  assign:    <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg></Ico>,
  reports:   <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></Ico>,
  comply:    <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></Ico>,
  exempt:    <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></Ico>,
  users:     <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Ico>,
  org:       <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="4" rx="1"/><path d="M5 7v10a1 1 0 0 0 1 1h4V7"/><path d="M19 7v10a1 1 0 0 1-1 1h-4V7"/><line x1="12" y1="7" x2="12" y2="22"/></svg></Ico>,
  hr:        <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></Ico>,
  audit:     <Ico><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></Ico>,
};

const NAV = [
  { label: "Dashboard",        href: "/university",                              icon: ICONS.dashboard },
  { label: "Harry's Playbook", href: "/university/search?path=harrys_playbook",  icon: ICONS.book },
  { label: "Fast Start",       href: "/university/search?path=fast_start",       icon: ICONS.rocket },
  { label: "Library",          href: "/university/search",                       icon: ICONS.search },
  { label: "Certificates",     href: "/university/certificates",                 icon: ICONS.cert },
];

const MANAGER_NAV = [
  { label: "My Team", href: "/university/manager", icon: ICONS.team },
];

const ADMIN_NAV = [
  { label: "Admin Dashboard", href: "/university/admin",              icon: ICONS.admin },
  { label: "Courses",         href: "/university/admin/courses",      icon: ICONS.courses },
  { label: "Media Library",   href: "/university/admin/media",        icon: ICONS.media },
  { label: "Assignments",     href: "/university/admin/assignments",  icon: ICONS.assign },
  { label: "Reports",         href: "/university/admin/reports",      icon: ICONS.reports },
  { label: "Compliance",      href: "/university/admin/compliance",   icon: ICONS.comply },
  { label: "Exemptions",      href: "/university/admin/exemptions",   icon: ICONS.exempt },
  { label: "Users",           href: "/university/admin/users",        icon: ICONS.users },
  { label: "Org Units",       href: "/university/admin/org-units",    icon: ICONS.org },
  { label: "HR Overview",     href: "/university/hr",                 icon: ICONS.hr },
  { label: "Audit Log",       href: "/university/admin/audit-log",    icon: ICONS.audit },
];

interface Props {
  universityRole: UniversityRole;
  onNavClick?: () => void;
}

function SidebarContent({ universityRole, onNavClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isAdmin   = universityRole === "university_admin" || universityRole === "trainer";
  const isManager = universityRole === "manager" || universityRole === "university_admin";

  async function signOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    // For links with query params (e.g. ?path=harrys_playbook), match both path AND query
    if (href.includes("?")) {
      const [hrefPath, hrefQuery] = href.split("?");
      const currentQuery = typeof window !== "undefined" ? window.location.search.slice(1) : "";
      return pathname === hrefPath && currentQuery === hrefQuery;
    }
    if (href === "/university") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <div style={{
        padding: "20px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <Link href="/university" onClick={onNavClick} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#f58220",
            clipPath: "polygon(50% 0,100% 24%,92% 80%,50% 100%,8% 80%,0 24%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 900, color: "#fff", flexShrink: 0,
          }}>H</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            HCMG <span style={{ color: "#f58220" }}>U</span>
          </span>
        </Link>
        <p style={{ fontSize: 9, letterSpacing: "1.5px", color: "#687383", marginTop: 4, textTransform: "uppercase", paddingLeft: 42 }}>
          TEAM LEARNING
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 10, textDecoration: "none",
                fontSize: 13, fontWeight: 600,
                background: isActive(item.href) ? "rgba(245,130,32,0.15)" : "transparent",
                color: isActive(item.href) ? "#f58220" : "#b9c5d0",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {isManager && !isAdmin && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.4px", color: "#687383", textTransform: "uppercase", padding: "0 12px 8px" }}>
              Manager
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {MANAGER_NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10, textDecoration: "none",
                    fontSize: 13, fontWeight: 600,
                    background: isActive(item.href) ? "rgba(245,130,32,0.15)" : "transparent",
                    color: isActive(item.href) ? "#f58220" : "#b9c5d0",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.4px", color: "#687383", textTransform: "uppercase", padding: "0 12px 8px" }}>
              Admin
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ADMIN_NAV.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavClick}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 10, textDecoration: "none",
                    fontSize: 13, fontWeight: 600,
                    background: isActive(item.href) ? "rgba(245,130,32,0.15)" : "transparent",
                    color: isActive(item.href) ? "#f58220" : "#b9c5d0",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 2 }}>
        <Link
          href="/portal"
          onClick={onNavClick}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10, textDecoration: "none",
            fontSize: 13, fontWeight: 600, color: "#687383",
            transition: "color 0.15s",
          }}
        >
          <Ico><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg></Ico>
          Back to Portal
        </Link>
        <button
          onClick={signOut}
          disabled={signingOut}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10, border: "none",
            background: "transparent", textAlign: "left",
            fontSize: 13, fontWeight: 600, color: "#687383",
            cursor: signingOut ? "not-allowed" : "pointer",
            opacity: signingOut ? 0.5 : 1,
            transition: "color 0.15s",
            width: "100%",
          }}
        >
          <Ico><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></Ico>
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function UniversitySidebar({ universityRole }: { universityRole: UniversityRole }) {
  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .uni-sidebar { display: flex !important; flex-direction: column; }
        }
      `}</style>
      <aside
        className="uni-sidebar"
        style={{
          width: 220, flexShrink: 0, height: "100vh",
          background: "#071a2e",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          position: "sticky", top: 0, overflowY: "auto",
          display: "none",
        }}
      >
        <SidebarContent universityRole={universityRole} />
      </aside>
    </>
  );
}

export function UniversityMobileDrawer({ universityRole, onClose }: { universityRole: UniversityRole; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(7,26,46,0.5)", backdropFilter: "blur(2px)",
        }}
      />
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 260, background: "#071a2e",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        overflowY: "auto",
      }}>
        <SidebarContent universityRole={universityRole} onNavClick={onClose} />
      </aside>
    </>
  );
}
