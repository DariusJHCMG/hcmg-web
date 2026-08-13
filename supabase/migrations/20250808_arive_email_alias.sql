-- SLICE by HCMG — Add arive_email column + set Lamont's permanent alias
-- This is the ONLY LO whose ARIVE email differs from their SLICE email.
-- All other LOs use the same email in both systems.
-- Safe to re-run.

-- ── 1. Add arive_email column ──────────────────────────────────────────
alter table public.profiles
  add column if not exists arive_email text;

create index if not exists profiles_arive_email_idx on public.profiles(arive_email);

-- ── 2. Set Lamont's permanent ARIVE email alias ────────────────────────
-- ARIVE stores: lamont.harris@htalmortgage.com
-- SLICE stores: lamont@hcmgloans.com
-- The arive_name alias was already set in 20250806_go_live_fixes.sql
update public.profiles
set arive_email = 'lamont.harris@htalmortgage.com'
where full_name ilike 'Lamont Harris%'
  and is_active = true;

-- ── 3. Verify ──────────────────────────────────────────────────────────
select full_name, email, arive_name, arive_email
from public.profiles
where arive_email is not null or arive_name is not null
order by full_name;
