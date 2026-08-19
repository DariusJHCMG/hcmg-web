import { redirect, notFound } from "next/navigation";
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
  const query = sb.from("lift_off_requests").select("*").eq("id", id);
  if (!isAdmin) query.eq("submitter_id", userId);
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

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

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

      {/* Return note */}
      {request.request_status === "action_needed" && request.return_reason && (
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
          <Row label="Submitted"         value={fmt(request.created_at)} />
          <Row label="Type"              value={TYPE_LABELS[request.request_type]} />
          <Row label="ARIVE Loan #"      value={request.arive_loan_number} />
          <Row label="Loan Type"         value={request.loan_type} />
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
            <Row label="Address"   value={request.property_address} />
            <Row label="City"      value={request.property_city} />
            <Row label="State"     value={request.property_state} />
            <Row label="ZIP"       value={request.property_zip} />
          </div>
        </div>
      )}

      {/* Notes */}
      {(request.income_note || request.property_note || request.assets_note || request.credit_note || request.special_instructions) && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">File Notes</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Income"             value={request.income_note} />
            <Row label="Property"           value={request.property_note} />
            <Row label="Assets"             value={request.assets_note} />
            <Row label="Credit"             value={request.credit_note} />
            <Row label="Special Instructions" value={request.special_instructions} />
          </div>
        </div>
      )}

      {/* Restructure */}
      {request.request_type === "restructure_suspense" && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-sand">
            <h2 className="font-bold text-ink text-sm">Restructure / Suspense</h2>
          </div>
          <div className="px-6 py-2">
            <Row label="Reason"         value={request.suspense_reason} />
            <Row label="Has Solution"   value={request.reason_fixed == null ? null : request.reason_fixed ? "Yes" : "No"} />
            <Row label="Notes"          value={request.suspense_notes} />
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
            <Row label="Assigned To"     value={request.assigned_processor_name} />
            <Row label="Processor Email" value={request.assigned_processor_email} />
            <Row label="Assigned At"     value={fmt(request.assigned_at)} />
            <Row label="Registered At"   value={fmt(request.registered_at)} />
            {request.team_notes && <Row label="Ops Notes" value={<span className="whitespace-pre-wrap">{request.team_notes}</span>} />}
          </div>
        </div>
      )}
    </div>
  );
}
