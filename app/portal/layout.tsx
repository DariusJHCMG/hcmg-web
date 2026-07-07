import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import { OrangeKeyLogo } from "@/components/ui/OrangeKeyLogo";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  // Admins don't use the portal
  if (profile.role === "admin" || profile.role === "developer") redirect("/admin");

  return (
    <div className="min-h-screen bg-sand">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-shell flex h-14 items-center justify-between">
          <Link href="/portal">
            <OrangeKeyLogo variant="primary-light" size={44} />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-ink">{profile.full_name}</span>
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">Loan Officer</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container-shell max-w-5xl py-8">
        {children}
      </main>
    </div>
  );
}

function SignOutButton() {
  // Client-side only — we use a small inline client component trick
  return (
    <a href="/api/admin/signout" className="text-xs font-semibold text-muted hover:text-red-600 transition-colors">
      Sign out
    </a>
  );
}
