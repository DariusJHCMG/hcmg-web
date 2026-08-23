import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue, canAccessHelpDeskQueue, canAccessLockDeskQueue } from "@/lib/auth";
import { LiftOffNav } from "@/components/liftoff/LiftOffNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lift Off — HCMG",
  robots: { index: false, follow: false },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const init  = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return init.toUpperCase();
}

export default async function LiftOffLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff");

  const isAdmin        = profile.role === "admin" || profile.role === "developer";
  const isQueueUser    = canAccessLiftOffQueue(profile);
  const isHelpDeskUser = canAccessHelpDeskQueue(profile);
  const isLockDeskUser = canAccessLockDeskQueue(profile);

  return (
    <div className="min-h-screen bg-sand">
      {/* Left sidebar */}
      <LiftOffNav
        isAdmin={isAdmin}
        isQueueUser={isQueueUser}
        isHelpDeskUser={isHelpDeskUser}
        isLockDeskUser={isLockDeskUser}
        firstName={profile.full_name.split(" ")[0]}
        initials={getInitials(profile.full_name)}
        avatarUrl={profile.avatar_url ?? null}
        portalHref={isAdmin ? "/admin" : "/portal"}
      />

      {/* Main content — offset by sidebar width */}
      <main className="ml-56 min-h-screen py-8 px-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
