import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import { OrangeKeyLogo } from "@/components/ui/OrangeKeyLogo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lift Off — HCMG",
  robots: { index: false, follow: false },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init  = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export default async function LiftOffLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff");

  const isAdmin = profile.role === "admin" || profile.role === "developer";

  return (
    <div className="min-h-screen bg-sand">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-shell flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/liftoff">
              <OrangeKeyLogo variant="primary-light" size={44} />
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              <span className="text-xs font-black uppercase tracking-[0.2em] ok-gradient-text">
                Lift Off
              </span>
            </div>
            <nav className="hidden items-center gap-1 lg:flex ml-4">
              <Link href="/liftoff"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                My Requests
              </Link>
              <Link href="/liftoff/new"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                + New Request
              </Link>
              {isAdmin && (
                <Link href="/admin/liftoff"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink">
                  Admin Queue
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/liftoff/new"
              className="lg:hidden flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              + New
            </Link>
            <Link href={isAdmin ? "/admin" : "/portal"} className="flex items-center gap-2.5 group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name}
                  className="h-8 w-8 rounded-full object-cover object-top border border-line shadow-sm
                             ring-2 ring-transparent transition-all group-hover:ring-accent/40" />
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
            <a href="/api/admin/signout"
               className="hidden text-xs font-semibold text-muted hover:text-red-600 transition-colors lg:block">
              Sign out
            </a>
          </div>
        </div>
      </header>

      <main className="container-shell max-w-5xl py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
