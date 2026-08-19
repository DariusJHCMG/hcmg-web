-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — ARIVE lookup + IPAC required fields
-- Run AFTER 20250809_lift_off.sql
-- ═══════════════════════════════════════════════════════════════

-- Store the raw JSON that came back from the ARIVE/Zapier lookup
alter table public.lift_off_requests
  add column if not exists arive_lookup_raw jsonb,
  add column if not exists arive_looked_up_at timestamptz;

-- Make ARIVE loan number required going forward
-- (existing rows already in the table won't be affected by this)
alter table public.lift_off_requests
  alter column arive_loan_number set not null;

-- IPAC notes — now required (set default '' temporarily so alter doesn't fail on existing rows,
-- then drop the default so new rows must supply them)
alter table public.lift_off_requests
  alter column income_note   set default '',
  alter column property_note set default '',
  alter column assets_note   set default '',
  alter column credit_note   set default '';

alter table public.lift_off_requests
  alter column income_note   set not null,
  alter column property_note set not null,
  alter column assets_note   set not null,
  alter column credit_note   set not null;

alter table public.lift_off_requests
  alter column income_note   drop default,
  alter column property_note drop default,
  alter column assets_note   drop default,
  alter column credit_note   drop default;
