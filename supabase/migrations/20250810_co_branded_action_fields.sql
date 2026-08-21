-- ═══════════════════════════════════════════════════════════════
-- Co-branded pages — application URL, calendar URL, click counters
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

alter table public.co_branded_pages
  add column if not exists application_url      text,
  add column if not exists calendar_url         text,
  add column if not exists app_clicks           integer not null default 0,
  add column if not exists book_call_clicks     integer not null default 0,
  add column if not exists bookings_completed   integer not null default 0;
