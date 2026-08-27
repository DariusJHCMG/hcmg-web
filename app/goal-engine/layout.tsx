/**
 * /goal-engine layout — SLICE by HCMG
 * Left dock sidebar + main content area
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { GoalEngineNav } from "@/components/goal-engine/GoalEngineNav";
import { PwaInit } from "@/components/PwaInit";
import { PushPermission } from "@/components/PushPermission";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SLICE by HCMG",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  themeColor: "#142850",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HCMG",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#142850",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export default async function GoalEngineLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", overflowX: "hidden" }}>
      <PwaInit />
      <PushPermission />
      <GoalEngineNav
        fullName={profile.full_name}
        role={profile.role}
        avatarUrl={profile.avatar_url}
        profileId={profile.id}
      />
      <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }} className="ge-main">
        {children}
      </main>
      <style>{`
        /* Single source of truth — server-rendered, inline styles removed from client component */
        .ge-sidebar-desktop       { display: flex !important; }
        .ge-sidebar-desktop > nav { display: flex !important; }
        .ge-mobile-only           { display: none !important; }
        @media (max-width: 768px) {
          .ge-sidebar-desktop       { display: none !important; }
          .ge-sidebar-desktop > nav { display: none !important; }
          .ge-mobile-only           { display: flex !important; }
          .ge-main                  { padding-bottom: 72px; width: 100%; }
        }
      `}</style>
    </div>
  );
}
