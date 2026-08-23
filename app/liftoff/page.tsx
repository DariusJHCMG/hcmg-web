import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { LiftOffRequest } from "@/lib/database.types";
import { LockDeskHoursCard } from "@/components/liftoff/LockDeskHoursCard";
import { LiftOffSLACard } from "@/components/liftoff/LiftOffSLACard";

const TYPE_ICONS: Record<string, string> = {
  register_disclosure: "📋",
  disclosure_only:     "📄",
  submission:          "🚀",
  loan_help_desk:      "🛎",
  lock_request:        "🔒",
};

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  register_disclosure: "Register + Disclosure",
  disclosure_only:     "Disclosure Only",
  submission:          "Submission",
  loan_help_desk:      "Loan Help Desk",
  wire_request:        "Wire Request",
  adverse:             "Adverse",
  lock_request:        "Lock Desk Request",
};

const STATUS_STYLES: Record<string, string> = {
  pending:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_review:     "bg-blue-50 text-blue-700 border-blue-200",
  action_needed: "bg-orange-50 text-orange-700 border-orange-200",
  completed:     "bg-green-50 text-green-700 border-green-200",
  cancelled:     "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:       "Pending",
  in_review:     "In Review",
  action_needed: "Action Needed",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

async function getMyRequests(submitterId: string): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("submitter_id", submitterId)
    .order("created_at", { ascending: false });
  return (data ?? []) as LiftOffRequest[];
}

export default async function LiftOffDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff");

  const isAdmin   = profile.role === "admin" || profile.role === "developer";
  const requests  = await getMyRequests(profile.id);

  const actionNeededRequests = requests.filter(r => r.request_status === "action_needed");

  const stats = {
    total:        requests.length,
    pending:      requests.filter(r => r.request_status === "pending").length,
    inReview:     requests.filter(r => r.request_status === "in_review").length,
    actionNeeded: requests.filter(r => r.request_status === "action_needed").length,
    completed:    requests.filter(r => r.request_status === "completed").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Lift Off</h1>
          <p className="mt-0.5 text-sm text-muted">Hi {profile.full_name.split(" ")[0]} — here are your requests.</p>
        </div>
        <Link href="/liftoff/new"
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
          + New Request
        </Link>
      </div>

      {/* Info cards — hours + SLA */}
      <div className="grid gap-4 sm:grid-cols-2">
        <LockDeskHoursCard />
        <LiftOffSLACard />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: "Total",         value: stats.total },
          { label: "Pending",       value: stats.pending },
          { label: "In Review",     value: stats.inReview },
          { label: "Action Needed", value: stats.actionNeeded },
          { label: "Completed",     value: stats.completed },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/70">{s.label}</p>
            <p className="mt-2 text-3xl font-extrabold ok-gradient-text">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Needs Attention section ── */}
      {actionNeededRequests.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-red-700">⚠️ Needs Attention</h2>
              <span className="rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[11px] font-black text-red-700">
                {actionNeededRequests.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted -mt-2">
            The following requests were returned by the ops team and require your action before they can be processed.
          </p>

          <div className="space-y-3">
            {actionNeededRequests.map(r => {
              const reasons = Array.isArray(r.incomplete_reasons) ? (r.incomplete_reasons as string[]) : [];
              return (
                <div key={r.id}
                  className="rounded-2xl border-l-4 border-red-500 border border-red-200 bg-white p-5 space-y-3">
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[r.request_type] ?? "📁"}</span>
                      <div>
                        <p className="font-bold text-ink text-sm">
                          {r.borrower_first_name} {r.borrower_last_name}
                          {r.co_borrower_first_name && (
                            <span className="ml-1 font-normal text-muted text-xs">+ {r.co_borrower_first_name}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted">{TYPE_LABELS[r.request_type] ?? r.request_type}</p>
                        {r.arive_loan_number && (
                          <p className="text-[11px] font-mono text-muted/60">{r.arive_loan_number}</p>
                        )}
                      </div>
                    </div>
                    {r.incomplete_at && (
                      <p className="text-[11px] text-muted flex-shrink-0 text-right">
                        Returned {new Date(r.incomplete_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}
                        {r.incomplete_by_name && <><br /><span className="font-semibold text-ink">by {r.incomplete_by_name}</span></>}
                      </p>
                    )}
                  </div>

                  {/* Incomplete reasons */}
                  {reasons.length > 0 && (
                    <ul className="space-y-1">
                      {reasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-orange-800">
                          <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Team notes callout */}
                  {r.incomplete_notes && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700 mb-1">Notes from the team</p>
                      <p className="text-xs text-orange-900 whitespace-pre-wrap">{r.incomplete_notes}</p>
                    </div>
                  )}

                  {/* CTA */}
                  <div>
                    <Link href={`/liftoff/${r.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                      Review &amp; Fix →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-xl border border-line bg-white px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-muted">You have admin access.</p>
          <Link href="/admin/liftoff"
            className="text-sm font-bold text-accent hover:underline">
            View full ops queue →
          </Link>
        </div>
      )}

      {/* Requests table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-bold text-ink">My Requests</h2>
          <p className="text-xs text-muted">{requests.length} total</p>
        </div>
        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-4xl mb-3">🚀</p>
            <p className="font-bold text-ink mb-1">No requests yet</p>
            <p className="text-sm text-muted mb-6">Submit your first Lift Off request to get started.</p>
            <Link href="/liftoff/new"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              Submit a Request
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Borrower</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">ARIVE #</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Submitted</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-ink">
                      {r.borrower_first_name} {r.borrower_last_name}
                      {r.co_borrower_first_name && (
                        <span className="ml-1 text-xs text-muted font-normal">+ {r.co_borrower_first_name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{TYPE_LABELS[r.request_type] ?? r.request_type}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted">{r.arive_loan_number ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${STATUS_STYLES[r.request_status] ?? ""}`}>
                        {STATUS_LABELS[r.request_status] ?? r.request_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/liftoff/${r.id}`}
                        className="text-xs font-bold text-accent hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
