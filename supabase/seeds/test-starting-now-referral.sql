-- ═══════════════════════════════════════════════════════════════
-- HCMG Test Seed — Starting Now Phase 2 Demo Referral
-- Run this in the Supabase SQL editor AFTER running the constraint
-- fix migration (20260920_lift_off_credit_repair_type.sql).
--
-- Creates: Marcus Washington test referral under Darius James
-- Status:  Enrolled with full 4-step history + credit scores
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
  'a1b2c3d4-0001-0001-0001-000000000001'::uuid,
  'credit_repair_referral',
  'completed',
  '736a599a-492a-4585-b845-74b264d0ac9e'::uuid,
  'Darius James',
  'darius@hcmgloans.com',
  '1918223',
  'Marcus',
  'Washington',
  '17556290',
  now() - interval '3 days',
  'Darius James',
  '', '', '', '',
  now() - interval '3 days',
  now() - interval '3 days'
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
  'b2c3d4e5-0001-0001-0001-000000000001'::uuid,
  'a1b2c3d4-0001-0001-0001-000000000001'::uuid,
  '736a599a-492a-4585-b845-74b264d0ac9e'::uuid,
  'Darius James',
  'darius@hcmgloans.com',
  '1918223',
  '17556290',
  'Marcus',
  'Washington',
  'marcus.washington@gmail.com',
  '4105559201',
  'Baltimore',
  'Maryland',
  'Referred from VA purchase — borrower needs score improvement before we can lock.',
  now() - interval '3 days',
  'b2c3d4e5-0001-0001-0001-000000000001',
  'ENG-98765',
  now() - interval '3 days',
  'sent',
  null,
  'Enrolled',
  null,
  '659',
  '640',
  '647',
  'Completed initial counseling session. Marcus is enrolled and actively working on removing 3 medical collections from Equifax. Target score 680 within 60 days.',
  '{}',
  now() - interval '12 hours',
  '[
    {"status":"Attempting Contact","updated_at":"2026-09-17T14:00:00.000Z","experian":null,"equifax":null,"transunion":null,"notes":"Initial outreach sent via email and SMS.","follow_up_date":null},
    {"status":"Consultation Scheduled","updated_at":"2026-09-18T10:30:00.000Z","experian":null,"equifax":null,"transunion":null,"notes":"Marcus responded — consultation scheduled for tomorrow at 2PM ET.","follow_up_date":"2026-09-19"},
    {"status":"Evaluation Completed","updated_at":"2026-09-19T18:00:00.000Z","experian":"659","equifax":"640","transunion":"647","notes":"Credit pull complete. Experian 659 / Equifax 640 / TransUnion 647. 3 medical collections on Equifax identified as primary drag. Marcus wants to proceed.","follow_up_date":null},
    {"status":"Enrolled","updated_at":"2026-09-20T08:00:00.000Z","experian":"659","equifax":"640","transunion":"647","notes":"Completed initial counseling session. Marcus is enrolled and actively working on removing 3 medical collections from Equifax. Target score 680 within 60 days.","follow_up_date":null}
  ]'::jsonb,
  now() - interval '3 days',
  now() - interval '12 hours'
)
ON CONFLICT (id) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────
SELECT
  snr.borrower_first_name || ' ' || snr.borrower_last_name AS borrower,
  snr.arive_loan_number,
  snr.send_status,
  snr.current_status,
  snr.experian,
  snr.equifax,
  snr.transunion,
  snr.startingnow_id,
  jsonb_array_length(snr.status_history_json) AS history_entries
FROM public.starting_now_referrals snr
WHERE snr.id = 'b2c3d4e5-0001-0001-0001-000000000001'::uuid;
