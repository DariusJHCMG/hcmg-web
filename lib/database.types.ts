export type Role = "admin" | "developer" | "loan_officer";
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
  is_active: boolean;
  clicks: number;
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

export interface GoalMonth {
  id: string;
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
  profile_id: string;
  title: string;
  body: string | null;
  type: "info" | "success" | "warning" | "award";
  read: boolean;
  link: string | null;
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
