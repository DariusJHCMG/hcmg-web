-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Roles + workflow timestamps
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Lift Off role on profiles ─────────────────────────────────
alter table public.profiles
  add column if not exists liftoff_role text
    check (liftoff_role in ('liftoff_admin','liftoff_team','lock_desk_admin') or liftoff_role is null);

create index if not exists profiles_liftoff_role_idx on public.profiles(liftoff_role);

-- ── 2. Workflow tracking on lift_off_requests ────────────────────
alter table public.lift_off_requests
  -- Who claimed it and when
  add column if not exists claimed_by_id    uuid references public.profiles(id) on delete set null,
  add column if not exists claimed_by_name  text,
  add column if not exists claimed_at       timestamptz,

  -- When work started (processor hit "Start")
  add column if not exists started_at       timestamptz,

  -- When completed
  add column if not exists completed_at     timestamptz,

  -- In-flight / completion email audit
  add column if not exists inflight_email_sent_at   timestamptz,
  add column if not exists completed_email_sent_at  timestamptz;

create index if not exists lo_requests_claimed_by_idx on public.lift_off_requests(claimed_by_id);
create index if not exists lo_requests_claimed_at_idx on public.lift_off_requests(claimed_at);
