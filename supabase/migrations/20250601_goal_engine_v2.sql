-- ═══════════════════════════════════════════════════════════════
-- HCMG SLICE — Goal Engine v2 Migration
-- Uses TEXT user IDs matching the Prisma "User" table (cuid)
-- No foreign keys to non-existent "profiles" table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Monthly Goals ─────────────────────────────────────────────
create table if not exists public.goal_months (
  id                    uuid primary key default gen_random_uuid(),
  month_label           text not null,
  month_year            integer not null,
  month_num             integer not null check (month_num between 1 and 12),
  funded_volume_goal    numeric(18,2) not null default 0,
  funded_units_goal     integer not null default 0,
  app_volume_goal       numeric(18,2) not null default 0,
  app_units_goal        integer not null default 0,
  clo_message           text,
  awards_enabled        boolean not null default true,
  start_date            date not null,
  end_date              date not null,
  email_send_at         timestamptz,
  emails_sent           boolean not null default false,
  is_published          boolean not null default false,
  created_by            text,   -- "User".id (cuid)
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (month_year, month_num)
);

-- ── Commitments ───────────────────────────────────────────────
create table if not exists public.goal_commitments (
  id                        uuid primary key default gen_random_uuid(),
  goal_month_id             uuid not null references public.goal_months(id) on delete cascade,
  profile_id                text not null,   -- "User".id (cuid)
  funded_volume_commitment  numeric(18,2) not null default 0,
  funded_units_commitment   integer not null default 0,
  app_volume_commitment     numeric(18,2) not null default 0,
  app_units_commitment      integer not null default 0,
  biggest_focus             text,
  biggest_challenge         text,
  confidence_pct            integer check (confidence_pct between 0 and 100),
  comments                  text,
  digital_agreement         boolean not null default false,
  locked                    boolean not null default false,
  submitted_at              timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  unique (goal_month_id, profile_id)
);

-- ── Production Records ────────────────────────────────────────
create table if not exists public.goal_production (
  id                uuid primary key default gen_random_uuid(),
  profile_id        text not null,           -- "User".id (cuid)
  goal_month_id     uuid references public.goal_months(id) on delete set null,
  loan_id           text,
  funded_date       date,
  funded_volume     numeric(18,2),
  funded_unit       integer default 0,
  app_date          date,
  app_volume        numeric(18,2),
  app_unit          integer default 0,
  source            text not null default 'zapier',
  raw_payload       jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Awards ────────────────────────────────────────────────────
create table if not exists public.goal_awards (
  id              uuid primary key default gen_random_uuid(),
  goal_month_id   uuid not null references public.goal_months(id) on delete cascade,
  profile_id      text not null,             -- "User".id (cuid)
  award_type      text not null,
  award_label     text not null,
  award_emoji     text,
  stats_snapshot  jsonb,
  certificate_url text,
  email_sent      boolean not null default false,
  issued_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- ── Email Log ─────────────────────────────────────────────────
create table if not exists public.goal_email_log (
  id              uuid primary key default gen_random_uuid(),
  goal_month_id   uuid references public.goal_months(id) on delete set null,
  profile_id      text,                      -- "User".id (cuid)
  email_type      text not null,
  recipient_email text not null,
  subject         text,
  resend_id       text,
  sent_at         timestamptz not null default now()
);

-- ── Notifications ─────────────────────────────────────────────
create table if not exists public.goal_notifications (
  id              uuid primary key default gen_random_uuid(),
  profile_id      text not null,             -- "User".id (cuid)
  title           text not null,
  body            text,
  type            text not null default 'info',
  read            boolean not null default false,
  link            text,
  created_at      timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists goal_commitments_month_idx   on public.goal_commitments(goal_month_id);
create index if not exists goal_commitments_profile_idx on public.goal_commitments(profile_id);
create index if not exists goal_production_profile_idx  on public.goal_production(profile_id);
create index if not exists goal_production_month_idx    on public.goal_production(goal_month_id);
create index if not exists goal_awards_month_idx        on public.goal_awards(goal_month_id);
create index if not exists goal_awards_profile_idx      on public.goal_awards(profile_id);
create index if not exists goal_notif_profile_idx       on public.goal_notifications(profile_id);
create index if not exists goal_notif_read_idx          on public.goal_notifications(profile_id, read);
create index if not exists goal_production_loan_idx     on public.goal_production(loan_id);

-- ── Disable RLS (service-role always bypasses; we auth in API layer) ──
-- These tables are internal — all access is via service role in API routes.
-- No Supabase auth.uid() integration needed since auth is Porchy session-based.
alter table public.goal_months        disable row level security;
alter table public.goal_commitments   disable row level security;
alter table public.goal_production    disable row level security;
alter table public.goal_awards        disable row level security;
alter table public.goal_email_log     disable row level security;
alter table public.goal_notifications disable row level security;

-- ── Leaderboard view ─────────────────────────────────────────
-- Joins commitment + production; user name/avatar fetched in API layer
create or replace view public.goal_leaderboard as
  select
    c.goal_month_id,
    c.profile_id,
    c.funded_volume_commitment,
    c.funded_units_commitment,
    c.app_volume_commitment,
    c.app_units_commitment,
    c.confidence_pct,
    c.submitted_at,
    coalesce(sum(pr.funded_volume), 0)::numeric(18,2) as funded_volume_actual,
    coalesce(sum(pr.funded_unit),   0)::integer        as funded_units_actual,
    coalesce(sum(pr.app_volume),    0)::numeric(18,2)  as app_volume_actual,
    coalesce(sum(pr.app_unit),      0)::integer        as app_units_actual
  from public.goal_commitments c
  left join public.goal_production pr
    on pr.profile_id = c.profile_id
    and pr.goal_month_id = c.goal_month_id
  group by
    c.goal_month_id, c.profile_id,
    c.funded_volume_commitment, c.funded_units_commitment,
    c.app_volume_commitment, c.app_units_commitment,
    c.confidence_pct, c.submitted_at;

-- ── updated_at auto-update function (if not already exists) ──
create or replace function public.goal_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger goal_months_updated_at
  before update on public.goal_months
  for each row execute procedure public.goal_set_updated_at();

create or replace trigger goal_commitments_updated_at
  before update on public.goal_commitments
  for each row execute procedure public.goal_set_updated_at();

create or replace trigger goal_production_updated_at
  before update on public.goal_production
  for each row execute procedure public.goal_set_updated_at();
