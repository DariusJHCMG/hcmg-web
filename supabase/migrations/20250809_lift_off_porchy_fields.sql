-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Add missing Porchy fields
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run after 20250809_lift_off_arive.sql
-- ═══════════════════════════════════════════════════════════════

alter table public.lift_off_requests
  -- Workflow stage (what step ops is on)
  add column if not exists stage                  text
    check (stage in ('submitted','registered','locked','disclosed','pre_uw','processing','completed') or stage is null),

  -- Who currently owns the request
  add column if not exists owner_role             text
    check (owner_role in ('lo','ops','compliance','underwriter') or owner_role is null),

  -- Document checklist — array of {label, checked, category} objects
  add column if not exists doc_checklist_json     jsonb,

  -- Ops review checklist — array of {label, checked, note} objects
  add column if not exists lift_review_checklist_json jsonb,

  -- SLA tracking
  add column if not exists sla_deadline_at        timestamptz,
  add column if not exists is_sla_breached        boolean not null default false,
  add column if not exists sla_severity           text
    check (sla_severity in ('normal','warning','critical') or sla_severity is null),

  -- Priority
  add column if not exists priority_score         integer not null default 0,

  -- Property details (for doc checklist logic)
  add column if not exists property_type          text
    check (property_type in ('sfr','condo','townhouse','multi_family','manufactured','other') or property_type is null),
  add column if not exists occupancy_type         text
    check (occupancy_type in ('primary','second_home','investment') or occupancy_type is null),

  -- Stage history (jsonb array of {stage, enteredAt, exitedAt, actor})
  add column if not exists stage_history_json     jsonb,

  -- Submitter contact (so ops can call them directly)
  add column if not exists submitter_email        text,
  add column if not exists submitter_phone        text;

-- Indexes for new query patterns
create index if not exists lo_requests_stage_idx    on public.lift_off_requests(stage);
create index if not exists lo_requests_owner_idx    on public.lift_off_requests(owner_role);
create index if not exists lo_requests_sla_idx      on public.lift_off_requests(sla_deadline_at);
create index if not exists lo_requests_priority_idx on public.lift_off_requests(priority_score desc);
