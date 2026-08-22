import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue, canSeeLockRequests, canSeeGeneralRequests, getLiftOffRoleLabel } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffQueueClient } from "@/components/liftoff/LiftOffQueueClient";

export const dynamic = "force-dynamic";

// ── Demo data ──────────────────────────────────────────────────────────────────
const now  = new Date();
const mins = (n: number) => new Date(now.getTime() - n * 60_000).toISOString();

const DEMO_REQUESTS: LiftOffRequest[] = [
  {
    id: "demo-lock-1",
    created_at: mins(8),
    updated_at: mins(8),
    submitter_id: "demo-lo-1",
    submitter_name: "Sarah Mitchell",
    submitter_nmls: "1234567",
    submitter_email: "sarah.mitchell@demo.com",
    submitter_phone: "(702) 555-0182",
    request_type: "lock_request",
    request_status: "pending",
    arive_loan_number: "HCMG-2025-4471",
    carried_forward_ids: null,
    loan_type: "purchase",
    loan_amount: 485000,
    purchase_price: 545000,
    borrower_first_name: "Marcus",
    borrower_last_name: "Thompson",
    co_borrower_first_name: "Tanya",
    co_borrower_last_name: "Thompson",
    property_address: "412 Lakeside Blvd",
    property_city: "Las Vegas",
    property_state: "NV",
    property_zip: "89120",
    property_type: "sfr",
    occupancy_type: "primary",
    target_close_date: "2025-09-30",
    lock_status: null,
    float_reason: null,
    income_note: null, property_note: null, assets_note: null, credit_note: null,
    special_instructions: null, loan_goal: null, matches_1003: null,
    matches_1003_changes: null, gift_funds_present: null,
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: false, submission_requested_at: null, team_notes: null,
    doc_checklist_json: null, suspense_reason: null, suspense_notes: null,
    reason_fixed: null,
    wire_lender: null, wire_lender_loan_number: null, wire_branch: null,
    wire_closing_date: null, wire_lock_date: null, wire_lock_exp_date: null,
    wire_disbursement_date: null, wire_settlement_agent_name: null,
    wire_settlement_agent_email: null, wire_balanced_with_title: null,
    wire_final_cd_key: null, wire_final_cd_name: null, wire_approvals_json: null,
    wire_outcome: null, wire_expires_at: null, wire_requestor_email: null,
    adverse_reason: null, adverse_notes: null, adverse_outcome: null,
    adverse_withdraw_from_portal: null, adverse_leader_attempted_resell: null,
    adverse_open_appraisal_order: null, adverse_appraisal_disposition: null,
    lock_requested_rate: 6.875,
    lock_requested_price: 99.5,
    lock_requested_apr: 7.024,
    lock_requested_monthly_pmt: 3185,
    lock_requested_lender: "UWM",
    lock_requested_product: "30-Yr Fixed Conventional",
    lock_requested_loan_amount: 485000,
    lock_requested_loan_type: "purchase",
    lock_period_days: 30,
    lock_requested_close_date: "2025-09-30",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(8),
    lock_pricing_age_minutes: 12,
    lock_lo_notes: "Rush — client has rate expiry today. Please lock ASAP.",
    lock_confirmed_rate: null, lock_confirmed_price: null, lock_confirmed_apr: null,
    lock_confirmed_lock_period: null, lock_confirmed_lock_date: null,
    lock_confirmed_exp_date: null, lock_confirmation_number: null,
    lock_confirmed_lender: null, lock_desk_notes: null,
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 90,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null,
    certified_at: mins(8), certified_by_name: "Sarah Mitchell",
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
  },
  {
    id: "demo-lock-2",
    created_at: mins(25),
    updated_at: mins(18),
    submitter_id: "demo-lo-2",
    submitter_name: "James Rivera",
    submitter_nmls: "2345678",
    submitter_email: "james.rivera@demo.com",
    submitter_phone: "(702) 555-0247",
    request_type: "lock_request",
    request_status: "in_review",
    arive_loan_number: "HCMG-2025-4468",
    carried_forward_ids: null,
    loan_type: "refinance",
    loan_amount: 320000,
    purchase_price: null,
    borrower_first_name: "Patricia",
    borrower_last_name: "Okafor",
    co_borrower_first_name: null, co_borrower_last_name: null,
    property_address: "881 Desert Rose Ave",
    property_city: "Henderson",
    property_state: "NV",
    property_zip: "89002",
    property_type: "sfr",
    occupancy_type: "primary",
    target_close_date: "2025-10-15",
    lock_status: null, float_reason: null,
    income_note: null, property_note: null, assets_note: null, credit_note: null,
    special_instructions: null, loan_goal: null, matches_1003: null,
    matches_1003_changes: null, gift_funds_present: null,
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: false, submission_requested_at: null, team_notes: null,
    doc_checklist_json: null, suspense_reason: null, suspense_notes: null,
    reason_fixed: null,
    wire_lender: null, wire_lender_loan_number: null, wire_branch: null,
    wire_closing_date: null, wire_lock_date: null, wire_lock_exp_date: null,
    wire_disbursement_date: null, wire_settlement_agent_name: null,
    wire_settlement_agent_email: null, wire_balanced_with_title: null,
    wire_final_cd_key: null, wire_final_cd_name: null, wire_approvals_json: null,
    wire_outcome: null, wire_expires_at: null, wire_requestor_email: null,
    adverse_reason: null, adverse_notes: null, adverse_outcome: null,
    adverse_withdraw_from_portal: null, adverse_leader_attempted_resell: null,
    adverse_open_appraisal_order: null, adverse_appraisal_disposition: null,
    lock_requested_rate: 7.125,
    lock_requested_price: 100.25,
    lock_requested_apr: 7.31,
    lock_requested_monthly_pmt: 2156,
    lock_requested_lender: "Rocket",
    lock_requested_product: "30-Yr Fixed FHA",
    lock_requested_loan_amount: 320000,
    lock_requested_loan_type: "refinance",
    lock_period_days: 45,
    lock_requested_close_date: "2025-10-15",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(25),
    lock_pricing_age_minutes: 7,
    lock_lo_notes: null,
    lock_confirmed_rate: null, lock_confirmed_price: null, lock_confirmed_apr: null,
    lock_confirmed_lock_period: null, lock_confirmed_lock_date: null,
    lock_confirmed_exp_date: null, lock_confirmation_number: null,
    lock_confirmed_lender: null, lock_desk_notes: null,
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 50,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null,
    certified_at: mins(25), certified_by_name: "James Rivera",
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    claimed_by_id: "demo-proc-1",
    claimed_by_name: "Demo Processor",
    claimed_at: mins(18),
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
  },
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
    loan_type: "purchase_fha",
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
    doc_checklist_json: [
      { label: "1003 Application", checked: true },
      { label: "Credit Report", checked: true },
      { label: "Purchase Agreement", checked: true },
      { label: "HOI Binder", checked: true },
      { label: "Title Order", checked: false },
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
    arive_lookup_raw: null, arive_looked_up_at: null,
    certified_at: mins(45), certified_by_name: "Keisha Brown",
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
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
    loan_type: "purchase",
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
    doc_checklist_json: [
      { label: "1003 Application", checked: true },
      { label: "Credit Report", checked: true },
      { label: "W-2s (2 years)", checked: true },
      { label: "Paystubs (30-day)", checked: true },
      { label: "Tax Returns (2 years)", checked: true },
      { label: "Purchase Agreement", checked: true },
      { label: "HOI Binder", checked: true },
      { label: "Bank Statements (2 months)", checked: true },
      { label: "Title Order", checked: true },
      { label: "Appraisal", checked: false },
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
    arive_lookup_raw: null, arive_looked_up_at: null,
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
  },
];

// ── Real data fetch ────────────────────────────────────────────────────────────

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

  const showLock    = isDemo || canSeeLockRequests(profile);
  const showGeneral = isDemo || canSeeGeneralRequests(profile);
  const requests    = isDemo
    ? DEMO_REQUESTS
    : await getQueueRequests(showLock, showGeneral);

  const roleLabel = isDemo
    ? "Demo Mode"
    : getLiftOffRoleLabel(profile.liftoff_roles);

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
              Showing 4 realistic requests: 2 lock desk + 1 register + 1 submission.
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
        processorName={isDemo ? "Demo User" : profile.full_name}
        isDemo={isDemo}
      />
    </div>
  );
}
