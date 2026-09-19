"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { UniversityRole } from "@/lib/database.types";

const NAV = [
  { label: "Dashboard",        href: "/university",                         icon: "⊞" },
  { label: "Harry's Playbook", href: "/university/search?path=harrys_playbook", icon: "📖" },
  { label: "Fast Start",       href: "/university/search?path=fast_start",  icon: "🚀" },
  { label: "Library",          href: "/university/search",                  icon: "⌕" },
  { label: "Certificates",     href: "/university/certificates",            icon: "◈" },
];

const ADMIN_NAV = [
  { label: "Admin Dashboard", href: "/university/admin",              icon: "⚙" },
  { label: "Courses",         href: "/university/admin/courses",      icon: "📋" },
  { label: "Assignments",     href: "/university/admin/assignments",  icon: "▦" },
  { label: "Reports",         href: "/university/admin/reports",      icon: "📊" },
  { label: "Users",           href: "/university/admin/users",        icon: "👥" },
];

interface Props {
  universityRole: UniversityRole;
  onNavClick?: () => void;
}

function SidebarContent({ universityRole, onNavClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isAdmin = universityRole === "university_admin" || universityRole === "trainer";

  async function signOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0];
    if (hrefPath === "/university") return pathname === hrefPath;
    return pathname.startsWith(hrefPath);
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
              <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

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
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
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
          <span style={{ fontSize: 14 }}>←</span> Back to Portal
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
          <span style={{ fontSize: 14 }}>⏻</span>
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
