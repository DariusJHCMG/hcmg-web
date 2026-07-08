import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { ProfileEditor } from "@/app/portal/profile/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">My Account</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Update your photo, bio, and contact info. These appear inside the portal — not on the public Team page.
        </p>
      </div>
      <ProfileEditor profile={profile} />
    </div>
  );
}
