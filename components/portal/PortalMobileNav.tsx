"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Dashboard",   href: "/portal" },
  { label: "Analytics",   href: "/portal/analytics" },
  { label: "My Funnels",  href: "/portal/funnels" },
  { label: "Co-Branded",  href: "/portal/co-branded" },
  { label: "My Profile",  href: "/portal/profile" },
  { label: "Mobile App",  href: "/portal/mobile-app" },
];

export function PortalMobileNav({ fullName }: { fullName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink"
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {open ? (
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Backdrop + drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in drawer */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col bg-white shadow-xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-sm font-bold text-ink">
                Hi, {fullName.split(" ")[0]}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-ink transition-colors"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-sand hover:text-accent"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Sign out */}
            <div className="border-t border-line px-4 py-4">
              <a
                href="/api/admin/signout"
                className="flex items-center rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                Sign out
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
