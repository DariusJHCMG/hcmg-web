-- ═══════════════════════════════════════════════════════════════
-- HCMG Patch 007 — Starting Now Referrals
-- Creates the starting_now_referrals table for the Phase 1 & Phase 2
-- Starting Now Credit Repair integration.
--
-- Compliance: GLBA Reg P borrower consent timestamp included.
-- Credit scores (Experian/Equifax/TransUnion) stored here — never
-- transmitted in email bodies per NPI handling policy.
-- ═══════════════════════════════════════════════════════════════

create table public.starting_now_referrals (
  id                              uuid primary key default gen_random_uuid(),
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now(),

  -- Link back to the originating Lift Off request (nullable — for future standalone use)
  lift_off_request_id             uuid references public.lift_off_requests(id) on delete set null,

  -- Submitting LO
  submitter_id                    uuid not null references auth.users(id) on delete cascade,
  submitter_name                  text not null,
  submitter_email                 text,
  submitter_nmls                  text,

  -- Consumer (borrower) info sent to Starting Now
  arive_loan_number               text,
  borrower_first_name             text not null,
  borrower_last_name              text not null,
  borrower_email                  text,
  borrower_phone                  text,
  borrower_city                   text,
  borrower_state                  text,
  partner_notes                   text,

  -- GLBA Reg P — borrower consent must be confirmed before referral is sent
  borrower_consent_confirmed_at   timestamptz,

  -- Starting Now system IDs (populated after send / first status update)
  startingnow_id                  text,           -- ENG-xxxxx assigned by Starting Now
  external_crm_contact_id         text,           -- our row id stringified, sent as Partner reference

  -- Outbound send tracking
  sent_at                         timestamptz,
  send_status                     text not null default 'pending'
                                    check (send_status in ('pending', 'sent', 'failed')),
  send_error                      text,
  send_response_raw               jsonb,

  -- Latest status from Starting Now (updated by Phase 2 inbound webhook)
  -- NOTE: credit scores (experian/equifax/transunion) are NPI — never include
  -- these fields in email notification bodies. Viewable in authenticated UI only.
  current_status                  text,
  follow_up_date                  date,
  experian                        text,
  equifax                         text,
  transunion                      text,
  latest_notes                    text,
  opt_out                         text[],         -- ["SMS", "Email", "Phone"] per Starting Now
  last_update_at                  timestamptz,

  -- Append-only status history — each entry matches StartingNowStatusHistoryEntry type
  status_history_json             jsonb not null default '[]'::jsonb
);

-- Indexes for inbound webhook lookups and dashboard queries
create index on public.starting_now_referrals (external_crm_contact_id);
create index on public.starting_now_referrals (startingnow_id);
create index on public.starting_now_referrals (submitter_id);
create index on public.starting_now_referrals (lift_off_request_id);
create index on public.starting_now_referrals (send_status);

-- Auto-update updated_at on every write
create trigger starting_now_referrals_updated_at
  before update on public.starting_now_referrals
  for each row execute function public.handle_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.starting_now_referrals enable row level security;

-- LOs see only their own referrals; admins/developers see all
create policy "LO sees own Starting Now referrals"
  on public.starting_now_referrals for select
  using (
    submitter_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'developer')
    )
  );

-- All writes go through service role (server-side API routes only)
create policy "Service role full access"
  on public.starting_now_referrals for all
  using (auth.role() = 'service_role');
