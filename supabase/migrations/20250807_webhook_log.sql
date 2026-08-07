-- SLICE by HCMG — Webhook Log Table
-- Stores every inbound webhook call for debugging and auditing.

create table if not exists public.webhook_log (
  id               uuid        primary key default gen_random_uuid(),
  received_at      timestamptz not null default now(),
  source           text        not null default 'arive',
  event_type_raw   text,
  event_type       text,
  loan_id          text,
  lo_nmls          text,
  lo_email_raw     text,
  lo_matched_id    uuid        references public.profiles(id) on delete set null,
  lo_matched_name  text,
  goal_month_id    uuid        references public.goal_months(id) on delete set null,
  goal_month_label text,
  amount           numeric(18,2),
  event_date       date,
  action           text,
  error_message    text,
  raw_payload      jsonb,
  response_body    jsonb,
  ip_address       text,
  duration_ms      integer
);

alter table public.webhook_log disable row level security;

create index if not exists webhook_log_received_idx on public.webhook_log(received_at desc);
create index if not exists webhook_log_loan_idx     on public.webhook_log(loan_id);
create index if not exists webhook_log_lo_idx       on public.webhook_log(lo_matched_id);
create index if not exists webhook_log_action_idx   on public.webhook_log(action);
create index if not exists webhook_log_source_idx   on public.webhook_log(source);
