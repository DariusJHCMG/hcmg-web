import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue, canSeeLockRequests, canSeeGeneralRequests } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffQueueClient } from "@/components/liftoff/LiftOffQueueClient";

export const dynamic = "force-dynamic";

async function getQueueRequests(
  showLock: boolean,
  showGeneral: boolean,
): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("lift_off_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as LiftOffRequest[];

  return rows.filter(r => {
    if (r.request_type === "lock_request") return showLock;
    return showGeneral;
  });
}

export default async function LiftOffQueuePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff/queue");
  if (!canAccessLiftOffQueue(profile)) redirect("/liftoff");

  const showLock    = canSeeLockRequests(profile);
  const showGeneral = canSeeGeneralRequests(profile);
  const requests    = await getQueueRequests(showLock, showGeneral);

  const roleLabel = profile.liftoff_role === "lock_desk_admin"
    ? "Lock Desk Admin"
    : profile.liftoff_role === "liftoff_team"
    ? "Lift Off Team"
    : "Lift Off Admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Ops Queue</h1>
          <p className="mt-0.5 text-sm text-muted">
            {showLock && showGeneral && "All request types"}
            {showLock && !showGeneral && "Lock requests only"}
            {!showLock && showGeneral && "Processing requests only"}
            {" "}· {roleLabel}
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted">
          {requests.length} total
        </span>
      </div>

      <LiftOffQueueClient
        initialRequests={requests}
        processorName={profile.full_name}
      />
    </div>
  );
}
