import { redirect } from "next/navigation";
import { getCurrentProfile, hasUniversityAccess, isUniversityManager } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Manager",
  robots: { index: false, follow: false },
};

// Manager layout — auth guard only.
// UniversityLayoutClient (sidebar + top bar) is already applied by app/university/layout.tsx.
export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login?next=/university/manager");
  if (!hasUniversityAccess(profile)) redirect("/university");
  if (!isUniversityManager(profile)) redirect("/university");

  return <>{children}</>;
}
