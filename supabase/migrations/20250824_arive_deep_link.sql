-- Add arive_deep_link column to lift_off_requests
-- Stores the deep link URL returned by Zapier's ARIVE "Get Loan Details" step.
-- This allows ops team members to click directly into the file in ARIVE from
-- the queue card or the request detail page.

alter table public.lift_off_requests
  add column if not exists arive_deep_link text;

comment on column public.lift_off_requests.arive_deep_link is
  'Deep link URL to open the loan file directly in ARIVE (populated from Zapier lookup)';
