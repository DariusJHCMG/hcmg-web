-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Incomplete flow + Assignment + Multi-role
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Multi-role: replace liftoff_role (text) with liftoff_roles (text[]) ────
alter table public.profiles
  add column if not exists liftoff_roles text[] not null default '{}';

-- Copy existing single-role data into the new array column
update public.profiles
  set liftoff_roles = array[liftoff_role]
  where liftoff_role is not null;

-- Drop old column and its index
drop index if exists profiles_liftoff_role_idx;
alter table public.profiles drop column if exists liftoff_role;

-- GIN index for array containment queries
create index if not exists profiles_liftoff_roles_idx
  on public.profiles using gin(liftoff_roles);

-- ── 2. Feature A: incomplete + resubmission columns ──────────────────────────
alter table public.lift_off_requests
  add column if not exists incomplete_reasons        jsonb,
  add column if not exists incomplete_notes          text,
  add column if not exists incomplete_at             timestamptz,
  add column if not exists incomplete_by_name        text,
  add column if not exists resubmission_of           uuid
    references public.lift_off_requests(id) on delete set null,
  add column if not exists has_resubmission          boolean not null default false,
  add column if not exists resubmission_notes        text,
  add column if not exists resubmission_confirmed_at timestamptz;

-- ── 3. Feature B: assignment columns ─────────────────────────────────────────
alter table public.lift_off_requests
  add column if not exists assigned_to_id   uuid
    references public.profiles(id) on delete set null,
  add column if not exists assigned_to_name text,
  add column if not exists assigned_at_ts   timestamptz,
  add column if not exists assigned_by_name text;
