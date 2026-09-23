import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { StartingNowReferral } from "@/lib/database.types";
import type { Metadata } from "next";
import { StartingNowSlideOverTrigger } from "@/components/liftoff/StartingNowSlideOverTrigger";
import { StartingNowAdminSwitcher } from "@/components/liftoff/StartingNowAdminSwitcher";

export const metadata: Metadata = { title: "Starting Now Referrals — HCMG Lift Off" };
export const dynamic = "force-dynamic";

// ── Status badge styles ───────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  "Attempting Contact":   "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Follow Up":            "bg-blue-50 text-blue-700 border-blue-200",
  "Enrolled":             "bg-green-50 text-green-700 border-green-200",
  "Milestone Reached":    "bg-green-50 text-green-700 border-green-200",
  "Goal Reached":         "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Hold":              "bg-orange-50 text-orange-700 border-orange-200",
  "Evaluation Completed": "bg-purple-50 text-purple-700 border-purple-200",
  "Not Interested":       "bg-gray-50 text-gray-500 border-gray-200",
  "Consumer Unreachable": "bg-gray-50 text-gray-500 border-gray-200",
  "Invalid Number":       "bg-gray-50 text-gray-500 border-gray-200",
  "Closed":               "bg-gray-50 text-gray-500 border-gray-200",
};

const SEND_FAIL_STYLE = "bg-red-50 text-red-700 border-red-200";

function statusStyle(referral: StartingNowReferral): string {
  if (referral.send_status === "failed" && !referral.current_status) return SEND_FAIL_STYLE;
  if (referral.current_status && STATUS_STYLES[referral.current_status]) {
    return STATUS_STYLES[referral.current_status];
  }
  return "bg-sand text-muted border-line";
}

function statusLabel(referral: StartingNowReferral): string {
  if (referral.send_status === "failed" && !referral.current_status) return "Send Failed";
  if (referral.send_status === "pending" && !referral.current_status) return "Pending Send";
  return referral.current_status ?? "Awaiting Update";
}

export default async function StartingNowPage({
  searchParams,
}: {
  searchParams: Promise<{ lo?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/liftoff-login?next=/liftoff/starting-now");

  const isAdmin = profile.role === "admin" || profile.role === "developer";
  const sp = await searchParams;

  // ── Determine whose referrals to show ────────────────────────
  // Non-admins: ALWAYS their own — ignore any ?lo= param entirely
  // Admins: their own by default, or a specific LO via ?lo=<id>
  const viewingId: string = isAdmin && sp.lo ? sp.lo : profile.id;

  const sb = createServiceClient();

  // ── Fetch referrals — always scoped to exactly one user ───────
  // Hard rule: non-admins can NEVER see another user's referrals.
  // Even if someone manually appends ?lo= to the URL, viewingId
  // above is forced to profile.id for non-admins.
  const { data: referralsRaw } = await sb
    .from("starting_now_referrals")
    .select("*")
    .eq("submitter_id", viewingId)
    .order("created_at", { ascending: false });

  const referrals = (referralsRaw ?? []) as StartingNowReferral[];

  // ── Fetch LO list for admin switcher ─────────────────────────
  let loList: { id: string; full_name: string }[] = [];
  if (isAdmin) {
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, full_name")
      .eq("role", "loan_officer")
      .eq("is_active", true)
      .order("full_name");
    loList = (profiles ?? []) as { id: string; full_name: string }[];
  }

  // ── Viewing label ─────────────────────────────────────────────
  const isViewingOwn  = viewingId === profile.id;
  const viewingName   = isViewingOwn
    ? null
    : loList.find(l => l.id === viewingId)?.full_name ?? "Unknown LO";

  const stats = {
    total:   referrals.length,
    sent:    referrals.filter(r => r.send_status === "sent").length,
    active:  referrals.filter(r => r.current_status && ["Enrolled", "Attempting Contact", "Follow Up", "Milestone Reached", "On Hold"].includes(r.current_status)).length,
    goal:    referrals.filter(r => r.current_status === "Goal Reached").length,
    failed:  referrals.filter(r => r.send_status === "failed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <StartingNowSlideOverTrigger>
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Starting Now Referrals</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isViewingOwn
              ? "Credit repair referrals you have sent to Starting Now Corporation."
              : `Viewing referrals submitted by ${viewingName}.`}
          </p>
        </div>
      </StartingNowSlideOverTrigger>

      {/* Admin LO switcher */}
      {isAdmin && (
        <div className="rounded-2xl border border-line bg-white px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted/60 mb-3">
            Admin View Controls
          </p>
          <StartingNowAdminSwitcher
            myId={profile.id}
            los={loList}
            currentLoId={isViewingOwn ? null : viewingId}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: "Total",        value: stats.total },
          { label: "Sent",         value: stats.sent },
          { label: "Active",       value: stats.active },
          { label: "Goal Reached", value: stats.goal },
          { label: "Send Failed",  value: stats.failed },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/70">{s.label}</p>
            <p className="mt-2 text-3xl font-extrabold ok-gradient-text">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-ink">Referrals</h2>
            <p className="text-xs text-muted">
              {referrals.length} total
              {!isViewingOwn && viewingName ? ` — ${viewingName}` : ""}
            </p>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-3">🛠️</p>
            <p className="font-bold text-ink mb-1">No referrals yet</p>
            <p className="text-sm text-muted mb-6">
              {isViewingOwn
                ? "Submit a Credit Repair Referral to send a borrower to Starting Now."
                : `${viewingName ?? "This LO"} has not submitted any Starting Now referrals yet.`}
            </p>
            {isViewingOwn && (
              <Link href="/liftoff/new"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                New Referral Request
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Borrower</th>
                  <th className="px-5 py-3 text-left">ARIVE #</th>
                  <th className="px-5 py-3 text-left">Sent</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Credit Scores</th>
                  <th className="px-5 py-3 text-left">Follow-up</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(r => {
                  const hasScores = r.experian || r.equifax || r.transunion;
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-ink">
                        {r.borrower_first_name} {r.borrower_last_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted">
                        {r.arive_loan_number ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {r.sent_at
                          ? new Date(r.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })
                          : <span className="text-muted/50">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${statusStyle(r)}`}>
                          {statusLabel(r)}
                        </span>
                        {r.send_status === "failed" && r.send_error && (
                          <p className="text-[10px] text-red-500 mt-0.5 max-w-[160px] truncate" title={r.send_error}>
                            {r.send_error}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {hasScores ? (
                          <span className="font-mono">
                            {r.experian   ? `EX ${r.experian}`   : ""}
                            {r.experian   && (r.equifax || r.transunion) ? " · " : ""}
                            {r.equifax    ? `EQ ${r.equifax}`    : ""}
                            {r.equifax    && r.transunion ? " · " : ""}
                            {r.transunion ? `TU ${r.transunion}` : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">
                        {r.follow_up_date
                          ? new Date(r.follow_up_date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
                          : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {r.lift_off_request_id ? (
                          <Link href={`/liftoff/${r.lift_off_request_id}`}
                            className="text-xs font-bold text-accent hover:underline">
                            View →
                          </Link>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit score privacy notice */}
      <div className="rounded-xl border border-line bg-sand px-5 py-3">
        <p className="text-xs text-muted">
          <span className="font-semibold text-ink">🔒 Credit Score Privacy:</span>{" "}
          Experian, Equifax, and TransUnion scores are provided by Starting Now and are visible
          to the referring loan officer and HCMG administrators only. These scores are never
          included in email notifications per HCMG NPI handling policy.
        </p>
      </div>
    </div>
  );
}
