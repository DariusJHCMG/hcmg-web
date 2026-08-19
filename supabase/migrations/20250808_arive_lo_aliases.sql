-- SLICE by HCMG — Permanent ARIVE ↔ SLICE LO mapping patch
-- Adds arive_email column so the /zapier route can match LOs whose
-- ARIVE-stored email differs from their SLICE login email.
-- Sets permanent arive_name + arive_email aliases for every LO where
-- ARIVE sends a different name or email than what SLICE stores.
--
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to re-run (all idempotent).

-- ── 1. Add arive_email column ──────────────────────────────────────────
alter table public.profiles
  add column if not exists arive_email text;

create index if not exists profiles_arive_email_idx on public.profiles(arive_email);
create index if not exists profiles_arive_name_idx  on public.profiles(arive_name);
create index if not exists profiles_nmls_idx        on public.profiles(nmls);

-- ── 2. Set permanent aliases for every known LO mismatch ───────────────
-- Format: SLICE full_name → arive_name (what ARIVE sends as Loan Officer Name)
--         SLICE email     → arive_email (what ARIVE sends as Loan Officer Email)
--
-- Add a row here any time a new LO's ARIVE name/email differs from SLICE.

update public.profiles set
  arive_name  = 'Lamont Harris',
  arive_email = 'lamont.harris@htalmortgage.com',
  nmls        = '491049'
where full_name ilike 'Lamont Harris%'
  and is_active = true;

update public.profiles set
  arive_name  = 'Aaron Clark',
  arive_email = 'aaron.clark@hcmgloans.com',
  nmls        = '1588427'
where full_name ilike 'Aaron Clark%'
  and is_active = true;

update public.profiles set
  arive_name  = 'Darius James',
  nmls        = '1097168'
where full_name ilike 'Darius James%'
  and is_active = true;

update public.profiles set
  arive_name  = 'QuTeece Square',
  nmls        = '1930150'
where full_name ilike 'QuTeece%'
  and is_active = true;

-- ── 3. Verify ──────────────────────────────────────────────────────────
select full_name, email, nmls, arive_name, arive_email
from public.profiles
where is_active = true
order by full_name;
