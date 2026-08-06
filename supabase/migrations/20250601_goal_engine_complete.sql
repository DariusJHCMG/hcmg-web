-- ═══════════════════════════════════════════════════════════════
-- HCMG SLICE — Complete Setup Migration
-- Step 1: profiles table (mirrors auth.users)
-- Step 2: Goal Engine tables (goal_months, commitments, production, etc.)
-- Step 3: Leaderboard view
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ═══════════════════════════════════════════════════════════════

-- ── 1. PROFILES ──────────────────────────────────────────────
-- One row per Supabase auth user.
-- Create a user in Supabase Auth → they get a row here via trigger below.

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  role          text not null default 'loan_officer'
                check (role in ('admin','developer','loan_officer')),
  nmls          text,
  phone         text,
  notify_email  text,
  avatar_url    text,
  is_active     boolean not null default true,
  -- Website fields
  title         text,
  short_bio     text,
  lo_slug       text unique,
  -- ARIVE mapping
  arive_lo_id   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "service role full access"
  on public.profiles for all
  using (true)
  with check (true);

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'loan_officer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Updated-at helper
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ── 2. GOAL ENGINE TABLES ────────────────────────────────────

-- Monthly Goals
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
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (month_year, month_num)
);

alter table public.goal_months enable row level security;

create policy "admins manage goal_months"
  on public.goal_months for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','developer')
  );

create policy "authenticated users read published goals"
  on public.goal_months for select
  using (is_published = true and auth.uid() is not null);

create or replace trigger goal_months_updated_at
  before update on public.goal_months
  for each row execute procedure public.handle_updated_at();

-- Commitments
create table if not exists public.goal_commitments (
  id                        uuid primary key default gen_random_uuid(),
  goal_month_id             uuid not null references public.goal_months(id) on delete cascade,
  profile_id                uuid not null references public.profiles(id) on delete cascade,
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

alter table public.goal_commitments enable row level security;

create policy "admins manage commitments"
  on public.goal_commitments for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','developer')
  );

create policy "lo reads own commitment"
  on public.goal_commitments for select
  using (profile_id = auth.uid());

create policy "lo inserts own commitment"
  on public.goal_commitments for insert
  with check (profile_id = auth.uid());

create policy "lo updates own unlocked commitment"
  on public.goal_commitments for update
  using (profile_id = auth.uid() and locked = false);

create or replace trigger goal_commitments_updated_at
  before update on public.goal_commitments
  for each row execute procedure public.handle_updated_at();

-- Production Records (from Zapier/ARIVE)
create table if not exists public.goal_production (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  goal_month_id     uuid references public.goal_months(id) on delete set null,
  loan_id           text unique,
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

alter table public.goal_production enable row level security;

create policy "admins manage production"
  on public.goal_production for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','developer')
  );

create policy "lo reads own production"
  on public.goal_production for select
  using (profile_id = auth.uid());

create or replace trigger goal_production_updated_at
  before update on public.goal_production
  for each row execute procedure public.handle_updated_at();

-- Awards
create table if not exists public.goal_awards (
  id              uuid primary key default gen_random_uuid(),
  goal_month_id   uuid not null references public.goal_months(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  award_type      text not null,
  award_label     text not null,
  award_emoji     text,
  stats_snapshot  jsonb,
  certificate_url text,
  email_sent      boolean not null default false,
  issued_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

alter table public.goal_awards enable row level security;

create policy "admins manage awards"
  on public.goal_awards for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','developer')
  );

create policy "authenticated users see all awards"
  on public.goal_awards for select
  using (auth.uid() is not null);

-- Email Log
create table if not exists public.goal_email_log (
  id              uuid primary key default gen_random_uuid(),
  goal_month_id   uuid references public.goal_months(id) on delete set null,
  profile_id      uuid references public.profiles(id) on delete set null,
  email_type      text not null,
  recipient_email text not null,
  subject         text,
  resend_id       text,
  sent_at         timestamptz not null default now()
);

alter table public.goal_email_log enable row level security;

create policy "admins read email log"
  on public.goal_email_log for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','developer')
  );

create policy "service insert email log"
  on public.goal_email_log for insert
  with check (true);

-- Notifications
create table if not exists public.goal_notifications (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  body            text,
  type            text not null default 'info',
  read            boolean not null default false,
  link            text,
  created_at      timestamptz not null default now()
);

alter table public.goal_notifications enable row level security;

create policy "user manages own notifications"
  on public.goal_notifications for all
  using (profile_id = auth.uid());

create policy "service inserts notifications"
  on public.goal_notifications for insert
  with check (true);

-- ── 3. INDEXES ───────────────────────────────────────────────
create index if not exists goal_commitments_month_idx   on public.goal_commitments(goal_month_id);
create index if not exists goal_commitments_profile_idx on public.goal_commitments(profile_id);
create index if not exists goal_production_profile_idx  on public.goal_production(profile_id);
create index if not exists goal_production_month_idx    on public.goal_production(goal_month_id);
create index if not exists goal_production_loan_idx     on public.goal_production(loan_id);
create index if not exists goal_awards_month_idx        on public.goal_awards(goal_month_id);
create index if not exists goal_awards_profile_idx      on public.goal_awards(profile_id);
create index if not exists goal_notif_profile_idx       on public.goal_notifications(profile_id);
create index if not exists goal_notif_read_idx          on public.goal_notifications(profile_id, read);
create index if not exists profiles_email_idx           on public.profiles(email);
create index if not exists profiles_arive_idx           on public.profiles(arive_lo_id);
create index if not exists profiles_nmls_idx            on public.profiles(nmls);

-- ── 4. LEADERBOARD VIEW ──────────────────────────────────────
create or replace view public.goal_leaderboard as
  select
    c.goal_month_id,
    c.profile_id,
    p.full_name,
    p.avatar_url,
    p.nmls,
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
  join public.profiles p on p.id = c.profile_id
  left join public.goal_production pr
    on pr.profile_id = c.profile_id
    and pr.goal_month_id = c.goal_month_id
  group by
    c.goal_month_id, c.profile_id,
    p.full_name, p.avatar_url, p.nmls,
    c.funded_volume_commitment, c.funded_units_commitment,
    c.app_volume_commitment, c.app_units_commitment,
    c.confidence_pct, c.submitted_at;
