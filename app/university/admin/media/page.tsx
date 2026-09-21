import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import MediaLibrary from "@/components/university/studio/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) redirect("/university");

  return (
    <div style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <MediaLibrary />
    </div>
  );
}
