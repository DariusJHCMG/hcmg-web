import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue, canSeeGeneralRequests, getLiftOffRoleLabel, canAssignRequests, canAccessHelpDeskQueue, isOpsManager } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffQueueClient } from "@/components/liftoff/LiftOffQueueClient";
import { LookupButton } from "@/components/liftoff/LookupButton";

export const dynamic = "force-dynamic";

// ── Demo data ──────────────────────────────────────────────────────────────────
const now  = new Date();
const mins = (n: number) => new Date(now.getTime() - n * 60_000).toISOString();

const DEMO_REQUESTS: LiftOffRequest[] = [
  {
    id: "demo-reg-1",
    created_at: mins(45),
    updated_at: mins(45),
    submitter_id: "demo-lo-3",
    submitter_name: "Keisha Brown",
    submitter_nmls: "3456789",
    submitter_email: "keisha.brown@demo.com",
    submitter_phone: "(702) 555-0391",
    request_type: "register_disclosure",
    request_status: "pending",
    arive_loan_number: "HCMG-2025-4465",
    carried_forward_ids: null,
    loan_type: "purchase_fha", loan_purpose: "purchase", loan_program: "fha",
    loan_amount: 295000,
    purchase_price: 310000,
    borrower_first_name: "DeShawn",
    borrower_last_name: "Williams",
    co_borrower_first_name: "Aaliyah",
    co_borrower_last_name: "Williams",
    property_address: "2204 Sunrise Canyon Dr",
    property_city: "North Las Vegas",
    property_state: "NV",
    property_zip: "89031",
    property_type: "sfr",
    occupancy_type: "primary",
    target_close_date: "2025-10-01",
    lock_status: "locked", float_reason: null,
    income_note: "W2 employee, 2yr same employer (MGM), base $78K, YTD aligns.",
    property_note: "SFR, primary, appraised $315K, no conditions.",
    assets_note: "$22K Wells Fargo checking, 2 months SOA provided.",
    credit_note: "702 mid score, no derogatory, 3 open tradelines.",
    special_instructions: "First-time buyer — please prioritize disclosures.",
    loan_goal: "First home purchase for growing family.",
    matches_1003: true, matches_1003_changes: null, gift_funds_present: "no",
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: true, submission_requested_at: mins(45), team_notes: null,
    self_employed_borrower: false,
    doc_checklist_json: [
      { label: "Driver's License", checked: true },
      { label: "1003 — All sections completed in ARIVE", checked: true },
      { label: "Credit Report", checked: true },
      { label: "W-2s (2 years)", checked: true },
      { label: "Paystubs (30-day)", checked: false },
      { label: "Purchase Agreement", checked: true },
      { label: "Bank Statements (2 months)", checked: false },
    ],
    suspense_reason: null, suspense_notes: null, reason_fixed: null,
    wire_lender: null, wire_lender_loan_number: null, wire_branch: null,
    wire_closing_date: null, wire_lock_date: null, wire_lock_exp_date: null,
    wire_disbursement_date: null, wire_settlement_agent_name: null,
    wire_settlement_agent_email: null, wire_balanced_with_title: null,
    wire_final_cd_key: null, wire_final_cd_name: null, wire_approvals_json: null,
    wire_outcome: null, wire_expires_at: null, wire_requestor_email: null,
    adverse_reason: null, adverse_notes: null, adverse_outcome: null,
    adverse_withdraw_from_portal: null, adverse_leader_attempted_resell: null,
    adverse_open_appraisal_order: null, adverse_appraisal_disposition: null,
    lock_requested_rate: null, lock_requested_price: null, lock_requested_apr: null,
    lock_requested_monthly_pmt: null, lock_requested_lender: null,
    lock_requested_product: null, lock_requested_loan_amount: null,
    lock_requested_loan_type: null, lock_period_days: null,
    lock_requested_close_date: null, lock_pricing_confirmed_by_lo: false,
    lock_pricing_confirmed_at: null, lock_pricing_age_minutes: null,
    lock_lo_notes: null, lock_confirmed_rate: null, lock_confirmed_price: null,
    lock_confirmed_apr: null, lock_confirmed_lock_period: null,
    lock_confirmed_lock_date: null, lock_confirmed_exp_date: null,
    lock_confirmation_number: null, lock_confirmed_lender: null, lock_desk_notes: null,
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 60,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null, arive_deep_link: null,
    certified_at: mins(45), certified_by_name: "Keisha Brown",
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
    help_desk_sub_type: null, help_desk_description: null,
    channel_type: null, compensation_type: null,
    earnest_money_deposit: null, seller_credit: null,
  },
  {
    id: "demo-sub-1",
    created_at: mins(120),
    updated_at: mins(55),
    submitter_id: "demo-lo-4",
    submitter_name: "Tony Marchetti",
    submitter_nmls: "4567890",
    submitter_email: "tony.marchetti@demo.com",
    submitter_phone: "(702) 555-0418",
    request_type: "submission",
    request_status: "in_review",
    arive_loan_number: "HCMG-2025-4460",
    carried_forward_ids: null,
    loan_type: "purchase", loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 720000,
    purchase_price: 800000,
    borrower_first_name: "Ethan",
    borrower_last_name: "Goldstein",
    co_borrower_first_name: null, co_borrower_last_name: null,
    property_address: "5501 Regency Park Ct",
    property_city: "Summerlin",
    property_state: "NV",
    property_zip: "89135",
    property_type: "sfr",
    occupancy_type: "primary",
    target_close_date: "2025-10-20",
    lock_status: "locked", float_reason: null,
    income_note: "Self-employed, 2yr avg $210K net, S-Corp distributions confirmed.",
    property_note: "SFR, primary, appraised $825K. Clean title.",
    assets_note: "$185K Chase private banking, no large unexplained deposits.",
    credit_note: "748 mid, no derogatory, 6 tradelines, 7% utilization.",
    special_instructions: "Jumbo loan — confirm with UW before processing.",
    loan_goal: "Upgrading to larger home — relocation from LA.",
    matches_1003: true, matches_1003_changes: null, gift_funds_present: "no",
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: true, submission_requested_at: mins(120), team_notes: null,
    self_employed_borrower: true,
    doc_checklist_json: [
      { label: "Driver's License", checked: true },
      { label: "1003 — All sections completed in ARIVE", checked: true },
      { label: "Credit Report", checked: true },
      { label: "Tax Returns (2 years)", checked: true },
      { label: "Purchase Agreement", checked: true },
      { label: "Bank Statements (2 months)", checked: true, na: false, naNote: "" },
    ],
    suspense_reason: null, suspense_notes: null, reason_fixed: null,
    wire_lender: null, wire_lender_loan_number: null, wire_branch: null,
    wire_closing_date: null, wire_lock_date: null, wire_lock_exp_date: null,
    wire_disbursement_date: null, wire_settlement_agent_name: null,
    wire_settlement_agent_email: null, wire_balanced_with_title: null,
    wire_final_cd_key: null, wire_final_cd_name: null, wire_approvals_json: null,
    wire_outcome: null, wire_expires_at: null, wire_requestor_email: null,
    adverse_reason: null, adverse_notes: null, adverse_outcome: null,
    adverse_withdraw_from_portal: null, adverse_leader_attempted_resell: null,
    adverse_open_appraisal_order: null, adverse_appraisal_disposition: null,
    lock_requested_rate: null, lock_requested_price: null, lock_requested_apr: null,
    lock_requested_monthly_pmt: null, lock_requested_lender: null,
    lock_requested_product: null, lock_requested_loan_amount: null,
    lock_requested_loan_type: null, lock_period_days: null,
    lock_requested_close_date: null, lock_pricing_confirmed_by_lo: false,
    lock_pricing_confirmed_at: null, lock_pricing_age_minutes: null,
    lock_lo_notes: null, lock_confirmed_rate: null, lock_confirmed_price: null,
    lock_confirmed_apr: null, lock_confirmed_lock_period: null,
    lock_confirmed_lock_date: null, lock_confirmed_exp_date: null,
    lock_confirmation_number: null, lock_confirmed_lender: null, lock_desk_notes: null,
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 70,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null, arive_deep_link: null,
    certified_at: mins(120), certified_by_name: "Tony Marchetti",
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    claimed_by_id: "demo-proc-1",
    claimed_by_name: "Demo Processor",
    claimed_at: mins(55),
    started_at: mins(40),
    completed_at: null,
    inflight_email_sent_at: mins(40), completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
    help_desk_sub_type: null, help_desk_description: null,
    channel_type: null, compensation_type: null,
    earnest_money_deposit: null, seller_credit: null,
  },
];

// ── Real data fetch ────────────────────────────────────────────────────────────

async function getQueueRequests(): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("lift_off_requests")
    .select("*")
    .neq("request_type", "loan_help_desk")
    .neq("request_type", "lock_request")
    .eq("has_resubmission", false)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as LiftOffRequest[];
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function LiftOffQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const sp     = await searchParams;
  const isDemo = sp.demo === "1";

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff/queue");

  // Demo bypasses role check
  if (!isDemo && !canAccessLiftOffQueue(profile)) redirect("/liftoff");
  // Help-desk-only users have no access here — send them to their queue
  if (!isDemo && canAccessHelpDeskQueue(profile) && !canSeeGeneralRequests(profile)) redirect("/liftoff/helpdesk");

  const canAssign  = isDemo || canAssignRequests(profile);
  const canSeeAll  = isDemo || isOpsManager(profile) || profile.role === "admin" || profile.role === "developer";
  const isSelfOnly = !isDemo && !canSeeAll;
  const requests   = isDemo
    ? DEMO_REQUESTS
    : await getQueueRequests();

  const roleLabel   = isDemo ? "Demo Mode" : getLiftOffRoleLabel(profile.liftoff_roles);
  const viewerId    = isDemo ? "demo-proc-1" : profile.id;
  const viewerName  = isDemo ? "Demo User"   : profile.full_name;

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🎭</span>
          <div>
            <p className="font-bold text-purple-800 text-sm">Demo Mode — Ops Queue</p>
            <p className="text-xs text-purple-700 mt-0.5">
              All actions (Claim, Start, Complete) work in this demo — no database writes or emails will be sent.
              Showing 2 realistic requests: 1 register + 1 submission.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Ops Queue</h1>
          <p className="mt-0.5 text-sm text-muted">
            Processing requests · {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LookupButton context="ops" />
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted">
            {requests.length} total
          </span>
        </div>
      </div>

      <LiftOffQueueClient
        initialRequests={requests}
        processorName={viewerName}
        viewerId={viewerId}
        viewerName={viewerName}
        canSeeAll={canSeeAll}
        isSelfOnly={isSelfOnly}
        isDemo={isDemo}
        canAssign={canAssign}
      />
    </div>
  );
}
