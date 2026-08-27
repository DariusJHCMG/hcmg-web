-- ── push_subscriptions ───────────────────────────────────────────────────────
-- Stores Web Push subscription objects per employee device/browser.
-- One employee may have multiple subscriptions (iPhone, Android, desktop).
-- endpoint is unique — if a browser re-subscribes it sends the same endpoint.

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

-- Index for fetching all subscriptions for a given employee (used when sending pushes)
create index if not exists push_subs_profile_idx on public.push_subscriptions(profile_id);

alter table public.push_subscriptions enable row level security;

-- Employees can only read/write their own subscriptions
create policy "employees manage own push subscriptions"
  on public.push_subscriptions for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Service role can read all (needed for server-side push sending)
-- Note: service role bypasses RLS by default — no extra policy needed.
