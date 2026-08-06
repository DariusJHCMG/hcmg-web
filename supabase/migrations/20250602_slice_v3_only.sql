-- ═══════════════════════════════════════════════════════════════
-- SLICE by HCMG — v3 Additive Migration
-- Run this ONLY — do NOT re-run the v1 migration.
-- All statements use IF NOT EXISTS / IF NOT EXISTS guards.
-- Safe to run multiple times.
-- ═══════════════════════════════════════════════════════════════

-- ── 0. updated_at helper ────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── 1. PROFILES — new columns ───────────────────────────────────
alter table public.profiles
  add column if not exists tenant_id        text    not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists slice_role       text    not null default 'loan_officer'
    check (slice_role in ('super_admin','clo','executive','branch_manager','loan_officer')),
  add column if not exists branch_id        text,
  add column if not exists manager_id       uuid    references public.profiles(id) on delete set null,
  add column if not exists arive_lo_id      text,
  add column if not exists porchy_user_id   text    unique,
  add column if not exists last_login_at    timestamptz;

create index if not exists profiles_tenant_idx       on public.profiles(tenant_id);
create index if not exists profiles_slice_role_idx   on public.profiles(slice_role);
create index if not exists profiles_porchy_user_idx  on public.profiles(porchy_user_id);

-- ── 2. GOAL MONTHS — new columns ────────────────────────────────
alter table public.goal_months
  add column if not exists tenant_id          text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists goal_status        text not null default 'draft'
    check (goal_status in ('draft','scheduled','published','closed','archived')),
  add column if not exists commitment_deadline date,
  add column if not exists award_calc_date    date,
  add column if not exists milestone_25_sent  boolean not null default false,
  add column if not exists milestone_50_sent  boolean not null default false,
  add column if not exists milestone_75_sent  boolean not null default false,
  add column if not exists milestone_90_sent  boolean not null default false,
  add column if not exists milestone_100_sent boolean not null default false;

create index if not exists goal_months_tenant_idx  on public.goal_months(tenant_id);
create index if not exists goal_months_status_idx  on public.goal_months(goal_status);

-- ── 3. COMMITMENTS — new columns ────────────────────────────────
alter table public.goal_commitments
  add column if not exists tenant_id      text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists unlock_reason  text,
  add column if not exists unlocked_by    uuid references public.profiles(id) on delete set null,
  add column if not exists unlocked_at    timestamptz;

create index if not exists goal_commitments_tenant_idx on public.goal_commitments(tenant_id);

-- ── 4. PRODUCTION — new columns ─────────────────────────────────
alter table public.goal_production
  add column if not exists tenant_id        text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists source_event_id  text,
  add column if not exists correction_reason text,
  add column if not exists corrected_by     uuid references public.profiles(id) on delete set null,
  add column if not exists corrected_at     timestamptz,
  add column if not exists is_excluded      boolean not null default false,
  add column if not exists event_type       text not null default 'funded'
    check (event_type in ('funded','application','correction','reversal'));

create index if not exists goal_production_tenant_idx      on public.goal_production(tenant_id);
create index if not exists goal_production_funded_date_idx on public.goal_production(funded_date);
create index if not exists goal_production_app_date_idx    on public.goal_production(app_date);
create index if not exists goal_production_event_type_idx  on public.goal_production(event_type);

-- ── 5. AWARDS — new columns ─────────────────────────────────────
alter table public.goal_awards
  add column if not exists tenant_id      text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists rule_version   text not null default 'v1',
  add column if not exists cert_number    text unique,
  add column if not exists period_type    text not null default 'monthly'
    check (period_type in ('monthly','quarterly','annual','lifetime'));

create index if not exists goal_awards_tenant_idx on public.goal_awards(tenant_id);

-- ── 6. EMAIL LOG — new columns ──────────────────────────────────
alter table public.goal_email_log
  add column if not exists tenant_id         text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists status            text not null default 'sent'
    check (status in ('queued','sent','delivered','opened','clicked','bounced','complained','failed')),
  add column if not exists delivered_at      timestamptz,
  add column if not exists opened_at         timestamptz,
  add column if not exists clicked_at        timestamptz,
  add column if not exists bounced_at        timestamptz,
  add column if not exists failure_reason    text;

create index if not exists goal_email_log_tenant_idx  on public.goal_email_log(tenant_id);
create index if not exists goal_email_log_type_idx    on public.goal_email_log(email_type);
create index if not exists goal_email_log_status_idx  on public.goal_email_log(status);
create index if not exists goal_email_log_profile_idx on public.goal_email_log(profile_id);

-- ── 7. NOTIFICATIONS — new columns ──────────────────────────────
alter table public.goal_notifications
  add column if not exists tenant_id    text not null default 'cmrss19yi000fysf83wcom9th',
  add column if not exists expires_at   timestamptz,
  add column if not exists actioned_at  timestamptz,
  add column if not exists dismissed_at timestamptz;

-- ── 8. COACHING NOTES (new table) ───────────────────────────────
create table if not exists public.coaching_notes (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       text not null default 'cmrss19yi000fysf83wcom9th',
  employee_id     uuid not null references public.profiles(id) on delete cascade,
  manager_id      uuid not null references public.profiles(id) on delete cascade,
  goal_month_id   uuid references public.goal_months(id) on delete set null,
  coaching_date   date not null default current_date,
  note_type       text not null default 'general'
    check (note_type in ('general','performance','encouragement','action_required','follow_up')),
  is_private      boolean not null default false,
  note            text not null,
  follow_up_date  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.coaching_notes disable row level security;
create index if not exists coaching_tenant_idx    on public.coaching_notes(tenant_id);
create index if not exists coaching_employee_idx  on public.coaching_notes(employee_id);
create index if not exists coaching_manager_idx   on public.coaching_notes(manager_id);
create index if not exists coaching_month_idx     on public.coaching_notes(goal_month_id);
create or replace trigger coaching_notes_updated_at
  before update on public.coaching_notes
  for each row execute procedure public.handle_updated_at();

-- ── 9. COACHING ACTIONS (new table) ─────────────────────────────
create table if not exists public.coaching_actions (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        text not null default 'cmrss19yi000fysf83wcom9th',
  coaching_note_id uuid references public.coaching_notes(id) on delete set null,
  employee_id      uuid not null references public.profiles(id) on delete cascade,
  manager_id       uuid not null references public.profiles(id) on delete cascade,
  action_text      text not null,
  due_date         date,
  completed        boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.coaching_actions disable row level security;
create index if not exists coaching_actions_employee_idx on public.coaching_actions(employee_id);
create index if not exists coaching_actions_tenant_idx   on public.coaching_actions(tenant_id);
create or replace trigger coaching_actions_updated_at
  before update on public.coaching_actions
  for each row execute procedure public.handle_updated_at();

-- ── 10. SLICE AUDIT LOG (new table) ─────────────────────────────
create table if not exists public.slice_audit_log (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   text not null default 'cmrss19yi000fysf83wcom9th',
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_email text,
  action      text not null,
  entity_type text,
  entity_id   text,
  before_val  jsonb,
  after_val   jsonb,
  reason      text,
  ip_address  text,
  request_id  text,
  created_at  timestamptz not null default now()
);
alter table public.slice_audit_log disable row level security;
create index if not exists slice_audit_tenant_idx on public.slice_audit_log(tenant_id);
create index if not exists slice_audit_actor_idx  on public.slice_audit_log(actor_id);
create index if not exists slice_audit_action_idx on public.slice_audit_log(action);
create index if not exists slice_audit_entity_idx on public.slice_audit_log(entity_type, entity_id);

-- ── 11. HARRY AI INSIGHTS (new table) ───────────────────────────
create table if not exists public.harry_ai_insights (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         text not null default 'cmrss19yi000fysf83wcom9th',
  requester_id      uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete set null,
  insight_type      text not null
    check (insight_type in ('lo_coaching','executive_briefing','branch_insight','pace_explanation','focus_recommendation','off_pace_alert','milestone_summary')),
  reporting_period  text,
  goal_month_id     uuid references public.goal_months(id) on delete set null,
  input_snapshot    jsonb,
  result_text       text,
  result_structured jsonb,
  model_provider    text not null default 'openai',
  prompt_version    text not null default 'v1',
  feedback          text
    check (feedback in ('helpful','not_helpful','inaccurate') or feedback is null),
  dismissed_at      timestamptz,
  actioned_at       timestamptz,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);
alter table public.harry_ai_insights disable row level security;
create index if not exists harry_insights_tenant_idx    on public.harry_ai_insights(tenant_id);
create index if not exists harry_insights_requester_idx on public.harry_ai_insights(requester_id);
create index if not exists harry_insights_target_idx    on public.harry_ai_insights(target_profile_id);
create index if not exists harry_insights_type_idx      on public.harry_ai_insights(insight_type);
create index if not exists harry_insights_period_idx    on public.harry_ai_insights(reporting_period);

-- ── 12. GOAL REMINDER LOG (new table) ───────────────────────────
create table if not exists public.goal_reminder_log (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      text not null default 'cmrss19yi000fysf83wcom9th',
  goal_month_id  uuid not null references public.goal_months(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  reminder_stage text not null check (reminder_stage in ('initial','final')),
  sent_at        timestamptz not null default now(),
  unique (goal_month_id, profile_id, reminder_stage)
);
alter table public.goal_reminder_log disable row level security;
create index if not exists reminder_log_month_idx   on public.goal_reminder_log(goal_month_id);
create index if not exists reminder_log_profile_idx on public.goal_reminder_log(profile_id);

-- ── 13. SLICE SESSIONS (new table) ──────────────────────────────
create table if not exists public.slice_sessions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     text not null default 'cmrss19yi000fysf83wcom9th',
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  session_token text not null unique,
  expires_at    timestamptz not null,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);
alter table public.slice_sessions disable row level security;
create index if not exists slice_sessions_token_idx   on public.slice_sessions(session_token);
create index if not exists slice_sessions_profile_idx on public.slice_sessions(profile_id);
create index if not exists slice_sessions_expires_idx on public.slice_sessions(expires_at);
