-- SLICE by HCMG - Go-Live Fixes
-- Run in: Supabase Dashboard -> SQL Editor
-- 1. Creates goal_assignments table
-- 2. Rebuilds leaderboard view to include assigned LOs without commitments
-- 3. Adds arive_name alias column to profiles

-- ── 1. goal_assignments table ─────────────────────────────────
create table if not exists public.goal_assignments (
  id              uuid        primary key default gen_random_uuid(),
  goal_month_id   uuid        not null references public.goal_months(id) on delete cascade,
  profile_id      uuid        not null references public.profiles(id)    on delete cascade,
  assigned_by     uuid        references public.profiles(id)             on delete set null,
  assigned_at     timestamptz not null default now(),
  personal_funded_volume_goal  numeric,
  personal_funded_units_goal   int,
  notes           text,
  unique (goal_month_id, profile_id)
);

alter table public.goal_assignments disable row level security;

create index if not exists goal_assignments_month_idx   on public.goal_assignments(goal_month_id);
create index if not exists goal_assignments_profile_idx on public.goal_assignments(profile_id);

-- ── 2. arive_name alias on profiles ──────────────────────────
alter table public.profiles add column if not exists arive_name text;

-- Set Lamont's ARIVE alias (ARIVE sends "Lamont Harris", SLICE stores "Lamont Harris Jr.")
update public.profiles
set arive_name = 'Lamont Harris'
where full_name ilike 'Lamont Harris%'
and is_active = true;

-- ── 3. Rebuild leaderboard view to include assigned LOs ───────
-- Old view: JOIN goal_commitments (only shows LOs who committed)
-- New view: starts from assignments (or all active LOs if no assignments)
--           LEFT JOINs commitments and production so everyone shows up

drop view if exists public.goal_leaderboard;

create view public.goal_leaderboard as
  -- All LOs assigned to the goal (via goal_assignments)
  -- UNION with committed LOs who may not be in assignments
  with participants as (
    select distinct
      ga.goal_month_id,
      ga.profile_id
    from public.goal_assignments ga

    union

    select distinct
      c.goal_month_id,
      c.profile_id
    from public.goal_commitments c
  )
  select
    par.goal_month_id,
    par.profile_id,
    p.full_name,
    p.avatar_url,
    p.nmls,
    coalesce(c.funded_volume_commitment, 0)  as funded_volume_commitment,
    coalesce(c.funded_units_commitment,  0)  as funded_units_commitment,
    coalesce(c.app_volume_commitment,    0)  as app_volume_commitment,
    coalesce(c.app_units_commitment,     0)  as app_units_commitment,
    c.confidence_pct,
    c.submitted_at,
    coalesce(
      sum(pr.funded_volume) filter (
        where pr.is_excluded = false
        and   pr.event_type  in ('funded', 'correction')
        and   pr.funded_volume is not null
      ),
      0
    )::numeric(18,2) as funded_volume_actual,
    coalesce(
      sum(pr.funded_unit) filter (
        where pr.is_excluded = false
        and   pr.event_type  in ('funded', 'correction')
      ),
      0
    )::integer as funded_units_actual,
    coalesce(
      sum(pr.app_volume) filter (
        where pr.is_excluded = false
        and   pr.event_type  in ('application', 'funded')
        and   pr.app_volume is not null
      ),
      0
    )::numeric(18,2) as app_volume_actual,
    coalesce(
      sum(pr.app_unit) filter (
        where pr.is_excluded = false
        and   pr.event_type  in ('application', 'funded')
      ),
      0
    )::integer as app_units_actual
  from participants par
  join public.profiles p on p.id = par.profile_id
  left join public.goal_commitments c
    on  c.profile_id    = par.profile_id
    and c.goal_month_id = par.goal_month_id
  left join public.goal_production pr
    on  pr.profile_id    = par.profile_id
    and pr.goal_month_id = par.goal_month_id
  group by
    par.goal_month_id, par.profile_id,
    p.full_name, p.avatar_url, p.nmls,
    c.funded_volume_commitment, c.funded_units_commitment,
    c.app_volume_commitment, c.app_units_commitment,
    c.confidence_pct, c.submitted_at;

-- Verify
select
  (select count(*) from goal_assignments) as assignments,
  (select column_name from information_schema.columns
   where table_name = 'profiles' and column_name = 'arive_name') as arive_name_col;
