-- ═══════════════════════════════════════════════════════════════
-- HCMG Portal — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null,
  role          text not null check (role in ('admin', 'developer', 'loan_officer')),
  lo_slug       text unique,           -- e.g. "lamont-harris-jr" — null for non-LOs
  nmls          text,
  phone         text,
  notify_email  text,                  -- where new-lead emails go (defaults to email)
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Admins/devs see all profiles; LOs see only their own
create policy "admins can manage profiles"
  on public.profiles for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ── Leads ─────────────────────────────────────────────────────
create table public.leads (
  id                  uuid primary key default uuid_generate_v4(),
  first_name          text not null,
  last_name           text,
  email               text not null,
  phone               text not null,
  sms_consent         boolean not null default false,
  source              text not null default 'funnel',
  goal                text,
  price_range         text,
  credit_range        text,
  income_range        text,
  notes               text,
  lo_slug             text,            -- which LO this lead belongs to
  lo_name             text,
  lo_nmls             text,
  status              text not null default 'new'
                        check (status in ('new', 'contacted', 'qualified', 'closed', 'lost')),
  estimated_buying_power_low   numeric,
  estimated_buying_power_high  numeric,
  estimated_monthly_payment    numeric,
  recommended_loan_type        text,
  ip_address          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Admins/devs see all leads
create policy "admins see all leads"
  on public.leads for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

-- LOs see only leads assigned to them
create policy "lo sees own leads"
  on public.leads for select
  using (
    lo_slug = (select lo_slug from public.profiles where id = auth.uid())
  );

-- Service role can insert (from API route)
create policy "service role can insert leads"
  on public.leads for insert
  with check (true);

-- ── Funnel Links ──────────────────────────────────────────────
create table public.funnel_links (
  id          uuid primary key default uuid_generate_v4(),
  lo_slug     text not null unique,
  lo_name     text not null,
  url         text not null,           -- full URL e.g. https://hcmgloans.com/go/lamont-harris-jr
  clicks      integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.funnel_links enable row level security;

create policy "admins manage funnel links"
  on public.funnel_links for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "lo reads own funnel link"
  on public.funnel_links for select
  using (
    lo_slug = (select lo_slug from public.profiles where id = auth.uid())
  );

-- ── Audit Log ─────────────────────────────────────────────────
create table public.audit_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  user_email  text,
  action      text not null,           -- e.g. "lead.created", "user.login", "user.role_changed"
  details     jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "admins see audit log"
  on public.audit_log for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "service role can insert audit"
  on public.audit_log for insert
  with check (true);

-- ── Auto-update updated_at ────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

-- ── Auto-create profile on signup ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'loan_officer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Useful indexes ────────────────────────────────────────────
create index leads_lo_slug_idx       on public.leads(lo_slug);
create index leads_created_at_idx    on public.leads(created_at desc);
create index leads_status_idx        on public.leads(status);
create index audit_log_created_idx   on public.audit_log(created_at desc);
create index audit_log_user_idx      on public.audit_log(user_id);
