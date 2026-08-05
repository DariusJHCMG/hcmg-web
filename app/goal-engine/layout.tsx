/**
 * /goal-engine layout — HCMG design system (white/navy/orange, matches existing portal)
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { GoalEngineNav } from "@/components/goal-engine/GoalEngineNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SLICE by HCMG",
  robots: { index: false, follow: false },
};

export default async function GoalEngineLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <GoalEngineNav
        fullName={profile.full_name}
        role={profile.role}
        avatarUrl={profile.avatar_url}
      />
      <main>
        {children}
      </main>
    </div>
  );
}
