-- ═══════════════════════════════════════════════════════════════════
-- SLICE by HCMG — Production Corrections Migration
-- Adds controlled correction workflow for goal_production events.
-- All statements are idempotent (IF NOT EXISTS guards).
-- Run AFTER 20250602_slice_v3_only.sql
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Add correction columns to goal_production ─────────────────
alter table public.goal_production
  add column if not exists is_correction   boolean       not null default false,
  add column if not exists parent_event_id uuid          references public.goal_production(id) on delete set null,
  add column if not exists correction_type text
    check (correction_type in ('manual_add','correction','reversal','reassign','exclude') or correction_type is null),
  add column if not exists correction_note text,
  add column if not exists corrected_by_id uuid          references public.profiles(id) on delete set null,
  add column if not exists corrected_at    timestamptz;

create index if not exists goal_production_parent_idx      on public.goal_production(parent_event_id);
create index if not exists goal_production_correction_idx  on public.goal_production(is_correction);

-- ── 2. Production corrections audit table ────────────────────────
-- Every write to goal_production by an admin is logged here.
-- LOs cannot write to this table or goal_production directly.
create table if not exists public.production_corrections (
  id               uuid        primary key default gen_random_uuid(),
  tenant_id        text        not null default 'cmrss19yi000fysf83wcom9th',

  -- what was changed
  event_id         uuid        not null references public.goal_production(id) on delete cascade,
  goal_month_id    uuid        not null references public.goal_months(id) on delete cascade,
  target_profile_id uuid       not null references public.profiles(id) on delete cascade,

  -- who did it
  admin_id         uuid        not null references public.profiles(id) on delete restrict,
  admin_email      text        not null,

  -- what kind of change
  correction_type  text        not null
    check (correction_type in ('manual_add','correction','reversal','reassign','exclude','unexclude')),

  -- mandatory reason — never allow silent edits
  reason           text        not null check (char_length(reason) >= 10),

  -- values before / after
  before_val       jsonb,
  after_val        jsonb,

  -- related loan
  loan_id          text,
  source           text        not null default 'manual',

  -- timestamps
  created_at       timestamptz not null default now()
);

alter table public.production_corrections disable row level security;

create index if not exists prod_corrections_tenant_idx   on public.production_corrections(tenant_id);
create index if not exists prod_corrections_event_idx    on public.production_corrections(event_id);
create index if not exists prod_corrections_month_idx    on public.production_corrections(goal_month_id);
create index if not exists prod_corrections_admin_idx    on public.production_corrections(admin_id);
create index if not exists prod_corrections_target_idx   on public.production_corrections(target_profile_id);
create index if not exists prod_corrections_type_idx     on public.production_corrections(correction_type);
create index if not exists prod_corrections_created_idx  on public.production_corrections(created_at desc);
