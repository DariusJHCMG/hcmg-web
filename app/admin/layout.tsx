import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Link from "next/link";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  // If no profile, sign them out cleanly rather than redirect loop
  if (!profile) redirect("/api/admin/signout");
  if (!isAdmin(profile)) redirect("/portal");

  return (
    <div className="flex min-h-screen bg-sand">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-line bg-white px-6">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted/60">
              Signed in as{" "}
              <span className="font-semibold text-ink">{profile.full_name}</span>
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: profile.role === "developer" ? "#f0f4ff" : "#fff7ed",
                color: profile.role === "developer" ? "#3b4fd8" : "#c45213",
              }}
            >
              {profile.role}
            </span>
            {/* Avatar chip — links to My Profile */}
            <Link href="/admin/profile" className="group ml-1 flex items-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-8 w-8 rounded-full object-cover object-top border border-line
                             ring-2 ring-transparent transition-all group-hover:ring-accent/40"
                />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white
                             ring-2 ring-transparent transition-all group-hover:ring-accent/40"
                  style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
                >
                  <Initials name={profile.full_name} />
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
