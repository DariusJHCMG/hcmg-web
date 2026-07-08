import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { ProfileEditor } from "./ProfileEditor";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">My Account</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Update your photo, bio, and contact info. These are used inside the portal and on your personal funnel page.
        </p>
      </div>

      <ProfileEditor profile={profile} />
    </div>
  );
}
