import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin, isUniversityTrainer } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Admin layout — uses getVerifiedProfile() (server-validated token) because
// all child routes are privileged. Trainers may access course management pages;
// admin-only pages (reports, users, compliance) enforce additional role checks
// at the page level via isUniversityAdmin().
export default async function UniversityAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin");

  if (!isUniversityAdmin(profile) && !isUniversityTrainer(profile)) {
    redirect("/university");
  }

  return <>{children}</>;
}
