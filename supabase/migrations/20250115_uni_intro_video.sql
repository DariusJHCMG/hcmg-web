-- uni_settings: generic key-value store for HCMG U configuration
create table if not exists uni_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Seed the intro video key (URL set by admin via media upload)
insert into uni_settings (key, value)
values ('intro_video_path', null)
on conflict (key) do nothing;

-- uni_intro_video_views: tracks who has completed the intro video
create table if not exists uni_intro_video_views (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (profile_id)
);

-- Index for fast lookup by profile
create index if not exists uni_intro_video_views_profile_idx on uni_intro_video_views (profile_id);
