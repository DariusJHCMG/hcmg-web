-- Reviews table for HCMG team member pages
create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  lo_slug      text,                        -- null = company-wide review
  author       text not null,
  rating       smallint not null check (rating between 1 and 5),
  text         text not null,
  scope        text not null default 'personal' check (scope in ('personal', 'company')),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);

create index if not exists reviews_lo_slug_idx  on reviews (lo_slug);
create index if not exists reviews_status_idx   on reviews (status);
create index if not exists reviews_scope_idx    on reviews (scope);
