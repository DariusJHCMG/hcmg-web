-- ─────────────────────────────────────────────────────────────────────────────
-- 20261009_unmatched_production_staging.sql
--
-- Staging table for production events where the LO could not be matched to a
-- SLICE profile at the time the webhook fired.
--
-- Flow:
--   1. Zap / ARIVE webhook fires for an unknown LO → row inserted here
--   2. Admin adds that LO to SLICE profiles
--   3. Admin runs "Match Staged Production" in the admin panel OR
--      the sync-users / invite-accept flow auto-triggers matching
--   4. Matched rows are promoted to goal_production and deleted from staging
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.unmatched_production (
  id              uuid primary key default gen_random_uuid(),
  received_at     timestamptz not null default now(),

  -- Raw identifiers as received — used for matching later
  lo_nmls         text,
  lo_email        text,
  lo_name         text,
  lo_arive_id     text,

  loan_id         text not null,
  source          text not null default 'zapier',  -- 'zapier' | 'arive_native' | 'zapier_sync'
  event_type      text not null,                    -- 'application' | 'funded'

  funded_date     date,
  funded_volume   numeric,
  funded_unit     integer default 0,
  app_date        date,
  app_volume      numeric,
  app_unit        integer default 0,

  goal_month_id   uuid references public.goal_months(id) on delete set null,
  raw_payload     jsonb,

  -- Set when this row is successfully matched + promoted
  matched_at      timestamptz,
  matched_profile_id uuid references public.profiles(id) on delete set null,
  promoted        boolean not null default false
);

-- Indexes for matching queries
create index if not exists unmatched_production_lo_email_idx    on public.unmatched_production (lo_email);
create index if not exists unmatched_production_lo_nmls_idx     on public.unmatched_production (lo_nmls);
create index if not exists unmatched_production_lo_arive_id_idx on public.unmatched_production (lo_arive_id);
create index if not exists unmatched_production_promoted_idx    on public.unmatched_production (promoted) where not promoted;

-- RLS: admin-only
alter table public.unmatched_production enable row level security;

create policy "Admin full access to unmatched_production"
  on public.unmatched_production
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role in ('admin','clo','super_admin')
    )
  );
