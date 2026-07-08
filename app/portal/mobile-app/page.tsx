import { getCurrentProfile } from "@/lib/auth";
import MobileAppClient from "./MobileAppClient";

export default async function MobileAppPage() {
  const profile = await getCurrentProfile();
  // Portal layout already redirects unauthenticated users — profile is always present here.
  const defaultEmail = profile?.notify_email ?? profile?.email ?? "";

  return <MobileAppClient defaultEmail={defaultEmail} />;
}
