-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Add lock_request type + fields
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop old check constraint and replace with one that includes lock_request
alter table public.lift_off_requests
  drop constraint if exists lift_off_requests_request_type_check;

alter table public.lift_off_requests
  add constraint lift_off_requests_request_type_check
  check (request_type in (
    'register_disclosure',
    'disclosure_only',
    'submission',
    'restructure_suspense',
    'lock_request'
  ));

-- Lock Request specific fields
alter table public.lift_off_requests
  -- Requested pricing (snapshotted from ARIVE at time of submission)
  add column if not exists lock_requested_rate          numeric,
  add column if not exists lock_requested_price         numeric,
  add column if not exists lock_requested_apr           numeric,
  add column if not exists lock_requested_monthly_pmt   numeric,
  add column if not exists lock_requested_lender        text,
  add column if not exists lock_requested_product       text,
  add column if not exists lock_requested_loan_amount   numeric,
  add column if not exists lock_requested_loan_type     text,

  -- Lock terms
  add column if not exists lock_period_days             integer,   -- 15 | 30 | 45 | 60
  add column if not exists lock_requested_close_date    date,

  -- LO pre-submission confirmations
  add column if not exists lock_pricing_confirmed_by_lo boolean not null default false,
  add column if not exists lock_pricing_confirmed_at    timestamptz,
  add column if not exists lock_pricing_age_minutes     integer,   -- how stale was pricing at submit

  -- Notes from LO to lock desk
  add column if not exists lock_lo_notes                text,

  -- Lock desk outcome (filled by ops)
  add column if not exists lock_confirmed_rate          numeric,
  add column if not exists lock_confirmed_price         numeric,
  add column if not exists lock_confirmed_apr           numeric,
  add column if not exists lock_confirmed_lock_period   integer,
  add column if not exists lock_confirmed_lock_date     date,
  add column if not exists lock_confirmed_exp_date      date,
  add column if not exists lock_confirmation_number     text,
  add column if not exists lock_confirmed_lender        text,
  add column if not exists lock_desk_notes              text;

create index if not exists lo_requests_lock_period_idx on public.lift_off_requests(lock_period_days);
