-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Remove wire_request and adverse request types
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop old check constraint and replace with updated one
alter table public.lift_off_requests
  drop constraint if exists lift_off_requests_request_type_check;

alter table public.lift_off_requests
  add constraint lift_off_requests_request_type_check
  check (request_type in (
    'register_disclosure',
    'disclosure_only',
    'submission',
    'restructure_suspense'
  ));
