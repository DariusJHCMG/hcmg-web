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
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string;
  sms_consent: boolean;
  source: string;
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
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}
