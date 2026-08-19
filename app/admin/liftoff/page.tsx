import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffAdminActions } from "@/components/liftoff/LiftOffAdminActions";

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

async function getAllRequests(): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("lift_off_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as LiftOffRequest[];
}

export default async function AdminLiftOffPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin" && profile.role !== "developer") redirect("/liftoff");

  const requests = await getAllRequests();

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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-xs font-bold text-muted hover:text-accent">Admin</Link>
          <span className="text-muted/40 text-xs">/</span>
          <span className="text-xs font-bold text-ink">Lift Off Queue</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink">Lift Off — Ops Queue</h1>
        <p className="text-sm text-muted mt-0.5">All requests across all loan officers.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: "Total",         value: stats.total },
          { label: "Pending",       value: stats.pending,      highlight: stats.pending > 0 },
          { label: "In Review",     value: stats.inReview },
          { label: "Action Needed", value: stats.actionNeeded, highlight: stats.actionNeeded > 0 },
          { label: "Completed",     value: stats.completed },
        ].map(s => (
          <div key={s.label}
            className={`rounded-2xl border p-5 ${s.highlight ? "border-orange-300 bg-orange-50" : "border-line bg-white"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/70">{s.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${s.highlight ? "text-orange-600" : "ok-gradient-text"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Queue */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-bold text-ink">All Requests</h2>
          <p className="text-xs text-muted">{requests.length} total · newest first</p>
        </div>
        {requests.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted/60">No requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Borrower</th>
                  <th className="px-5 py-3 text-left">LO</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">ARIVE #</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Submitted</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-ink">
                      <Link href={`/liftoff/${r.id}`} className="hover:text-accent transition-colors">
                        {r.borrower_first_name} {r.borrower_last_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      <div>{r.submitter_name}</div>
                      {r.submitter_nmls && <div className="text-muted/60">NMLS# {r.submitter_nmls}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">{TYPE_LABELS[r.request_type] ?? r.request_type}</td>
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
                      <LiftOffAdminActions requestId={r.id} currentStatus={r.request_status} />
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
