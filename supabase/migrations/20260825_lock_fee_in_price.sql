-- ═══════════════════════════════════════════════════════════════
-- Lift Off — Add "Is lender fee included in price?" field to lock requests
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

alter table public.lift_off_requests
  add column if not exists lock_fee_in_price boolean;
