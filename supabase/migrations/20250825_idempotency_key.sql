-- ── idempotency_key column on lift_off_requests ──────────────────────────────
-- Stores the UUID sent in the Idempotency-Key request header by the wizard.
-- The submit API route checks this before inserting so that double-clicks and
-- network retries return the existing row ID rather than creating duplicates.

alter table public.lift_off_requests
  add column if not exists idempotency_key text null;

comment on column public.lift_off_requests.idempotency_key is
  'Client-generated UUID sent with the wizard submit request. Prevents duplicate rows on double-click or network retry.';

-- Unique partial index: enforces uniqueness only on non-null values so that
-- older rows without a key are unaffected.
create unique index if not exists idx_lift_off_requests_idempotency_key
  on public.lift_off_requests (idempotency_key)
  where idempotency_key is not null;
