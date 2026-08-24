-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Add self_employed_borrower column
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════
-- Tracks whether any borrower on the loan is self-employed or 1099.
-- Drives the correct document checklist at submission time.
-- doc_checklist_json is already jsonb — no migration needed for
-- the expanded { na, naNote } shape; existing rows are backward-compatible.

alter table public.lift_off_requests
  add column if not exists self_employed_borrower boolean;
