"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationCenter } from "@/components/NotificationCenter";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}

export function LiftOffNav({
  isAdmin,
  isQueueUser,
  isHelpDeskUser,
  isLockDeskUser,
  firstName,
  initials,
  avatarUrl,
  portalHref,
}: {
  isAdmin:        boolean;
  isQueueUser:    boolean;
  isHelpDeskUser: boolean;
  isLockDeskUser: boolean;
  firstName:      string;
  initials:       string;
  avatarUrl:      string | null;
  portalHref:     string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/liftoff",          label: "Dashboard",       icon: "🏠", exact: true },
    { href: "/liftoff/new",      label: "New Request",      icon: "✨" },
    ...(isQueueUser     ? [{ href: "/liftoff/queue",    label: "Ops Queue",       icon: "📥" }] : []),
    ...(isHelpDeskUser  ? [{ href: "/liftoff/helpdesk", label: "Help Desk Queue", icon: "🛎" }] : []),
    ...(isLockDeskUser  ? [{ href: "/liftoff/lockdesk", label: "Lock Desk Queue", icon: "🔒" }] : []),
    ...(isQueueUser     ? [{ href: "/liftoff/pipeline", label: "Pipeline",        icon: "📊" }] : []),
    ...(isAdmin         ? [{ href: "/liftoff/users",    label: "Team & Roles",    icon: "👥" }] : []),
  ];

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  function isActiveHref(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  // ── Mobile bottom tabs ─────────────────────────────────────────────────────
  const primaryTabs: { label: string; href: string; icon: string; exact?: boolean }[] = [
    { label: "Home",    href: "/liftoff",     icon: "🏠", exact: true },
    { label: "New",     href: "/liftoff/new", icon: "✨" },
    { label: "History", href: "/liftoff",     icon: "📋", exact: true },
  ];
  if (isQueueUser) {
    primaryTabs.splice(2, 0, { label: "Queue", href: "/liftoff/queue", icon: "📥" });
  }

  // Links shown in the "More" sheet (secondary items)
  const moreNavItems = navItems.filter(i =>
    i.href !== "/liftoff" && i.href !== "/liftoff/new" && i.href !== "/liftoff/queue"
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="liftoff-sidebar fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-line bg-white">
        {/* Logo + wordmark + back link */}
          <div className="px-5 py-4 border-b border-line">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] ok-gradient-text leading-none">
                    Lift Off
                  </p>
                  <p className="text-[10px] text-muted/60 mt-0.5 leading-none">HCMG</p>
                </div>
              </div>
              <NotificationCenter />
            </div>
            <Link href={portalHref}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:opacity-80 transition-opacity">
              ← Back to Portal
            </Link>
          </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#142850] text-white"
                    : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                {item.label}
                {item.href === "/liftoff/new" && !active && (
                  <span className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-black text-white"
                    style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-line px-3 py-3 space-y-1">
          <Link href={portalHref}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-sand transition-colors group">
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName}
                className="h-7 w-7 rounded-full object-cover object-top border border-line flex-shrink-0" />
            ) : (
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                {initials}
              </span>
            )}
            <span className="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate">
              {firstName}
            </span>
          </Link>
          <a href="/api/admin/signout"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted hover:bg-red-50 hover:text-red-600 transition-colors">
            <span className="text-base w-5 text-center">↩</span>
            Sign out
          </a>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="liftoff-mobile-only" style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 16px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔑</span>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#F37021", textTransform: "uppercase", letterSpacing: ".15em", lineHeight: 1 }}>
              Lift Off
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 9, color: "#64748B", lineHeight: 1 }}>HCMG</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NotificationCenter />
          <a href={portalHref} style={{
            fontSize: 11, fontWeight: 700, color: "#F37021",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 3,
          }}>
            ← Portal
          </a>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div className="liftoff-mobile-only" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        background: "#fff",
        borderTop: "1px solid #E2E8F0",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {primaryTabs.map(tab => {
          const active = isActiveHref(tab.href, tab.exact);
          return (
            <Link key={tab.label} href={tab.href} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "8px 4px 6px", textDecoration: "none",
              color: active ? "#F37021" : "#64748B",
              transition: "color .15s",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1, position: "relative", display: "inline-block" }}>
                {tab.icon}
                {tab.href === "/liftoff/new" && (
                  <span style={{
                    position: "absolute", top: -3, right: -6,
                    width: 7, height: 7, borderRadius: "50%",
                    background: "#F37021", border: "1.5px solid #fff",
                  }} />
                )}
              </span>
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
          color: "#64748B", fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
          <span style={{ fontSize: 9, fontWeight: 700, marginTop: 3 }}>More</span>
        </button>
      </div>

      {/* ── More sheet ── */}
      {moreOpen && (
        <div className="liftoff-mobile-only" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }}
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "#fff", borderRadius: "20px 20px 0 0",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
            maxHeight: "75vh", overflowY: "auto",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E2E8F0" }} />
            </div>

            {/* User row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 16px", borderBottom: "1px solid #E2E8F0" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={firstName} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #F37021", flexShrink: 0 }} />
              ) : (
                <span style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 900, color: "#fff",
                  background: "linear-gradient(135deg,#FF9847,#F37021)",
                }}>
                  {initials}
                </span>
              )}
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1A2B42" }}>{firstName}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, fontWeight: 700, color: "#F37021", textTransform: "uppercase", letterSpacing: ".1em" }}>
                  Loan Officer
                </p>
              </div>
            </div>

            {/* Secondary nav links */}
            {moreNavItems.length > 0 && (
              <div style={{ padding: "8px 12px" }}>
                {moreNavItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 10px", borderRadius: 12, textDecoration: "none",
                    color: isActive(item) ? "#F37021" : "#1A2B42",
                    background: isActive(item) ? "rgba(243,112,33,0.08)" : "transparent",
                    fontWeight: 600, fontSize: 14,
                  }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: "4px 12px 0", borderTop: "1px solid #E2E8F0", marginTop: 4 }}>
              <a href={portalHref} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 10px", borderRadius: 12, textDecoration: "none",
                color: "#F37021", fontWeight: 700, fontSize: 14,
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>←</span>
                Back to Portal
              </a>
              <a href="/api/admin/signout" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 10px", borderRadius: 12, textDecoration: "none",
                color: "#ef4444", fontWeight: 700, fontSize: 14,
              }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>↩</span>
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .liftoff-sidebar     { display: flex; }
        .liftoff-mobile-only { display: none !important; }
        @media (max-width: 1024px) {
          .liftoff-sidebar     { display: none !important; }
          .liftoff-mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
