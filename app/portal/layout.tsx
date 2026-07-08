import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import { OrangeKeyLogo } from "@/components/ui/OrangeKeyLogo";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalPing } from "@/components/portal/PortalPing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG Portal",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HCMG",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#142850",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin" || profile.role === "developer") redirect("/admin");

  return (
    <div className="min-h-screen bg-sand">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-shell flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/portal">
              <OrangeKeyLogo variant="primary-light" size={44} />
            </Link>
            {/* Desktop nav links — hidden on mobile */}
            <nav className="hidden items-center gap-1 lg:flex">
              <Link href="/portal"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                Dashboard
              </Link>
              <Link href="/portal/analytics"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                Analytics
              </Link>
              <Link href="/portal/funnels"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                My Funnels
              </Link>
              <Link href="/portal/co-branded"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                Co-Branded
              </Link>
              <Link href="/portal/profile"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                My Profile
              </Link>
              <Link href="/portal/mobile-app"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                Mobile App
              </Link>
            </nav>
          </div>

          {/* Right side — avatar + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/portal/profile" className="flex items-center gap-2.5 group">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-8 w-8 rounded-full object-cover object-top border border-line shadow-sm
                             ring-2 ring-transparent transition-all group-hover:ring-accent/40"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white
                                 ring-2 ring-transparent transition-all group-hover:ring-accent/40"
                      style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                  <Initials name={profile.full_name} />
                </span>
              )}
              <span className="hidden text-sm font-semibold text-ink group-hover:text-accent transition-colors sm:block">
                {profile.full_name.split(" ")[0]}
              </span>
            </Link>
            <span className="hidden rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 sm:block">
              Loan Officer
            </span>
            <a href="/api/admin/signout"
               className="hidden text-xs font-semibold text-muted hover:text-red-600 transition-colors lg:block">
              Sign out
            </a>
            {/* Mobile hamburger — visible below lg */}
            <PortalMobileNav fullName={profile.full_name} />
          </div>
        </div>
      </header>

      <main className="container-shell max-w-5xl py-6 md:py-8">
        <PortalPing />
        {children}
      </main>
    </div>
  );
}
