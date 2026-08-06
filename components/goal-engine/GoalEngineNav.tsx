"use client";

/**
 * GoalEngineNav — Left dock sidebar navigation for SLICE by HCMG
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { Role } from "@/lib/database.types";

interface Props {
  fullName:  string;
  role:      Role;
  avatarUrl: string | null;
}

const C = {
  bg:      "#F8FAFC",
  white:   "#ffffff",
  navy:    "#142850",
  orange:  "#F37021",
  ink:     "#1A2B42",
  muted:   "#64748B",
  line:    "#E2E8F0",
  activeBg:"rgba(243,112,33,0.08)",
};

const LO_NAV = [
  { label: "Dashboard",    href: "/goal-engine/dashboard",           icon: "⊞"  },
  { label: "My Slice",     href: "/goal-engine/commit",              icon: "🥧" },
  { label: "The Pie",      href: "/goal-engine/slice-visualization", icon: "🥧" },
  { label: "Leaderboard",  href: "/goal-engine/leaderboard",        icon: "🏅" },
  { label: "History",      href: "/goal-engine/history",            icon: "🗓" },
  { label: "Trophy Room",  href: "/goal-engine/awards",             icon: "🏆" },
];

const ADMIN_NAV = [
  { label: "Dashboard",    href: "/goal-engine/dashboard",           icon: "⊞"  },
  { label: "My Slice",     href: "/goal-engine/commit",              icon: "🥧" },
  { label: "The Pie",      href: "/goal-engine/slice-visualization", icon: "🥧" },
  { label: "Leaderboard",  href: "/goal-engine/leaderboard",        icon: "🏅" },
  { label: "Forecast",     href: "/goal-engine/forecast",           icon: "📈" },
  { label: "History",      href: "/goal-engine/history",            icon: "🗓" },
  { label: "Trophy Room",  href: "/goal-engine/awards",             icon: "🏆" },
  { label: "THE SLICE",    href: "/goal-engine/the-slice",          icon: "📺" },
];

const ADMIN_SECTION = [
  { label: "Manage Goals",   href: "/goal-engine/admin",              icon: "🎯" },
  { label: "Manager View",   href: "/goal-engine/admin/dashboard",    icon: "📊" },
  { label: "Forecast Center",href: "/goal-engine/forecast",          icon: "📡" },
  { label: "Coaching Notes", href: "/goal-engine/admin/coaching",    icon: "📝" },
  { label: "Production",     href: "/goal-engine/admin/production",  icon: "🔧" },
  { label: "Email Log",      href: "/goal-engine/admin/email-log",   icon: "📧" },
  { label: "Team Members",   href: "/goal-engine/admin/users",        icon: "👥" },
  { label: "ARIVE Setup",    href: "/goal-engine/admin/arive",        icon: "🔗" },
  { label: "Test Panel",     href: "/goal-engine/admin/test",         icon: "🧪" },
];

function Initials({ name }: { name: string }) {
  return <>{name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</>;
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 14px", borderRadius: 10,
        background: active ? C.activeBg : "transparent",
        borderLeft: active ? `3px solid ${C.orange}` : "3px solid transparent",
        transition: "background .15s",
      }}>
        <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontSize: 13, fontWeight: active ? 800 : 500,
          color: active ? C.orange : C.muted,
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
      </div>
    </Link>
  );
}

export function GoalEngineNav({ fullName, role, avatarUrl }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = role === "admin" || role === "developer";
  const navLinks = isAdmin ? ADMIN_NAV : LO_NAV;

  async function signOut() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    window.location.href = "/goal-engine-login";
  }

  function isActive(href: string) {
    if (href === "/goal-engine/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  const sidebar = (
    <nav style={{
      width: 220, flexShrink: 0,
      background: C.white,
      borderRight: `1px solid ${C.line}`,
      display: "flex", flexDirection: "column",
      minHeight: "100vh",
      position: "sticky", top: 0,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.line}` }}>
        <Link href="/goal-engine/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height: 44, width: "auto", display: "block" }} />
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.orange, lineHeight: 1 }}>by</div>
            <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 11, width: "auto", display: "block", marginTop: 3 }} />
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <div style={{ padding: "12px 8px", flex: 1 }}>
        <div style={{ marginBottom: 4 }}>
          <p style={{ margin: "0 0 6px 14px", fontSize: 9, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: "#CBD5E1" }}>
            Navigation
          </p>
          {navLinks.map(l => (
            <NavItem key={l.href} {...l} active={isActive(l.href)} />
          ))}
        </div>

        {isAdmin && (
          <div style={{ marginTop: 20 }}>
            <p style={{ margin: "0 0 6px 14px", fontSize: 9, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: "#CBD5E1" }}>
              Admin
            </p>
            {ADMIN_SECTION.map(l => (
              <NavItem key={l.href} {...l} active={isActive(l.href)} />
            ))}
          </div>
        )}
      </div>

      {/* User profile + sign out */}
      <div style={{ padding: "14px 12px", borderTop: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.orange}`, flexShrink: 0 }} />
          ) : (
            <span style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 900, color: "#fff",
              background: `linear-gradient(135deg,#FF9847,${C.orange})`,
              border: `2px solid ${C.orange}`,
            }}>
              <Initials name={fullName} />
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {fullName.split(" ")[0]}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 9, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: ".1em" }}>
              {isAdmin ? "Admin" : "Loan Officer"}
            </p>
          </div>
        </div>
        <button onClick={signOut} style={{
          width: "100%", padding: "8px 0", borderRadius: 8,
          border: `1px solid ${C.line}`,
          background: C.bg, color: C.muted,
          fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="ge-sidebar-desktop">
        {sidebar}
      </div>

      {/* Mobile top bar */}
      <div className="ge-mobile-bar" style={{
        display: "none", position: "sticky", top: 0, zIndex: 40,
        background: C.white, borderBottom: `1px solid ${C.line}`,
        borderTop: `3px solid ${C.orange}`,
        padding: "0 16px", height: 60,
        alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/goal-engine/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height: 36, width: "auto" }} />
          <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 10, width: "auto" }} />
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} style={{
          background: "transparent", border: "none", color: C.ink,
          fontSize: 22, cursor: "pointer", lineHeight: 1,
        }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="ge-mobile-bar" style={{ display: "block", position: "fixed", inset: 0, zIndex: 50 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileOpen(false)} />
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: 240,
            background: C.navy, display: "flex", flexDirection: "column",
          }}>
            <div style={{ padding: "18px 14px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <img src="/SLICE.png" alt="SLICE" style={{ height: 36, width: "auto" }} />
              <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }} onClick={() => setMobileOpen(false)}>
              {navLinks.map(l => <NavItem key={l.href} {...l} active={isActive(l.href)} />)}
              {isAdmin && (
                <>
                  <div style={{ height: 1, background: C.line, margin: "12px 8px" }} />
                  {ADMIN_SECTION.map(l => <NavItem key={l.href} {...l} active={isActive(l.href)} />)}
                </>
              )}
            </div>
            <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.line}` }}>
              <button onClick={signOut} style={{
                width: "100%", padding: "10px 0", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
                color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}>Sign out</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ge-sidebar-desktop { display: flex; }
        @media (max-width: 768px) {
          .ge-sidebar-desktop { display: none !important; }
          .ge-mobile-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
