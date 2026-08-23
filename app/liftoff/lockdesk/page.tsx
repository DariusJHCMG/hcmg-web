import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLockDeskQueue, canAssignRequests, getLiftOffRoleLabel, isOpsManager } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { LiftOffRequest } from "@/lib/database.types";
import { LockDeskQueueClient } from "@/components/liftoff/LockDeskQueueClient";
import { LookupButton } from "@/components/liftoff/LookupButton";

export const dynamic = "force-dynamic";

// ── Demo data ──────────────────────────────────────────────────────────────────
const now  = new Date();
const mins = (n: number) => new Date(now.getTime() - n * 60_000).toISOString();

function demoBase(overrides: Partial<LiftOffRequest>): LiftOffRequest {
  return {
    id: "", created_at: mins(30), updated_at: mins(30),
    submitter_id: "demo-lo-1", submitter_name: "Demo LO", submitter_nmls: "1234567",
    submitter_email: "demo@hcmg.com", submitter_phone: "(702) 555-0100",
    request_type: "lock_request", request_status: "pending",
    arive_loan_number: null, carried_forward_ids: null,
    loan_type: "purchase", loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 425000, purchase_price: 475000,
    borrower_first_name: "Demo", borrower_last_name: "Borrower",
    co_borrower_first_name: null, co_borrower_last_name: null,
    property_address: "456 Desert Sun Blvd", property_city: "Henderson",
    property_state: "NV", property_zip: "89002",
    property_type: "sfr", occupancy_type: "primary",
    target_close_date: "2025-10-31",
    lock_status: null, float_reason: null,
    income_note: null, property_note: null, assets_note: null, credit_note: null,
    special_instructions: null, loan_goal: null,
    matches_1003: null, matches_1003_changes: null, gift_funds_present: null,
    donor_first_name: null, donor_last_name: null, donor_phone: null,
    donor_email: null, donor_address_1: null, donor_address_2: null,
    donor_city: null, donor_state: null, donor_zip: null,
    ready_to_submit: false, submission_requested_at: null, team_notes: null,
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
    lock_requested_rate: 6.875,
    lock_requested_price: 99.875,
    lock_requested_apr: 7.012,
    lock_requested_monthly_pmt: 2791,
    lock_requested_lender: "UWM",
    lock_requested_product: "30-Year Fixed",
    lock_requested_loan_amount: 425000,
    lock_requested_loan_type: "conventional",
    lock_period_days: 30,
    lock_requested_close_date: "2025-10-31",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(30),
    lock_pricing_age_minutes: 5,
    lock_lo_notes: null,
    lock_confirmed_rate: null, lock_confirmed_price: null,
    lock_confirmed_apr: null, lock_confirmed_lock_period: null,
    lock_confirmed_lock_date: null, lock_confirmed_exp_date: null,
    lock_confirmation_number: null, lock_confirmed_lender: null, lock_desk_notes: null,
    stage: null, owner_role: null, sla_deadline_at: null, sla_severity: null, priority_score: 50,
    stage_history_json: null, assigned_processor_name: null,
    assigned_processor_email: null, assigned_processor_company: null,
    assigned_at: null, block_reason: null, blocked_at_stage: null,
    return_reason: null, registered_at: null,
    arive_lookup_raw: null, arive_looked_up_at: null, arive_deep_link: null,
    lock_preference: null, parent_request_id: null, linked_lock_request_id: null,
    certified_at: mins(30), certified_by_name: "Demo LO",
    claimed_by_id: null, claimed_by_name: null, claimed_at: null,
    started_at: null, completed_at: null,
    inflight_email_sent_at: null, completed_email_sent_at: null,
    incomplete_reasons: null, incomplete_notes: null, incomplete_at: null,
    incomplete_by_name: null, resubmission_of: null, has_resubmission: false,
    resubmission_notes: null, resubmission_confirmed_at: null,
    assigned_to_id: null, assigned_to_name: null, assigned_at_ts: null, assigned_by_name: null,
    help_desk_sub_type: null, help_desk_description: null,
    channel_type: null, compensation_type: null,
    ...overrides,
  };
}

const DEMO_VIEWER_ID   = "demo-ld-1";
const DEMO_VIEWER_NAME = "Morgan Ellis";

const DEMO_REQUESTS: LiftOffRequest[] = [
  demoBase({
    id: "demo-ld-pending-1",
    request_status: "pending",
    submitter_name: "Sarah Mitchell",
    submitter_nmls: "1234567",
    submitter_email: "sarah.mitchell@demo.com",
    submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus",
    borrower_last_name: "Thompson",
    arive_loan_number: "HCMG-2025-4490",
    loan_amount: 520000,
    lock_requested_rate: 6.750,
    lock_requested_price: 100.125,
    lock_requested_apr: 6.895,
    lock_requested_monthly_pmt: 3374,
    lock_requested_lender: "Rocket Pro TPO",
    lock_requested_product: "30-Year Fixed",
    lock_requested_loan_amount: 520000,
    lock_period_days: 30,
    lock_requested_close_date: "2025-11-05",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(12),
    lock_pricing_age_minutes: 12,
    lock_lo_notes: "Borrower is locked in rate decision. Please confirm ASAP — rate valid for 2 more hours.",
    created_at: mins(12),
    updated_at: mins(12),
    certified_at: mins(12),
    priority_score: 85,
  }),
  demoBase({
    id: "demo-ld-inreview-1",
    request_status: "in_review",
    submitter_name: "James Rivera",
    submitter_nmls: "2345678",
    submitter_email: "james.rivera@demo.com",
    submitter_phone: "(702) 555-0247",
    borrower_first_name: "Patricia",
    borrower_last_name: "Okafor",
    arive_loan_number: "HCMG-2025-4485",
    loan_amount: 390000,
    lock_requested_rate: 7.000,
    lock_requested_price: 99.750,
    lock_requested_apr: 7.148,
    lock_requested_monthly_pmt: 2595,
    lock_requested_lender: "UWM",
    lock_requested_product: "30-Year Fixed FHA",
    lock_requested_loan_amount: 390000,
    lock_period_days: 45,
    lock_requested_close_date: "2025-11-20",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(95),
    lock_pricing_age_minutes: 95,
    created_at: mins(110),
    updated_at: mins(45),
    certified_at: mins(110),
    claimed_by_id: DEMO_VIEWER_ID,
    claimed_by_name: DEMO_VIEWER_NAME,
    claimed_at: mins(45),
    started_at: mins(25),
    inflight_email_sent_at: mins(25),
    priority_score: 70,
  }),
  demoBase({
    id: "demo-ld-action-1",
    request_status: "action_needed",
    submitter_name: "Keisha Brown",
    submitter_nmls: "3456789",
    submitter_email: "keisha.brown@demo.com",
    submitter_phone: "(702) 555-0391",
    borrower_first_name: "DeShawn",
    borrower_last_name: "Williams",
    co_borrower_first_name: "Aaliyah",
    arive_loan_number: "HCMG-2025-4479",
    loan_amount: 610000,
    lock_requested_rate: 7.125,
    lock_requested_price: 99.500,
    lock_requested_apr: 7.283,
    lock_requested_monthly_pmt: 4111,
    lock_requested_lender: "Pennymac TPO",
    lock_requested_product: "30-Year Fixed Jumbo",
    lock_requested_loan_amount: 610000,
    lock_period_days: 30,
    lock_requested_close_date: "2025-10-28",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(250),
    lock_pricing_age_minutes: 250,
    created_at: mins(270),
    updated_at: mins(75),
    certified_at: mins(270),
    claimed_by_id: "demo-ld-2",
    claimed_by_name: "Taylor Brooks",
    claimed_at: mins(200),
    started_at: mins(170),
    incomplete_reasons: ["Pricing screenshot not attached in ARIVE", "ARIVE loan number not found or not provided"],
    incomplete_notes: "Please attach the rate sheet screenshot and confirm ARIVE loan number before we proceed with the lock.",
    incomplete_at: mins(75),
    incomplete_by_name: "Taylor Brooks",
    priority_score: 92,
  }),
  demoBase({
    id: "demo-ld-completed-1",
    request_status: "completed",
    submitter_name: "Tony Marchetti",
    submitter_nmls: "4567890",
    submitter_email: "tony.marchetti@demo.com",
    submitter_phone: "(702) 555-0418",
    borrower_first_name: "Ethan",
    borrower_last_name: "Goldstein",
    arive_loan_number: "HCMG-2025-4471",
    loan_amount: 480000,
    lock_requested_rate: 6.875,
    lock_requested_price: 100.000,
    lock_requested_apr: 7.022,
    lock_requested_monthly_pmt: 3153,
    lock_requested_lender: "UWM",
    lock_requested_product: "30-Year Fixed",
    lock_requested_loan_amount: 480000,
    lock_period_days: 30,
    lock_requested_close_date: "2025-10-31",
    lock_pricing_confirmed_by_lo: true,
    lock_pricing_confirmed_at: mins(500),
    lock_pricing_age_minutes: 500,
    lock_confirmed_rate: 6.875,
    lock_confirmed_price: 100.000,
    lock_confirmed_apr: 7.022,
    lock_confirmed_lock_period: 30,
    lock_confirmed_lock_date: mins(15),
    lock_confirmed_exp_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lock_confirmation_number: "UWM-2025-LK-88234",
    lock_confirmed_lender: "UWM",
    lock_desk_notes: "Lock confirmed with lender. All terms match the request.",
    created_at: mins(510),
    updated_at: mins(15),
    certified_at: mins(510),
    claimed_by_id: DEMO_VIEWER_ID,
    claimed_by_name: DEMO_VIEWER_NAME,
    claimed_at: mins(460),
    started_at: mins(430),
    completed_at: mins(15),
    completed_email_sent_at: mins(15),
    priority_score: 60,
  }),
];

// ── Real data fetch ────────────────────────────────────────────────────────────

async function getLockDeskRequests(): Promise<LiftOffRequest[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("request_type", "lock_request")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as LiftOffRequest[];
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function LockDeskQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const sp     = await searchParams;
  const isDemo = sp.demo === "1";

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/liftoff/lockdesk");

  if (!isDemo && !canAccessLockDeskQueue(profile)) redirect("/liftoff");

  const canAssign  = isDemo || canAssignRequests(profile);
  const canSeeAll  = isDemo || isOpsManager(profile) || profile.role === "admin" || profile.role === "developer";
  const isSelfOnly = !isDemo && !canSeeAll;
  const requests   = isDemo ? DEMO_REQUESTS : await getLockDeskRequests();
  const roleLabel  = isDemo ? "Demo Mode" : getLiftOffRoleLabel(profile.liftoff_roles);
  const viewerId   = isDemo ? DEMO_VIEWER_ID   : profile.id;
  const viewerName = isDemo ? DEMO_VIEWER_NAME : profile.full_name;

  return (
    <div className="space-y-6">
      {/* Demo banner */}
      {isDemo && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🎭</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Demo Mode — Lock Desk Queue</p>
            <p className="text-xs text-amber-700 mt-0.5">
              All actions (Claim, Start, Confirm Lock) work in this demo — no database writes or emails will be sent.
              Showing 4 realistic lock requests across all stages.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Lock Desk Queue</h1>
          <p className="mt-0.5 text-sm text-muted">
            Rate lock requests · {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LookupButton context="lockdesk" />
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted">
            {requests.length} total
          </span>
        </div>
      </div>

      <LockDeskQueueClient
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
