import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { PortalFunnelLibrary } from "@/app/portal/funnels/PortalFunnelLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMyFunnelsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.lo_slug) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-2xl font-extrabold text-ink">My Funnel Library</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">No loan officer slug set on your account.</p>
          <p className="mt-1">
            Go to <strong>Users</strong>, edit your profile, and make sure your LO slug is set.
            Once set, run the funnel backfill in <strong>Dev Tools</strong> to generate your links.
          </p>
        </div>
      </div>
    );
  }

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");

  return (
    <PortalFunnelLibrary
      loSlug={profile.lo_slug}
      loName={profile.full_name}
      siteUrl={SITE}
    />
  );
}
