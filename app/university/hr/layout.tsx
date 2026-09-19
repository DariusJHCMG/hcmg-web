import { redirect } from "next/navigation";
import { getVerifiedProfile, hasUniversityAccess, isUniversityAdmin } from "@/lib/auth";
import { UniversityLayoutClient } from "@/components/university/UniversityLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | HR Overview",
  robots: { index: false, follow: false },
};

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const profile = await getVerifiedProfile();

  if (!profile) redirect("/login?next=/university/hr");
  if (!hasUniversityAccess(profile)) redirect("/university");
  if (!isUniversityAdmin(profile)) redirect("/university");

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
