import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  canAccessLiftOffQueue,
  getLiftOffRoleLabel,
  canSeeLockRequests,
  canSeeGeneralRequests,
} from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { LiftOffRequest } from "@/lib/database.types";
import { LiftOffSLATrackerClient } from "@/components/liftoff/LiftOffSLATrackerClient";
import { addBusinessHours, SLA_WINDOWS } from "@/lib/liftoff-sla";

export const dynamic = "force-dynamic";

// ── Demo data (same 7 requests as pipeline page) ──────────────────────────────
const now  = new Date();
const mins = (n: number) => new Date(now.getTime() - n * 60_000).toISOString();
const slaDeadline = (requestType: keyof typeof SLA_WINDOWS, submittedMinsAgo: number) =>
  addBusinessHours(new Date(now.getTime() - submittedMinsAgo * 60_000), SLA_WINDOWS[requestType]).toISOString();

const DEMO_VIEWER_ID   = "demo-proc-1";
const DEMO_VIEWER_NAME = "Alex Chen";

function demoBase(overrides: Partial<LiftOffRequest>): LiftOffRequest {
  return {
    id: "", created_at: mins(30), updated_at: mins(30),
    submitter_id: "demo-lo-1", submitter_name: "Demo LO", submitter_nmls: "1234567",
    submitter_email: "demo@hcmg.com", submitter_phone: null,
    request_type: "submission", request_status: "pending",
    arive_loan_number: null, carried_forward_ids: null,
    loan_type: "purchase", loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 400000, purchase_price: 450000,
    borrower_first_name: "Demo", borrower_last_name: "Borrower",
    co_borrower_first_name: null, co_borrower_last_name: null,
    property_address: "123 Main St", property_city: "Las Vegas",
    property_state: "NV", property_zip: "89101",
    property_type: "sfr", occupancy_type: "primary",
    target_close_date: "2025-10-31",
    lock_status: null, float_reason: null,
    income_note: null, property_note: null, assets_note: null, credit_note: null,
    special_instructions: null, loan_goal: null,
    matches_1003: null, matches_1003_changes: null, gift_funds_present: null,
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: true, submission_requested_at: mins(30), team_notes: null,
    doc_checklist_json: null, suspense_reason: null, suspense_notes: null, reason_fixed: null,
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
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 50,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null,
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    certified_at: mins(30), certified_by_name: "Demo LO",
    claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
    ...overrides,
  };
}

const DEMO_REQUESTS: LiftOffRequest[] = [
  // Lock — pending, no claim yet
  demoBase({ id: "demo-p-lock-1", request_type: "lock_request", request_status: "pending", submitter_name: "Sarah Mitchell", borrower_first_name: "Marcus", borrower_last_name: "Thompson", arive_loan_number: "HCMG-2025-4471", loan_type: "purchase", loan_amount: 485000, priority_score: 140, sla_deadline_at: slaDeadline("lock_request", 45), sla_severity: "warning", created_at: mins(45), updated_at: mins(45), certified_at: mins(45) }),
  // Lock — in review, Alex claimed + started
  demoBase({ id: "demo-p-lock-2", request_type: "lock_request", request_status: "in_review", submitter_name: "James Rivera", borrower_first_name: "Patricia", borrower_last_name: "Okafor", arive_loan_number: "HCMG-2025-4468", loan_type: "refinance", loan_amount: 320000, priority_score: 120, sla_deadline_at: slaDeadline("lock_request", 20), sla_severity: "normal", created_at: mins(20), updated_at: mins(15), certified_at: mins(20), claimed_by_id: DEMO_VIEWER_ID, claimed_by_name: DEMO_VIEWER_NAME, claimed_at: mins(15), started_at: mins(12) }),
  // Register — pending, unclaimed
  demoBase({ id: "demo-p-reg-1", request_type: "register_disclosure", request_status: "pending", submitter_name: "Keisha Brown", borrower_first_name: "DeShawn", borrower_last_name: "Williams", arive_loan_number: "HCMG-2025-4465", loan_type: "purchase_fha", loan_amount: 295000, priority_score: 80, sla_deadline_at: slaDeadline("register_disclosure", 30), sla_severity: "normal", created_at: mins(30), updated_at: mins(30), certified_at: mins(30), lock_status: "locked" }),
  // Submission — in review, Jordan claimed + started
  demoBase({ id: "demo-p-sub-1", request_type: "submission", request_status: "in_review", submitter_name: "Tony Marchetti", borrower_first_name: "Ethan", borrower_last_name: "Goldstein", arive_loan_number: "HCMG-2025-4460", loan_type: "purchase", loan_amount: 720000, priority_score: 90, sla_deadline_at: slaDeadline("submission", 1440), sla_severity: "warning", created_at: mins(1440), updated_at: mins(40), certified_at: mins(1440), claimed_by_id: "demo-proc-2", claimed_by_name: "Jordan Patel", claimed_at: mins(1380), started_at: mins(40) }),
  // Submission — action_needed / sent back by Jordan (SLA critical → BREACHED)
  demoBase({ id: "demo-p-sub-2", request_type: "submission", request_status: "action_needed", submitter_name: "Carla Nguyen", borrower_first_name: "Robert", borrower_last_name: "Kim", arive_loan_number: "HCMG-2025-4455", loan_type: "refinance", loan_amount: 380000, priority_score: 110, sla_deadline_at: slaDeadline("submission", 2880), sla_severity: "critical", created_at: mins(2880), updated_at: mins(200), certified_at: mins(2880), claimed_by_id: "demo-proc-2", claimed_by_name: "Jordan Patel", claimed_at: mins(2870), started_at: mins(2800), incomplete_reasons: ["Missing W-2s", "Bank statements incomplete"], incomplete_notes: "Need last 2 months bank statements and both years W-2s.", incomplete_at: mins(200), incomplete_by_name: "Jordan Patel" }),
  // Disclosure — completed on time by Alex (SLA MET)
  demoBase({ id: "demo-p-disc-1", request_type: "disclosure_only", request_status: "completed", submitter_name: "Mike Torres", borrower_first_name: "Linda", borrower_last_name: "Nguyen", arive_loan_number: "HCMG-2025-4450", loan_type: "purchase", loan_amount: 260000, priority_score: 70, sla_deadline_at: slaDeadline("disclosure_only", 480), sla_severity: "normal", created_at: mins(480), updated_at: mins(5), certified_at: mins(480), claimed_by_id: DEMO_VIEWER_ID, claimed_by_name: DEMO_VIEWER_NAME, claimed_at: mins(470), started_at: mins(460), completed_at: mins(5), completed_email_sent_at: mins(5) }),
  // Lock — action_needed, SLA BREACHED
  demoBase({ id: "demo-p-lock-3", request_type: "lock_request", request_status: "action_needed", submitter_name: "Diana Wallace", borrower_first_name: "James", borrower_last_name: "Cho", arive_loan_number: "HCMG-2025-4448", loan_type: "purchase", loan_amount: 510000, priority_score: 130, sla_deadline_at: slaDeadline("lock_request", 75), sla_severity: "critical", created_at: mins(75), updated_at: mins(50), certified_at: mins(75), claimed_by_id: DEMO_VIEWER_ID, claimed_by_name: DEMO_VIEWER_NAME, claimed_at: mins(70), started_at: mins(68), incomplete_reasons: ["Pricing confirmation expired"], incomplete_at: mins(50), incomplete_by_name: DEMO_VIEWER_NAME }),
];

// ── Real data fetch ────────────────────────────────────────────────────────────
async function getSLARequests(lockOnly: boolean): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  let query = sb
    .from("lift_off_requests")
    .select("*")
    .not("request_status", "eq", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (lockOnly) query = query.eq("request_type", "lock_request");

  const { data } = await query;
  return (data ?? []) as LiftOffRequest[];
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function LiftOffSLAPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const sp     = await searchParams;
  const isDemo = sp.demo === "1";

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff/pipeline/sla");

  if (!isDemo && !canAccessLiftOffQueue(profile)) redirect("/liftoff");

  const isAdmin  = profile.role === "admin" || profile.role === "developer";
  const roles    = profile.liftoff_roles;

  const isSelfOnly = !isDemo && !isAdmin &&
    !roles.includes("liftoff_admin") &&
    !roles.includes("ops_manager") &&
    !roles.includes("lock_desk_admin") &&
    roles.includes("liftoff_team");

  const lockOnly = !isDemo && !isAdmin &&
    !roles.includes("liftoff_admin") &&
    !roles.includes("ops_manager") &&
    roles.includes("lock_desk_admin");

  const canSeeAll = isDemo || isAdmin ||
    roles.includes("liftoff_admin") ||
    roles.includes("ops_manager") ||
    roles.includes("lock_desk_admin");

  const viewerId   = isDemo ? DEMO_VIEWER_ID   : profile.id;
  const viewerName = isDemo ? DEMO_VIEWER_NAME : profile.full_name;
  const roleLabel  = isDemo ? "Demo Mode"      : getLiftOffRoleLabel(roles);

  const showLock    = isDemo || canSeeLockRequests(profile);
  const showGeneral = isDemo || canSeeGeneralRequests(profile);
  if (!isDemo && !showLock && !showGeneral) redirect("/liftoff");

  const allRequests = isDemo ? DEMO_REQUESTS : await getSLARequests(lockOnly);
  const requests = isDemo ? allRequests : allRequests.filter(r => {
    if (r.request_type === "lock_request") return showLock;
    return showGeneral;
  });

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🎭</span>
          <div>
            <p className="font-bold text-purple-800 text-sm">Demo Mode — SLA Tracker</p>
            <p className="text-xs text-purple-700 mt-0.5">
              Logged in as <strong>{viewerName}</strong>. Showing 7 demo requests with realistic timestamps.
              Toggle Mine / Everyone to see scoped performance.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">SLA Tracker</h1>
          <p className="mt-0.5 text-sm text-muted">
            Performance by timestamp · {roleLabel}
            {lockOnly && <span className="ml-2 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">Lock Requests Only</span>}
            {isSelfOnly && <span className="ml-2 rounded-full bg-sand border border-line px-2 py-0.5 text-[10px] font-semibold text-muted">Your Queue</span>}
          </p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted">
          {requests.length} requests
        </span>
      </div>

      <LiftOffSLATrackerClient
        initialRequests={requests}
        isDemo={isDemo}
        viewerId={viewerId}
        viewerName={viewerName}
        isSelfOnly={isSelfOnly}
        canSeeAll={canSeeAll}
        lockOnly={lockOnly}
      />
    </div>
  );
}
