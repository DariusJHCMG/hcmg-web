-- ═══════════════════════════════════════════════════════════════════
-- HCMG Portal — Extend profiles table for public website team pages
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists title           text,          -- public job title, e.g. "Loan Officer"
  add column if not exists short_bio       text,          -- 1-2 sentence bio shown on team page
  add column if not exists offices         text[],        -- e.g. '{"Las Vegas, NV","Houston, TX"}'
  add column if not exists linkedin        text,          -- full LinkedIn URL
  add column if not exists licensed_states text[],        -- e.g. '{"NV","TX","FL"}'
  add column if not exists show_on_website boolean not null default true;

-- Index for public team page query (active + show_on_website)
create index if not exists profiles_website_idx
  on public.profiles(is_active, show_on_website);
