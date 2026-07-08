import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { CoBrandedManager } from "@/app/portal/co-branded/CoBrandedManager";

export const dynamic = "force-dynamic";

export default async function AdminCoBrandedPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.lo_slug) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">Co-Branded Pages</h1>
        <p className="text-sm text-muted">
          Your account doesn&apos;t have a loan officer slug assigned yet. Contact an admin to set this up.
        </p>
      </div>
    );
  }

  return <CoBrandedManager loSlug={profile.lo_slug} loName={profile.full_name} />;
}
