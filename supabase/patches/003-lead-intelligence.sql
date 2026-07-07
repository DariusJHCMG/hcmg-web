-- ═══════════════════════════════════════════════════════════════════
-- HCMG Portal — Lead Intelligence: session tracking + events table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Add session/device columns to leads ────────────────────────
alter table public.leads
  add column if not exists session_id  text,
  add column if not exists entry_page  text,
  add column if not exists referrer    text,
  add column if not exists device      text;

create index if not exists leads_session_id_idx on public.leads(session_id);

-- ── 2. lead_events — every tracked interaction ────────────────────
create table if not exists public.lead_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  event_type  text not null,   -- page_view | funnel_step | cta_click | calculator_use
  pathname    text,
  data        jsonb,           -- flexible payload per event type
  ts          timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists lead_events_session_idx    on public.lead_events(session_id);
create index if not exists lead_events_type_idx       on public.lead_events(event_type);
create index if not exists lead_events_created_idx    on public.lead_events(created_at desc);

-- RLS: public can insert (tracker fires from browser, no auth)
alter table public.lead_events enable row level security;

create policy "public can insert events"
  on public.lead_events for insert
  with check (true);

create policy "admins can read events"
  on public.lead_events for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

-- Service role read (used by the API route for LO portal)
-- No separate policy needed — service role bypasses RLS
