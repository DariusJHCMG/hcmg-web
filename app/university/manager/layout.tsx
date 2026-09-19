import { redirect } from "next/navigation";
import { getCurrentProfile, hasUniversityAccess, isUniversityManager } from "@/lib/auth";
import { UniversityLayoutClient } from "@/components/university/UniversityLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Manager",
  robots: { index: false, follow: false },
};

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login?next=/university/manager");
  if (!hasUniversityAccess(profile)) redirect("/university");
  if (!isUniversityManager(profile)) redirect("/university");

  return (
    <UniversityLayoutClient
      profileName={profile.full_name}
      profileAvatar={profile.avatar_url}
      universityRole={profile.university_role}
    >
      {children}
    </UniversityLayoutClient>
  );
}
