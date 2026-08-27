import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";
import { PortalLayoutClient } from "@/components/portal/PortalLayoutClient";
import { PortalPing } from "@/components/portal/PortalPing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG Portal",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HCMG",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#142850",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const init = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <>{init.toUpperCase()}</>;
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin" || profile.role === "developer") redirect("/admin");

  const topBar = (
    <div className="flex items-center gap-3">
      <span className="hidden text-xs text-muted/60 sm:block">
        Signed in as{" "}
        <span className="font-semibold text-ink">{profile.full_name}</span>
      </span>
      <span className="hidden rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 sm:inline-flex">
        Loan Officer
      </span>
      <Link href="/portal/profile" className="group ml-1 flex items-center">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="h-8 w-8 rounded-full object-cover object-top border border-line
                       ring-2 ring-transparent transition-all group-hover:ring-accent/40"
          />
        ) : (
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white
                       ring-2 ring-transparent transition-all group-hover:ring-accent/40"
            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
          >
            <Initials name={profile.full_name} />
          </span>
        )}
      </Link>
    </div>
  );

  return (
    <PortalLayoutClient topBar={topBar}>
      <PortalPing />
      {children}
    </PortalLayoutClient>
  );
}
