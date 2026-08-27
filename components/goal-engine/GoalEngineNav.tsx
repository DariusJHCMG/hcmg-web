"use client";

/**
 * GoalEngineNav — Left dock sidebar (desktop) + top bar / bottom tabs (mobile)
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
  profileId: string;
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

const ADMIN_SECTION_BASE = [
  { label: "Manage Goals",    href: "/goal-engine/admin",              icon: "🎯" },
  { label: "Manager View",    href: "/goal-engine/admin/dashboard",    icon: "📊" },
  { label: "Forecast Center", href: "/goal-engine/forecast",          icon: "📡" },
  { label: "Coaching Notes",  href: "/goal-engine/admin/coaching",    icon: "📝" },
  { label: "Production",      href: "/goal-engine/admin/production",  icon: "🔧" },
  { label: "Email Log",       href: "/goal-engine/admin/email-log",   icon: "📧" },
  { label: "Webhook Log",     href: "/goal-engine/admin/webhook-log", icon: "🛰️" },
  { label: "Team Members",    href: "/goal-engine/admin/users",        icon: "👥" },
];

const DARIUS_ONLY = [
  { label: "ARIVE Setup",  href: "/goal-engine/admin/arive", icon: "🔗" },
  { label: "Test Panel",   href: "/goal-engine/admin/test",  icon: "🧪" },
];

const DARIUS_ID = "736a599a-492a-4585-b845-74b264d0ac9e";

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

export function GoalEngineNav({ fullName, role, avatarUrl, profileId }: Props) {
  const pathname    = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isAdmin    = role === "admin" || role === "developer";
  const navLinks   = isAdmin ? ADMIN_NAV : LO_NAV;
  const adminLinks = isAdmin
    ? [...ADMIN_SECTION_BASE, ...(profileId === DARIUS_ID ? DARIUS_ONLY : [])]
    : [];

  async function signOut() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    window.location.href = "/goal-engine-login";
  }

  function isActive(href: string) {
    if (href === "/goal-engine/dashboard") return pathname === href;
    return pathname.startsWith(href);
  }

  // ── Mobile bottom tabs ────────────────────────────────────────────────────
  // Primary tabs (always shown)
  const primaryTabs = [
    { label: "Home",    href: "/goal-engine/dashboard",    icon: "⊞" },
    { label: "My Slice",href: "/goal-engine/commit",       icon: "🥧" },
    { label: "Board",   href: "/goal-engine/leaderboard",  icon: "🏅" },
    { label: "Awards",  href: "/goal-engine/awards",       icon: "🏆" },
  ];
  if (isAdmin) {
    primaryTabs.splice(3, 0, { label: "Admin", href: "/goal-engine/admin", icon: "🎯" });
  }

  // Secondary links shown in the "More" sheet
  const moreLinks = [
    { label: "The Pie",    href: "/goal-engine/slice-visualization", icon: "🥧" },
    { label: "History",    href: "/goal-engine/history",             icon: "🗓" },
    ...(isAdmin ? [
      { label: "Forecast",   href: "/goal-engine/forecast",          icon: "📈" },
      { label: "THE SLICE",  href: "/goal-engine/the-slice",         icon: "📺" },
      ...adminLinks,
    ] : []),
  ];

  // ── Desktop sidebar ───────────────────────────────────────────────────────
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
      {/* Logo + back link */}
      <div style={{ padding: "20px 16px 14px", borderBottom: `1px solid ${C.line}` }}>
        <Link href="/goal-engine/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height: 44, width: "auto", display: "block" }} />
          <div>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.orange, lineHeight: 1 }}>by</div>
            <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 11, width: "auto", display: "block", marginTop: 3 }} />
          </div>
        </Link>
        <a href="/portal" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          marginTop: 10, fontSize: 11, fontWeight: 700, color: C.orange,
          textDecoration: "none", opacity: 0.8,
        }}>
          ← Back to Portal
        </a>
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
            {adminLinks.map(l => (
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
      {/* ── Desktop sidebar ── */}
      <div className="ge-sidebar-desktop">
        {sidebar}
      </div>

      {/* ── Mobile top bar ── */}
      <div className="ge-mobile-only" style={{
        position: "sticky", top: 0, zIndex: 40,
        background: C.navy,
        borderBottom: `1px solid rgba(255,255,255,0.08)`,
        padding: "0 16px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/goal-engine/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height: 30, width: "auto" }} />
          <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 9, width: "auto", opacity: 0.7 }} />
        </Link>
        <a href="/portal" style={{
          fontSize: 11, fontWeight: 700, color: C.orange,
          textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
        }}>
          ← Portal
        </a>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="ge-mobile-only" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        background: C.white,
        borderTop: `1px solid ${C.line}`,
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {primaryTabs.map(tab => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "8px 4px 6px", textDecoration: "none",
              color: active ? C.orange : C.muted,
              transition: "color .15s",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, marginTop: 3, letterSpacing: ".02em" }}>{tab.label}</span>
            </Link>
          );
        })}
        {/* More tab */}
        <button onClick={() => setMoreOpen(true)} style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "8px 4px 6px",
          background: "none", border: "none", cursor: "pointer",
          color: C.muted, fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
          <span style={{ fontSize: 9, fontWeight: 700, marginTop: 3 }}>More</span>
        </button>
      </div>

      {/* ── More sheet (slide-up) ── */}
      {moreOpen && (
        <div className="ge-mobile-only" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: C.white, borderRadius: "20px 20px 0 0",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
            maxHeight: "75vh", overflowY: "auto",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.line }} />
            </div>

            {/* User row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 16px", borderBottom: `1px solid ${C.line}` }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.orange}`, flexShrink: 0 }} />
              ) : (
                <span style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900, color: "#fff",
                  background: `linear-gradient(135deg,#FF9847,${C.orange})`,
                }}>
                  <Initials name={fullName} />
                </span>
              )}
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.ink }}>{fullName}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  {isAdmin ? "Admin" : "Loan Officer"}
                </p>
              </div>
            </div>

            {/* More links */}
            <div style={{ padding: "8px 12px" }}>
              {moreLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMoreOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 10px", borderRadius: 12, textDecoration: "none",
                  color: isActive(l.href) ? C.orange : C.ink,
                  background: isActive(l.href) ? C.activeBg : "transparent",
                  fontWeight: 600, fontSize: 14,
                }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{l.icon}</span>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div style={{ padding: "4px 12px 0", borderTop: `1px solid ${C.line}`, marginTop: 4 }}>
              <a href="/portal" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 10px", borderRadius: 12, textDecoration: "none",
                color: C.orange, fontWeight: 700, fontSize: 14,
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>←</span>
                Back to Portal
              </a>
              <button onClick={signOut} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 10px", width: "100%", borderRadius: 12,
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", fontWeight: 700, fontSize: 14, fontFamily: "inherit",
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>⏻</span>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ge-sidebar-desktop { display: flex; }
        .ge-mobile-only     { display: none !important; }
        @media (max-width: 768px) {
          .ge-sidebar-desktop { display: none !important; }
          .ge-mobile-only     { display: flex !important; }
        }
      `}</style>
    </>
  );
}
