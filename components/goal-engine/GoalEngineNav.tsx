"use client";

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

const LO_NAV = [
  { label: "Dashboard",   href: "/goal-engine/dashboard"  },
  { label: "My Slice",    href: "/goal-engine/commit"      },
  { label: "Leaderboard", href: "/goal-engine/leaderboard" },
];
const ADMIN_NAV = [
  { label: "Dashboard",    href: "/goal-engine/dashboard"       },
  { label: "Leaderboard",  href: "/goal-engine/leaderboard"     },
  { label: "Manage Goals", href: "/goal-engine/admin"           },
  { label: "Manager View", href: "/goal-engine/admin/dashboard" },
  { label: "🧪 Test Panel", href: "/goal-engine/admin/test"     },
];

function Initials({ name }: { name: string }) {
  return <>{name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</>;
}

export function GoalEngineNav({ fullName, role, avatarUrl }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin  = role === "admin" || role === "developer";
  const navLinks = isAdmin ? ADMIN_NAV : LO_NAV;

  async function signOut() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    window.location.href = "/goal-engine-login";
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm" style={{ borderBottom: "3px solid #F37021" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex h-20 items-center justify-between gap-6">

        {/* SLICE logo — big, clear, no ghost */}
        <Link href="/goal-engine/dashboard" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none", flexShrink:0 }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height: 64, width: "auto", display:"block", imageRendering:"auto" }} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F37021", lineHeight:1 }}>by</span>
            <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 16, width: "auto", display:"block" }} />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navLinks.map(l => {
            const active = pathname === l.href || (l.href !== "/goal-engine/dashboard" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150 ${
                  active
                    ? "bg-[#F37021] text-white shadow-sm"
                    : "text-[#1A2B42] hover:bg-orange-50 hover:text-[#F37021]"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName}
                className="h-9 w-9 rounded-full object-cover object-top border-2 border-[#F37021]" />
            ) : (
              <span className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-[#F37021]"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                <Initials name={fullName} />
              </span>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#1A2B42] leading-tight">{fullName.split(" ")[0]}</p>
              <p className="text-[10px] font-bold text-[#F37021] uppercase tracking-wider leading-tight">
                {isAdmin ? "Admin" : "Loan Officer"}
              </p>
            </div>
          </div>

          <button onClick={signOut}
            className="hidden lg:block text-xs font-bold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red-300">
            Sign out
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border-2 border-gray-200 text-[#1A2B42]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {open
                ? <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                : <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#F37021]">
              <div className="flex items-center gap-2">
                <img src="/SLICE.png" alt="SLICE" style={{ height: 44, width: "auto" }} />
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#F37021" }}>by</span>
                  <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height: 13, width: "auto" }} />
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#1A2B42]">✕</button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1">
              {navLinks.map(l => {
                const active = pathname === l.href || (l.href !== "/goal-engine/dashboard" && pathname.startsWith(l.href));
                return (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      active ? "bg-[#F37021] text-white" : "text-[#1A2B42] hover:bg-orange-50 hover:text-[#F37021]"
                    }`}>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 py-5 border-t border-gray-100">
              <button onClick={signOut} className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50">
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
