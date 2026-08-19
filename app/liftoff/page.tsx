import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { LiftOffRequest } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  register_disclosure:   "Register + Disclosure",
  disclosure_only:       "Disclosure Only",
  submission:            "Submission",
  restructure_suspense:  "Restructure / Suspense",
  wire_request:          "Wire Request",
  adverse:               "Adverse",
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
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
