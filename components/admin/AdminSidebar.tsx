"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { OrangeKeyLogo } from "@/components/ui/OrangeKeyLogo";

const NAV = [
  { label: "Dashboard",   href: "/admin",              icon: "⊞" },
  { label: "Analytics",   href: "/admin/analytics",    icon: "📊" },
  { label: "Leads",       href: "/admin/leads",        icon: "✉" },
  { label: "Reviews",     href: "/admin/reviews",      icon: "⭐" },
  { label: "Users",       href: "/admin/users",        icon: "👥" },
  { label: "My Funnels",  href: "/admin/my-funnels",   icon: "🔗" },
  { label: "Co-Branded",  href: "/admin/co-branded",   icon: "🤝" },
  { label: "Mobile App",  href: "/admin/mobile-app",   icon: "📱" },
  { label: "Settings",    href: "/admin/settings",     icon: "⚙" },
  { label: "Audit Log",   href: "/admin/audit",        icon: "📋" },
  { label: "Dev Tools",   href: "/admin/dev",          icon: "🛠" },
  { label: "My Profile",  href: "/admin/profile",      icon: "👤" },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-line px-5 py-5">
        <Link href="/admin" onClick={onNavClick}>
          <OrangeKeyLogo variant="primary-light" size={48} />
        </Link>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted/60">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-line px-3 py-4 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-sand hover:text-ink transition-colors"
        >
          <span className="text-base">↗</span> View Site
        </Link>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          <span className="text-base">⏻</span> {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

/** Desktop-only sidebar (hidden on mobile via the parent layout) */
export function AdminSidebar() {
  return (
    <aside className="hidden h-screen w-56 flex-shrink-0 flex-col border-r border-line bg-white lg:flex">
      <SidebarContent />
    </aside>
  );
}

/** Mobile overlay drawer — rendered by AdminLayoutClient when open */
export function AdminMobileDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-white shadow-xl lg:hidden">
        <SidebarContent onNavClick={onClose} />
      </aside>
    </>
  );
}
