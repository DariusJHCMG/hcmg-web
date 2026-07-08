-- Co-branded LO + Realtor funnel pages
create table if not exists co_branded_pages (
  id                uuid primary key default gen_random_uuid(),
  lo_slug           text not null,
  realtor_slug      text not null,                    -- URL-safe, auto-generated
  realtor_name      text not null,
  realtor_company   text not null,
  realtor_phone     text,
  realtor_email     text,
  realtor_license   text,
  realtor_photo_url text,
  realtor_logo_url  text,
  headline          text,                              -- optional custom hero headline
  is_active         boolean not null default true,
  clicks            integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (lo_slug, realtor_slug)
);

create index if not exists co_branded_lo_slug_idx on co_branded_pages (lo_slug);
create index if not exists co_branded_active_idx  on co_branded_pages (is_active);
