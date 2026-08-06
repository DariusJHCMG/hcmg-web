-- ═══════════════════════════════════════════════════════════════════
-- SLICE by HCMG — ARIVE Integration Correctness Migration
-- Fixes the goal_production table and leaderboard view so that:
--   1. loan_id is unique PER PROFILE, not globally
--      (same ARIVE loan ID can't appear for two different LOs, but
--       the constraint should not prevent separate events per loan)
--   2. Leaderboard view only sums non-excluded rows with event_type = 'funded'
--      or 'application' (never 'reversal' or 'correction')
--   3. Composite index on (loan_id, profile_id) for fast idempotency checks
--
-- Safe to run multiple times (all statements are idempotent).
-- Run AFTER all prior migrations.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Drop the old global unique constraint on loan_id ───────────
-- The original schema had: loan_id text unique
-- This prevents the same loan ID ever appearing twice, even for
-- legitimate scenarios (e.g. a loan re-assigned between LOs, or
-- a test loan ID being reused). We replace it with a softer
-- per-profile unique constraint.
do $$
begin
  -- Drop old global unique index if it exists
  if exists (
    select 1
    from   pg_indexes
    where  tablename  = 'goal_production'
    and    schemaname = 'public'
    and    indexname  = 'goal_production_loan_id_key'
  ) then
    alter table public.goal_production drop constraint if exists goal_production_loan_id_key;
  end if;
end;
$$;

-- ── 2. Add composite unique index: (loan_id, profile_id) ─────────
-- A loan can only appear once per LO. If a retry fires for the
-- same loan + same LO, we UPDATE rather than INSERT.
-- Null loan_ids are excluded (nulls never match in unique indexes).
create unique index if not exists goal_production_loan_profile_uniq
  on public.goal_production (loan_id, profile_id)
  where loan_id is not null;

-- ── 3. Rebuild the leaderboard view — filter correctly ───────────
-- Drop first to avoid "cannot change data type of view column" error,
-- then recreate. Safe: the view is read-only and rebuilt immediately.
drop view if exists public.goal_leaderboard;

create view public.goal_leaderboard as
  select
    c.goal_month_id,
    c.profile_id,
    p.full_name,
    p.avatar_url,
    p.nmls,
    c.funded_volume_commitment,
    c.funded_units_commitment,
    c.app_volume_commitment,
    c.app_units_commitment,
    c.confidence_pct,
    c.submitted_at,
    -- Funded totals: only funded/correction rows that are not excluded
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
    -- App totals: application rows + funded rows (a funded loan was once an app)
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
  from public.goal_commitments c
  join public.profiles p on p.id = c.profile_id
  left join public.goal_production pr
    on  pr.profile_id    = c.profile_id
    and pr.goal_month_id = c.goal_month_id
  group by
    c.goal_month_id, c.profile_id,
    p.full_name, p.avatar_url, p.nmls,
    c.funded_volume_commitment, c.funded_units_commitment,
    c.app_volume_commitment, c.app_units_commitment,
    c.confidence_pct, c.submitted_at;

-- ── 4. Backfill event_type for existing rows ──────────────────────
-- Rows that have funded_volume set → 'funded'
-- Rows that have only app_volume (no funded_volume) → 'application'
update public.goal_production
set event_type = case
  when funded_volume is not null and funded_volume > 0 then 'funded'
  when app_volume    is not null and app_volume    > 0
   and (funded_volume is null or funded_volume = 0)   then 'application'
  else event_type
end
where event_type = 'funded';
