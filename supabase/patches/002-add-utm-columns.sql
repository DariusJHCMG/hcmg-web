-- ═══════════════════════════════════════════════════════════════════
-- HCMG Portal — Add UTM attribution columns to leads table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content  text,
  add column if not exists utm_term     text;

create index if not exists leads_utm_source_idx on public.leads(utm_source);
