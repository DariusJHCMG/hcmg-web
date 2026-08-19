-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Request table
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Request type enum values ─────────────────────────────────
-- register_disclosure | disclosure_only | submission
-- restructure_suspense | wire_request | adverse

create table if not exists public.lift_off_requests (
  id                      uuid        primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- ── Who submitted ──────────────────────────────────────────
  submitter_id            uuid        not null references public.profiles(id) on delete restrict,
  submitter_name          text        not null,
  submitter_nmls          text,

  -- ── Request classification ──────────────────────────────────
  request_type            text        not null
    check (request_type in (
      'register_disclosure',
      'disclosure_only',
      'submission',
      'restructure_suspense',
      'wire_request',
      'adverse'
    )),
  request_status          text        not null default 'pending'
    check (request_status in (
      'pending',       -- submitted, awaiting ops pickup
      'in_review',     -- ops is working it
      'action_needed', -- returned to LO
      'completed',     -- done
      'cancelled'      -- voided
    )),

  -- ── Loan identity ───────────────────────────────────────────
  arive_loan_number       text,
  carried_forward_ids     text,        -- comma-separated prior LiftOff IDs
  loan_type               text,        -- purchase | refinance | heloc | etc.
  loan_amount             numeric,
  purchase_price          numeric,

  -- ── Borrower ────────────────────────────────────────────────
  borrower_first_name     text        not null,
  borrower_last_name      text        not null,
  co_borrower_first_name  text,
  co_borrower_last_name   text,

  -- ── Property ────────────────────────────────────────────────
  property_address        text,
  property_city           text,
  property_state          text,
  property_zip            text,
  target_close_date       date,

  -- ── Lock / rate ─────────────────────────────────────────────
  lock_status             text        -- locked | floating | lock_required
    check (lock_status in ('locked','floating','lock_required') or lock_status is null),
  float_reason            text,

  -- ── Notes & docs checklist ──────────────────────────────────
  income_note             text,
  property_note           text,
  assets_note             text,
  credit_note             text,
  special_instructions    text,
  team_notes              text,
  doc_checklist_json      jsonb,       -- array of {label, checked} objects

  -- ── Restructure / Suspense fields ───────────────────────────
  suspense_reason         text,
  suspense_notes          text,
  reason_fixed            boolean,

  -- ── Wire Request fields ──────────────────────────────────────
  wire_lender             text,
  wire_lender_loan_number text,
  wire_branch             text,
  wire_closing_date       date,
  wire_lock_date          date,
  wire_lock_exp_date      date,
  wire_disbursement_date  date,
  wire_settlement_agent_name  text,
  wire_settlement_agent_email text,
  wire_balanced_with_title    boolean,
  wire_final_cd_key       text,
  wire_final_cd_name      text,
  wire_approvals_json     jsonb,       -- [{approver_id, approved_at, role}]
  wire_outcome            text,
  wire_expires_at         timestamptz,
  wire_requestor_email    text,

  -- ── Adverse fields ───────────────────────────────────────────
  adverse_reason          text,
  adverse_notes           text,
  adverse_outcome         text,
  adverse_withdraw_from_portal    boolean,
  adverse_leader_attempted_resell boolean,
  adverse_open_appraisal_order    boolean,
  adverse_appraisal_disposition   text,

  -- ── Ops / processing ─────────────────────────────────────────
  assigned_processor_name     text,
  assigned_processor_email    text,
  assigned_processor_company  text,
  assigned_at                 timestamptz,
  block_reason                text,
  blocked_at_stage            text,
  return_reason               text,
  registered_at               timestamptz,

  -- ── LO certification ─────────────────────────────────────────
  certified_at            timestamptz,  -- when LO checked "I certify..."
  certified_by_name       text
);

-- Updated-at trigger
create or replace trigger lift_off_updated_at
  before update on public.lift_off_requests
  for each row execute procedure public.handle_updated_at();

-- Indexes
create index if not exists lo_requests_submitter_idx on public.lift_off_requests(submitter_id);
create index if not exists lo_requests_status_idx    on public.lift_off_requests(request_status);
create index if not exists lo_requests_type_idx      on public.lift_off_requests(request_type);
create index if not exists lo_requests_created_idx   on public.lift_off_requests(created_at desc);
create index if not exists lo_requests_arive_idx     on public.lift_off_requests(arive_loan_number);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.lift_off_requests enable row level security;

-- LOs see only their own requests
create policy "lo sees own lift off requests"
  on public.lift_off_requests for select
  using (submitter_id = auth.uid());

-- LOs can insert their own requests
create policy "lo can submit lift off request"
  on public.lift_off_requests for insert
  with check (submitter_id = auth.uid());

-- LOs can update their own pending requests (e.g. before submit or when returned)
create policy "lo can update own pending request"
  on public.lift_off_requests for update
  using (
    submitter_id = auth.uid()
    and request_status in ('pending', 'action_needed')
  );

-- Admins and developers see + manage all
create policy "admins manage all lift off requests"
  on public.lift_off_requests for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

-- Service role can do anything (API routes)
create policy "service role full access"
  on public.lift_off_requests for all
  using (true)
  with check (true);
