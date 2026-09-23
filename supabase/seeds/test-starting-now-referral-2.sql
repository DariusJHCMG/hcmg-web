-- ═══════════════════════════════════════════════════════════════
-- HCMG Test Seed — Starting Now Phase 2 Demo Referral #2
-- Borrower:   Jasmine Carter
-- ARIVE Loan: HCMG-SN-TEST2
-- Status:     Follow Up (consultation scheduled — shows follow_up_date)
-- Scores:     EX 612 / EQ 598 / TU 621 (early stage)
--
-- Run this in the Supabase SQL editor AFTER running:
--   supabase/migrations/20260920_lift_off_credit_repair_type.sql
-- ═══════════════════════════════════════════════════════════════

-- ── Step 1: Lift Off request row ─────────────────────────────────
INSERT INTO public.lift_off_requests (
  id,
  request_type,
  request_status,
  submitter_id,
  submitter_name,
  submitter_email,
  submitter_nmls,
  borrower_first_name,
  borrower_last_name,
  arive_loan_number,
  certified_at,
  certified_by_name,
  income_note,
  property_note,
  assets_note,
  credit_note,
  created_at,
  updated_at
) VALUES (
  'c3d4e5f6-0002-0002-0002-000000000002'::uuid,
  'credit_repair_referral',
  'completed',
  '736a599a-492a-4585-b845-74b264d0ac9e'::uuid,
  'Darius James',
  'darius@hcmgloans.com',
  '1918223',
  'Jasmine',
  'Carter',
  'HCMG-SN-TEST2',
  now() - interval '1 day',
  'Darius James',
  '', '', '', '',
  now() - interval '1 day',
  now() - interval '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- ── Step 2: Starting Now referral row ────────────────────────────
INSERT INTO public.starting_now_referrals (
  id,
  lift_off_request_id,
  submitter_id,
  submitter_name,
  submitter_email,
  submitter_nmls,
  arive_loan_number,
  borrower_first_name,
  borrower_last_name,
  borrower_email,
  borrower_phone,
  borrower_city,
  borrower_state,
  partner_notes,
  borrower_consent_confirmed_at,
  external_crm_contact_id,
  startingnow_id,
  sent_at,
  send_status,
  send_error,
  current_status,
  follow_up_date,
  experian,
  equifax,
  transunion,
  latest_notes,
  opt_out,
  last_update_at,
  status_history_json,
  created_at,
  updated_at
) VALUES (
  'd4e5f6a7-0002-0002-0002-000000000002'::uuid,
  'c3d4e5f6-0002-0002-0002-000000000002'::uuid,
  '736a599a-492a-4585-b845-74b264d0ac9e'::uuid,
  'Darius James',
  'darius@hcmgloans.com',
  '1918223',
  'HCMG-SN-TEST2',
  'Jasmine',
  'Carter',
  'jasmine.carter.test@hcmgloans.com',
  '4435550284',
  'Owings Mills',
  'Maryland',
  'Conventional purchase — Jasmine is close but needs a 20-point bump to qualify. Motivated buyer.',
  now() - interval '1 day',
  'd4e5f6a7-0002-0002-0002-000000000002',
  'ENG-11223',
  now() - interval '1 day',
  'sent',
  null,
  'Follow Up',
  (now() + interval '2 days')::date,
  '612',
  '598',
  '621',
  'Jasmine responded quickly. Consultation scheduled for Friday at 11AM ET. Starting Now reviewing credit report now.',
  '{}',
  now() - interval '6 hours',
  jsonb_build_array(
    jsonb_build_object(
      'status',      'Attempting Contact',
      'updated_at',  (now() - interval '22 hours')::text,
      'notes',       'Initial outreach sent via email and SMS.'
    ),
    jsonb_build_object(
      'status',      'Follow Up',
      'updated_at',  (now() - interval '6 hours')::text,
      'experian',    '612',
      'equifax',     '598',
      'transunion',  '621',
      'notes',       'Jasmine responded quickly. Consultation scheduled for Friday at 11AM ET. Starting Now reviewing credit report now.',
      'follow_up_date', (now() + interval '2 days')::date
    )
  ),
  now() - interval '1 day',
  now() - interval '6 hours'
)
ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────
SELECT
  snr.borrower_first_name || ' ' || snr.borrower_last_name AS borrower,
  snr.arive_loan_number,
  snr.send_status,
  snr.current_status,
  snr.follow_up_date,
  snr.experian,
  snr.equifax,
  snr.transunion,
  snr.startingnow_id,
  jsonb_array_length(snr.status_history_json) AS history_entries
FROM public.starting_now_referrals snr
WHERE snr.id = 'd4e5f6a7-0002-0002-0002-000000000002'::uuid;
