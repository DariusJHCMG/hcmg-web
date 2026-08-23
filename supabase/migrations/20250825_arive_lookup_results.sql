-- ── arive_lookup_results ─────────────────────────────────────────────────────
-- Short-lived store for ARIVE lookup results brokered through Zapier.
--
-- Flow:
--   1. Browser fires  POST /api/liftoff/arive-lookup  → inserts a pending row
--   2. Zapier fetches ARIVE data, POSTs back to       POST /api/liftoff/arive-result
--      which upserts result_json + found + expires_at
--   3. Browser polls  GET  /api/liftoff/arive-poll?id → reads row, deletes it
--
-- Rows are intentionally short-lived (TTL 120 seconds).
-- The cron-based cleanup below prevents orphaned rows from building up
-- if a poll never fires (e.g. user navigates away mid-lookup).

create table if not exists public.arive_lookup_results (
  request_id   text        primary key,
  result_json  jsonb       null,           -- null = still pending
  found        boolean     not null default false,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '120 seconds')
);

comment on table public.arive_lookup_results is
  'Short-lived ARIVE lookup result broker. Rows expire after 120 s and are deleted on read.';

-- Index for the poll query (equality on primary key already indexed, but also
-- need fast expired-row cleanup).
create index if not exists idx_arive_lookup_expires
  on public.arive_lookup_results (expires_at);

-- Row-level security: this table is accessed only via the service role from API
-- routes. Deny all direct client access.
alter table public.arive_lookup_results enable row level security;
-- No permissive policies → service role bypasses RLS, all other roles blocked.

-- ── Cleanup function: delete all expired rows ─────────────────────────────────
-- Call manually or wire to pg_cron / Supabase cron (optional):
--   select cron.schedule('arive-lookup-cleanup', '* * * * *',
--     $$delete from public.arive_lookup_results where expires_at < now()$$);
create or replace function public.cleanup_arive_lookup_results()
returns void language sql security definer as $$
  delete from public.arive_lookup_results where expires_at < now();
$$;
