"use client";

import { useState } from "react";
import { PortalSidebar, PortalMobileDrawer } from "@/components/portal/PortalSidebar";

interface Props {
  children: React.ReactNode;
  topBar: React.ReactNode;
}

export function PortalLayoutClient({ children, topBar }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-sand">
      {/* Desktop sidebar */}
      <PortalSidebar />

      {/* Mobile drawer */}
      {mobileOpen && <PortalMobileDrawer onClose={() => setMobileOpen(false)} />}

      {/* Right column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {/* Desktop left placeholder */}
          <div className="hidden lg:block" />
          {/* Right content (avatar, role badge, etc.) */}
          {topBar}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
