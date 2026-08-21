export type Role = "admin" | "developer" | "loan_officer";

// ── Lift Off Types ────────────────────────────────────────────

export type LiftOffRequestType =
  | "register_disclosure"
  | "disclosure_only"
  | "submission"
  | "restructure_suspense";

export type LiftOffRequestStatus =
  | "pending"
  | "in_review"
  | "action_needed"
  | "completed"
  | "cancelled";

export type LockStatus = "locked" | "floating" | "lock_required";

export interface LiftOffRequest {
  id: string;
  created_at: string;
  updated_at: string;

  // Submitter
  submitter_id: string;
  submitter_name: string;
  submitter_nmls: string | null;

  // Classification
  request_type: LiftOffRequestType;
  request_status: LiftOffRequestStatus;

  // Loan identity
  arive_loan_number: string | null;
  carried_forward_ids: string | null;
  loan_type: string | null;
  loan_amount: number | null;
  purchase_price: number | null;

  // Borrower
  borrower_first_name: string;
  borrower_last_name: string;
  co_borrower_first_name: string | null;
  co_borrower_last_name: string | null;

  // Property
  property_address: string | null;
  property_city: string | null;
  property_state: string | null;
  property_zip: string | null;
  property_type: string | null;
  occupancy_type: string | null;
  target_close_date: string | null;

  // Lock
  lock_status: LockStatus | null;
  float_reason: string | null;

  // Notes
  income_note: string | null;
  property_note: string | null;
  assets_note: string | null;
  credit_note: string | null;
  special_instructions: string | null;
  loan_goal: string | null;
  matches_1003: boolean | null;
  matches_1003_changes: string | null;
  gift_funds_present: "yes" | "no" | null;
  donor_first_name: string | null;
  donor_last_name: string | null;
  donor_phone: string | null;
  donor_email: string | null;
  donor_address_1: string | null;
  donor_address_2: string | null;
  donor_city: string | null;
  donor_state: string | null;
  donor_zip: string | null;
  ready_to_submit: boolean;
  submission_requested_at: string | null;
  team_notes: string | null;
  doc_checklist_json: { label: string; checked: boolean }[] | null;

  // Restructure / Suspense
  suspense_reason: string | null;
  suspense_notes: string | null;
  reason_fixed: boolean | null;

  // Wire
  wire_lender: string | null;
  wire_lender_loan_number: string | null;
  wire_branch: string | null;
  wire_closing_date: string | null;
  wire_lock_date: string | null;
  wire_lock_exp_date: string | null;
  wire_disbursement_date: string | null;
  wire_settlement_agent_name: string | null;
  wire_settlement_agent_email: string | null;
  wire_balanced_with_title: boolean | null;
  wire_final_cd_key: string | null;
  wire_final_cd_name: string | null;
  wire_approvals_json: { approver_id: string; approved_at: string; role: string }[] | null;
  wire_outcome: string | null;
  wire_expires_at: string | null;
  wire_requestor_email: string | null;

  // Adverse
  adverse_reason: string | null;
  adverse_notes: string | null;
  adverse_outcome: string | null;
  adverse_withdraw_from_portal: boolean | null;
  adverse_leader_attempted_resell: boolean | null;
  adverse_open_appraisal_order: boolean | null;
  adverse_appraisal_disposition: string | null;

  // Ops / Stage
  stage: string | null;
  owner_role: string | null;
  sla_deadline_at: string | null;
  priority_score: number | null;
  stage_history_json: { stage: string; changed_at: string; changed_by: string }[] | null;
  assigned_processor_name: string | null;
  assigned_processor_email: string | null;
  assigned_processor_company: string | null;
  assigned_at: string | null;
  block_reason: string | null;
  blocked_at_stage: string | null;
  return_reason: string | null;
  registered_at: string | null;
  submitter_email: string | null;
  submitter_phone: string | null;

  // ARIVE lookup
  arive_lookup_raw: Record<string, unknown> | null;
  arive_looked_up_at: string | null;

  // Certification
  certified_at: string | null;
  certified_by_name: string | null;
}


/** SLICE-specific role — more granular than the portal Role */
export type SliceRole = "super_admin" | "clo" | "executive" | "branch_manager" | "loan_officer";
export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  lo_slug: string | null;
  nmls: string | null;
  phone: string | null;
  notify_email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  // Public website fields
  title: string | null;
  short_bio: string | null;
  offices: string[] | null;
  linkedin: string | null;
  licensed_states: string[] | null;
  show_on_website: boolean;
  // Profile page content
  hero_bio: string | null;
  about_headline: string | null;
  long_bio: string[] | null;
  years_experience: number | null;
  specialties: string[] | null;
  created_at: string;
  updated_at: string;
  calendar_url: string | null;
  // Activity tracking
  last_seen_at: string | null;
  // SLICE v3 additions
  tenant_id: string;
  slice_role: SliceRole;
  branch_id: string | null;
  manager_id: string | null;
  arive_lo_id: string | null;
  porchy_user_id: string | null;
  last_login_at: string | null;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  sms_consent: boolean;
  sms_consent_text: string | null;
  sms_consent_timestamp: string | null;
  source: string;
  funnel_type: string | null;
  property_state: string | null;
  goal: string | null;
  price_range: string | null;
  credit_range: string | null;
  income_range: string | null;
  notes: string | null;
  lo_slug: string | null;
  lo_name: string | null;
  lo_nmls: string | null;
  status: LeadStatus;
  estimated_buying_power_low: number | null;
  estimated_buying_power_high: number | null;
  estimated_monthly_payment: number | null;
  recommended_loan_type: string | null;
  ip_address: string | null;
  // UTM attribution
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  // Session intelligence
  session_id: string | null;
  entry_page: string | null;
  referrer:   string | null;
  device:     string | null;
  co_branded_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadEvent {
  id:         string;
  session_id: string;
  event_type: "page_view" | "funnel_step" | "cta_click" | "calculator_use";
  pathname:   string | null;
  data:       Record<string, unknown> | null;
  ts:         string;
  created_at: string;
}

export interface CoBrandedPage {
  id: string;
  lo_slug: string;
  realtor_slug: string;
  realtor_name: string;
  realtor_company: string;
  realtor_phone: string | null;
  realtor_email: string | null;
  realtor_license: string | null;
  realtor_photo_url: string | null;
  realtor_logo_url: string | null;
  headline: string | null;
  application_url: string | null;
  calendar_url: string | null;
  is_active: boolean;
  clicks: number;
  app_clicks: number;
  book_call_clicks: number;
  bookings_completed: number;
  created_at: string;
  updated_at: string;
}

export interface FunnelLink {
  id: string;
  lo_slug: string;
  lo_name: string;
  url: string;
  clicks: number;
  is_active: boolean;
  /** For LO-variant funnels: the funnel slug from FUNNEL_CATALOG. Null = base /go/[lo] link. */
  funnel_type: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// ── Goal Engine Types ─────────────────────────────────────────

export type GoalStatus = "draft" | "scheduled" | "published" | "closed" | "archived";

export interface GoalMonth {
  id: string;
  tenant_id: string;
  month_label: string;
  month_year: number;
  month_num: number;
  funded_volume_goal: number;
  funded_units_goal: number;
  app_volume_goal: number;
  app_units_goal: number;
  clo_message: string | null;
  awards_enabled: boolean;
  start_date: string;
  end_date: string;
  email_send_at: string | null;
  emails_sent: boolean;
  is_published: boolean;
  goal_status: GoalStatus;
  commitment_deadline: string | null;
  award_calc_date: string | null;
  milestone_25_sent: boolean;
  milestone_50_sent: boolean;
  milestone_75_sent: boolean;
  milestone_90_sent: boolean;
  milestone_100_sent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalCommitment {
  id: string;
  goal_month_id: string;
  profile_id: string;
  funded_volume_commitment: number;
  funded_units_commitment: number;
  app_volume_commitment: number;
  app_units_commitment: number;
  biggest_focus: string | null;
  biggest_challenge: string | null;
  confidence_pct: number | null;
  comments: string | null;
  digital_agreement: boolean;
  locked: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalProduction {
  id: string;
  profile_id: string;
  goal_month_id: string | null;
  loan_id: string | null;
  funded_date: string | null;
  funded_volume: number | null;
  funded_unit: number;
  app_date: string | null;
  app_volume: number | null;
  app_unit: number;
  source: string;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface GoalAward {
  id: string;
  goal_month_id: string;
  profile_id: string;
  award_type: string;
  award_label: string;
  award_emoji: string | null;
  stats_snapshot: Record<string, unknown> | null;
  certificate_url: string | null;
  email_sent: boolean;
  issued_at: string;
  created_at: string;
}

export interface GoalNotification {
  id: string;
  tenant_id: string;
  profile_id: string;
  title: string;
  body: string | null;
  type: "info" | "success" | "warning" | "award";
  read: boolean;
  link: string | null;
  expires_at: string | null;
  actioned_at: string | null;
  dismissed_at: string | null;
  created_at: string;
}

export interface CoachingNote {
  id: string;
  tenant_id: string;
  employee_id: string;
  manager_id: string;
  goal_month_id: string | null;
  coaching_date: string;
  note_type: "general" | "performance" | "encouragement" | "action_required" | "follow_up";
  is_private: boolean;
  note: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachingAction {
  id: string;
  tenant_id: string;
  coaching_note_id: string | null;
  employee_id: string;
  manager_id: string;
  action_text: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type HarryInsightType =
  | "lo_coaching"
  | "executive_briefing"
  | "branch_insight"
  | "pace_explanation"
  | "focus_recommendation"
  | "off_pace_alert"
  | "milestone_summary";

export interface HarryAiInsight {
  id: string;
  tenant_id: string;
  requester_id: string;
  target_profile_id: string | null;
  insight_type: HarryInsightType;
  reporting_period: string | null;
  goal_month_id: string | null;
  input_snapshot: Record<string, unknown> | null;
  result_text: string | null;
  result_structured: Record<string, unknown> | null;
  model_provider: string;
  prompt_version: string;
  feedback: "helpful" | "not_helpful" | "inaccurate" | null;
  dismissed_at: string | null;
  actioned_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface SliceAuditEntry {
  id: string;
  tenant_id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  before_val: Record<string, unknown> | null;
  after_val: Record<string, unknown> | null;
  reason: string | null;
  ip_address: string | null;
  request_id: string | null;
  created_at: string;
}

/** Joined leaderboard row from goal_leaderboard view */
export interface LeaderboardRow {
  goal_month_id: string;
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  nmls: string | null;
  funded_volume_commitment: number;
  funded_units_commitment: number;
  app_volume_commitment: number;
  app_units_commitment: number;
  confidence_pct: number | null;
  submitted_at: string | null;
  funded_volume_actual: number;
  funded_units_actual: number;
  app_volume_actual: number;
  app_units_actual: number;
}

// Supabase Database type map used by createClient<Database>
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & { created_at?: string; updated_at?: string };
        Update: Partial<Profile>;
      };
      leads: {
        Row:    Lead;
        Insert: Omit<Lead, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Lead>;
      };
      funnel_links: {
        Row:    FunnelLink;
        Insert: Omit<FunnelLink, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<FunnelLink>;
      };
      audit_log: {
        Row:    AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<AuditLog>;
      };
      goal_months: {
        Row:    GoalMonth;
        Insert: Omit<GoalMonth, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<GoalMonth>;
      };
      goal_commitments: {
        Row:    GoalCommitment;
        Insert: Omit<GoalCommitment, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<GoalCommitment>;
      };
      goal_production: {
        Row:    GoalProduction;
        Insert: Omit<GoalProduction, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<GoalProduction>;
      };
      goal_awards: {
        Row:    GoalAward;
        Insert: Omit<GoalAward, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<GoalAward>;
      };
    };
    Views: {
      goal_leaderboard: { Row: LeaderboardRow };
    };
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}
