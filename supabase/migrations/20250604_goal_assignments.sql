-- ═══════════════════════════════════════════════════════════════════
-- SLICE by HCMG — Goal Assignments Migration
-- Controls which LOs are assigned (expected to produce) for each goal.
-- Participation rate is calculated only against assigned LOs.
-- LOs not assigned to a goal are excluded from participation metrics.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. goal_assignments — junction table ─────────────────────────
create table if not exists public.goal_assignments (
  id              uuid        primary key default gen_random_uuid(),
  tenant_id       text        not null default 'cmrss19yi000fysf83wcom9th',
  goal_month_id   uuid        not null references public.goal_months(id) on delete cascade,
  profile_id      uuid        not null references public.profiles(id)    on delete cascade,
  assigned_by     uuid        references public.profiles(id)             on delete set null,
  assigned_at     timestamptz not null default now(),
  -- optional: override individual LO goal for this month
  personal_funded_volume_goal  numeric,
  personal_funded_units_goal   int,
  notes           text,
  unique (goal_month_id, profile_id)
);

alter table public.goal_assignments disable row level security;

create index if not exists goal_assignments_month_idx   on public.goal_assignments(goal_month_id);
create index if not exists goal_assignments_profile_idx on public.goal_assignments(profile_id);
create index if not exists goal_assignments_tenant_idx  on public.goal_assignments(tenant_id);
