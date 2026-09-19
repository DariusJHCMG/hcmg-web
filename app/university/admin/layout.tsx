import { redirect } from "next/navigation";
import { getCurrentProfile, isUniversityAdmin, isUniversityTrainer } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function UniversityAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/university/admin");

  if (!isUniversityAdmin(profile) && !isUniversityTrainer(profile)) {
    redirect("/university");
  }

  return <>{children}</>;
}
