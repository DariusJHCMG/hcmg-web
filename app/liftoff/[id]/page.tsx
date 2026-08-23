import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffResubmitPanel } from "@/components/liftoff/LiftOffResubmitPanel";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  register_disclosure: "Register + Disclosure",
  disclosure_only:     "Disclosure Only",
  submission:          "Submission",
  loan_help_desk:      "Loan Help Desk",
  lock_request:        "Lock Desk Request",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  sfr:          "Single Family Residence",
  condo:        "Condo",
  townhome:     "Townhome",
  "2_4_unit":   "2–4 Unit",
  manufactured: "Manufactured / Mobile",
  other:        "Other",
};

const OCCUPANCY_LABELS: Record<string, string> = {
  primary:    "Primary Residence",
  secondary:  "Second Home",
  investment: "Investment Property",
};

const STATUS_STYLES: Record<string, string> = {
  pending:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_review:     "bg-blue-50 text-blue-700 border-blue-200",
  action_needed: "bg-orange-50 text-orange-700 border-orange-200",
  completed:     "bg-green-50 text-green-700 border-green-200",
  cancelled:     "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending:       "Pending — Ops will pick this up shortly",
  in_review:     "In Review — Ops is working this",
  action_needed: "Action Needed — Check the notes and respond",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 border-b border-line py-3 last:border-0">
      <span className="w-44 flex-shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-muted/70">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

async function getRequest(id: string, userId: string, isAdmin: boolean): Promise<LiftOffRequest | null> {
  const sb = createServiceClient();
  let query = sb.from("lift_off_requests").select("*").eq("id", id);
  if (!isAdmin) query = query.eq("submitter_id", userId);
  const { data } = await query.single();
  return data as LiftOffRequest | null;
}

export default async function LiftOffDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const justSubmitted = sp.submitted === "1";
  const isAdmin = profile.role === "admin" || profile.role === "developer";

  const request = await getRequest(id, profile.id, isAdmin);
  if (!request) notFound();

  // Calendar dates (date-only DB fields — no time needed)
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      timeZone: "America/New_York",
    }) : null;

  // Timestamps — always show time in ET
  const fmtDateTime = (d: string | null) =>
    d ? new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
      timeZone: "America/New_York",
    }) + " ET" : null;

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {justSubmitted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-bold text-green-800">Lift Off request submitted!</p>
            <p className="text-sm text-green-700">The HCMG ops team has been notified and will pick this up shortly.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/liftoff" className="text-xs font-bold text-muted hover:text-accent">← My Requests</Link>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">
            {request.borrower_first_name} {request.borrower_last_name}
          </h1>
          <p className="text-sm text-muted">{TYPE_LABELS[request.request_type] ?? request.request_type}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${STATUS_STYLES[request.request_status] ?? ""}`}>
          {STATUS_LABELS[request.request_status] ?? request.request_status}
        </span>
      </div>

      {/* Resubmit panel — shown to LO when action_needed and no existing resubmission */}
      {request.request_status === "action_needed" &&
       !request.resubmission_of &&
       !request.has_resubmission && (
        <LiftOffResubmitPanel
          requestId={request.id}
          incompleteReasons={Array.isArray(request.incomplete_reasons) ? (request.incomplete_reasons as string[]) : []}
          incompleteNotes={request.incomplete_notes}
          submitterName={request.submitter_name}
        />
      )}

      {/* Has resubmission banner */}
      {request.has_resubmission && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 flex items-center gap-3">
          <span className="text-xl">↩</span>
          <div>
            <p className="font-bold text-blue-800 text-sm">Resubmission sent</p>
            <p className="text-xs text-blue-700">You have already resubmitted this request. It is back in the ops queue.</p>
          </div>
        </div>
      )}

      {/* Return note (legacy field) */}
      {request.request_status === "action_needed" && request.return_reason && !request.incomplete_reasons?.length && (
        <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-orange-700 mb-1">Action Required</p>
          <p className="text-sm text-ink">{request.return_reason}</p>
        </div>
      )}

      {/* Loan overview */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand">
          <h2 className="font-bold text-ink text-sm">Request Details</h2>
        </div>
        <div className="px-6 py-2">
          <Row label="Request ID"       value={<code className="font-mono text-xs">{request.id}</code>} />
          <Row label="Submitted"         value={fmtDateTime(request.created_at)} />
          <Row label="Type"              value={TYPE_LABELS[request.request_type]} />
          <Row label="ARIVE Loan #"      value={request.arive_loan_number} />
          <Row label="Loan Purpose"      value={request.loan_purpose} />
          <Row label="Loan Program"      value={request.loan_program} />
          <Row label="Loan Amount"       value={request.loan_amount ? `$${request.loan_amount.toLocaleString()}` : null} />
          <Row label="Purchase Price"    value={request.purchase_price ? `$${request.purchase_price.toLocaleString()}` : null} />
          <Row label="Lock Status"       value={request.lock_status} />
          <Row label="Float Reason"      value={request.float_reason} />
          <Row label="Target Close"      value={fmt(request.target_close_date)} />
        </div>
      </div>

      {/* Borrower */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 bg-sand">
          <h2 className="font-bold text-ink text-sm">Borrower</h2>
        </div>
        <div className="px-6 py-2">
          <Row label="Borrower"          value={`${request.borrower_first_name} ${request.borrower_last_name}`} />
          {request.co_borrower_first_name && (
            <Row label="Co-Borrower"     value={`${request.co_borrower_first_name} ${request.co_borrower_last_name ?? ""}`} />
          )}
        </div>
      </div>

      {/* Property */}
      {(request.property_address || request.property_city) && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">Property</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Address"        value={request.property_address} />
            <Row label="City"           value={request.property_city} />
            <Row label="State"          value={request.property_state} />
            <Row label="ZIP"            value={request.property_zip} />
            <Row label="Property Type"  value={request.property_type ? (PROPERTY_TYPE_LABELS[request.property_type] ?? request.property_type) : null} />
            <Row label="Occupancy"      value={request.occupancy_type ? (OCCUPANCY_LABELS[request.occupancy_type] ?? request.occupancy_type) : null} />
          </div>
        </div>
      )}

      {/* IPAC Notes */}
      {(request.income_note || request.property_note || request.assets_note || request.credit_note || request.special_instructions) && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">IPAC Notes</h2>
            <p className="text-[11px] text-muted mt-0.5">Income · Property · Assets · Credit</p>
          </div>
          <div className="px-6 py-2">
            <Row label="I — Income"           value={request.income_note} />
            <Row label="P — Property"         value={request.property_note} />
            <Row label="A — Assets"           value={request.assets_note} />
            <Row label="C — Credit"           value={request.credit_note} />
            <Row label="Special Instructions" value={request.special_instructions} />
          </div>
        </div>
      )}

      {/* Document Checklist */}
      {Array.isArray(request.doc_checklist_json) && request.doc_checklist_json.some(d => d.checked) && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand flex items-center justify-between">
            <h2 className="font-bold text-ink text-sm">Document Checklist</h2>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
              request.doc_checklist_json.every(d => d.checked)
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}>
              {request.doc_checklist_json.filter(d => d.checked).length} of {request.doc_checklist_json.length} in file
            </span>
          </div>
          <div className="px-6 py-4 space-y-2">
            {request.doc_checklist_json.map((doc, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                doc.checked ? "border-green-200 bg-green-50" : "border-line bg-sand"
              }`}>
                <span className={`flex-shrink-0 text-sm ${doc.checked ? "text-green-600" : "text-muted/40"}`}>
                  {doc.checked ? "✓" : "○"}
                </span>
                <span className={`flex-1 text-sm font-semibold ${doc.checked ? "text-green-800" : "text-muted"}`}>
                  {doc.label}
                </span>
                {doc.checked ? (
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">In File</span>
                ) : (
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide border border-orange-200 bg-orange-50 rounded-full px-2 py-0.5">
                    PENDING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lock Desk Request */}
      {request.request_type === "lock_request" && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">Lock Request — Pricing Snapshot</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Channel"
              value={request.channel_type
                ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    request.channel_type.toLowerCase() === "broker"
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>{request.channel_type}</span>
                : null} />
            {request.channel_type?.toLowerCase() === "broker" && request.compensation_type && (
              <Row label="Compensation"
                value={<span className="rounded-full px-2.5 py-0.5 text-xs font-bold border bg-amber-50 border-amber-200 text-amber-700">{request.compensation_type}</span>} />
            )}
            <Row label="Rate"
              value={request.lock_requested_rate != null ? `${request.lock_requested_rate}%` : null} />
            <Row label="Discount Points"
              value={request.lock_requested_price != null ? String(request.lock_requested_price) : null} />
            <Row label="Lender"        value={request.lock_requested_lender} />
            <Row label="Product"       value={request.lock_requested_product} />
            <Row label="Lock Period"
              value={request.lock_period_days != null ? `${request.lock_period_days} days` : null} />
            <Row label="Requested Close" value={fmt(request.lock_requested_close_date)} />
            <Row label="Notes to Lock Desk" value={request.lock_lo_notes} />
          </div>
        </div>
      )}

      {/* Lock Desk — Confirmed Lock (ops-filled) */}
      {request.request_type === "lock_request" && request.lock_confirmed_rate != null && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand flex items-center justify-between">
            <h2 className="font-bold text-ink text-sm">Confirmed Lock</h2>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">
              LOCKED
            </span>
          </div>
          <div className="px-6 py-2">
            <Row label="Confirmed Rate"
              value={request.lock_confirmed_rate != null ? `${request.lock_confirmed_rate}%` : null} />
            <Row label="Confirmed Price"
              value={request.lock_confirmed_price != null ? String(request.lock_confirmed_price) : null} />
            <Row label="Confirmed APR"
              value={request.lock_confirmed_apr != null ? `${request.lock_confirmed_apr}%` : null} />
            <Row label="Lock Period"
              value={request.lock_confirmed_lock_period != null
                ? `${request.lock_confirmed_lock_period} days`
                : null} />
            <Row label="Lock Date"       value={fmt(request.lock_confirmed_lock_date)} />
            <Row label="Expiration Date" value={fmt(request.lock_confirmed_exp_date)} />
            <Row label="Confirmation #"  value={request.lock_confirmation_number} />
            <Row label="Lender"          value={request.lock_confirmed_lender} />
            {request.lock_desk_notes && (
              <Row label="Lock Desk Notes"
                value={<span className="whitespace-pre-wrap">{request.lock_desk_notes}</span>} />
            )}
          </div>
        </div>
      )}

      {/* Loan Help Desk */}
      {request.request_type === "loan_help_desk" && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">🛎 Loan Help Desk</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Sub-Type"    value={request.help_desk_sub_type} />
            <Row label="Description" value={
              request.help_desk_description
                ? <span className="whitespace-pre-wrap">{request.help_desk_description}</span>
                : null
            } />
          </div>
        </div>
      )}

      {/* Ops info (admin-visible or if assigned) */}
      {(isAdmin || request.assigned_processor_name) && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">Processing</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Stage"           value={request.stage} />
            <Row label="Assigned To"     value={request.assigned_processor_name} />
            <Row label="Processor Email" value={request.assigned_processor_email} />
            <Row label="Assigned At"     value={fmtDateTime(request.assigned_at)} />
            <Row label="Registered At"   value={fmtDateTime(request.registered_at)} />
            <Row label="SLA Deadline"    value={fmtDateTime(request.sla_deadline_at)} />
            {request.team_notes && <Row label="Ops Notes" value={<span className="whitespace-pre-wrap">{request.team_notes}</span>} />}
          </div>
        </div>
      )}
    </div>
  );
}
