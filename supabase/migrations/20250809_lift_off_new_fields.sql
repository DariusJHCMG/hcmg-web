-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Add loan_goal, matches_1003, matches_1003_changes
-- Run in: Supabase Dashboard → SQL Editor
-- Run AFTER 20250809_lift_off_porchy_fields.sql
-- ═══════════════════════════════════════════════════════════════

alter table public.lift_off_requests
  add column if not exists loan_goal            text,
  add column if not exists matches_1003         boolean,
  add column if not exists matches_1003_changes text,
  add column if not exists gift_funds_present   text
    check (gift_funds_present in ('yes','no') or gift_funds_present is null),
  add column if not exists donor_first_name     text,
  add column if not exists donor_last_name      text,
  add column if not exists donor_phone          text,
  add column if not exists donor_email          text,
  add column if not exists donor_address_1      text,
  add column if not exists donor_address_2      text,
  add column if not exists donor_city           text,
  add column if not exists donor_state              text,
  add column if not exists donor_zip                text,
  add column if not exists ready_to_submit          boolean not null default false,
  add column if not exists submission_requested_at  timestamptz;
