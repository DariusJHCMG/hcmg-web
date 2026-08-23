"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  firstName,
  initials,
  avatarUrl,
  portalHref,
}: {
  isAdmin:        boolean;
  isQueueUser:    boolean;
  isHelpDeskUser: boolean;
  firstName:      string;
  initials:       string;
  avatarUrl:      string | null;
  portalHref:     string;
}) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/liftoff",          label: "Dashboard",   icon: "🏠", exact: true },
    { href: "/liftoff/new",      label: "New Request",  icon: "✨" },
    ...(isQueueUser     ? [{ href: "/liftoff/queue",    label: "Ops Queue",   icon: "📥" }] : []),
    ...(isHelpDeskUser  ? [{ href: "/liftoff/helpdesk", label: "Help Desk",   icon: "🛎" }] : []),
    ...(isQueueUser     ? [{ href: "/liftoff/pipeline", label: "Pipeline",    icon: "📊" }] : []),
    ...(isAdmin         ? [{ href: "/liftoff/users",    label: "Team & Roles", icon: "👥" }] : []),
  ];

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-line bg-white">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-line">
        <span className="text-2xl">🔑</span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] ok-gradient-text leading-none">
            Lift Off
          </p>
          <p className="text-[10px] text-muted/60 mt-0.5 leading-none">HCMG</p>
        </div>
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
  );
}
