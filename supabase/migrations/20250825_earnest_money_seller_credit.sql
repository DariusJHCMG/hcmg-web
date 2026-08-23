-- Add earnest_money_deposit and seller_credit to lift_off_requests
-- Both are populated from ARIVE via the Zapier lookup and shown in the
-- wizard (register_disclosure, disclosure_only, submission) and detail page.

alter table public.lift_off_requests
  add column if not exists earnest_money_deposit numeric null,
  add column if not exists seller_credit         numeric null;

comment on column public.lift_off_requests.earnest_money_deposit is
  'Earnest money deposit amount from ARIVE (auto-filled via Zapier lookup)';
comment on column public.lift_off_requests.seller_credit is
  'Seller credit / concession amount from ARIVE (auto-filled via Zapier lookup)';
