-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG — Data Retention: Add archived_at to lift_off_requests
-- Migration: 20260127_data_retention_archived_at.sql
-- Run in: Supabase Dashboard → SQL Editor
--
-- LEGAL BASIS:
--   GLBA Safeguards Rule 16 CFR § 314.4 requires a data disposal component
--   in the written security program. FTC guidance states NPI must be disposed
--   of in a way that protects against unauthorized access to the information.
--
--   HUD Handbook 4000.1 § II.A.1.a.ii(G): FHA loan records must be retained
--   for 2 years post-close. VA Lender Handbook Ch. 2 requires same.
--   GLBA / state mortgage regulations: conventional loan records 7 years.
--
-- IMPLEMENTATION:
--   Soft-delete model: completed requests beyond retention period get
--   archived_at stamped. The archive cron moves them to read-only status.
--   Hard delete happens after an additional 1-year cooling period.
-- ═══════════════════════════════════════════════════════════════════════════

-- Add archived_at column
alter table public.lift_off_requests
  add column if not exists archived_at timestamptz null;

comment on column public.lift_off_requests.archived_at is
  'Set when this request has passed its legal retention period and been soft-archived. '
  'FHA/VA: 2 years post-close. Conventional: 7 years. Null = still active.';

-- Index for the archive cron (scans by archived_at + completed_at)
create index if not exists lo_requests_archived_at_idx
  on public.lift_off_requests(archived_at)
  where archived_at is not null;

create index if not exists lo_requests_completed_at_idx
  on public.lift_off_requests(completed_at)
  where completed_at is not null;
