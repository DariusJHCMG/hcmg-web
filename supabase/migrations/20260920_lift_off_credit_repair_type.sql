-- ═══════════════════════════════════════════════════════════════
-- HCMG Migration — Add credit_repair_referral to lift_off_requests
-- request_type CHECK constraint.
--
-- The TypeScript LiftOffRequestType union already includes this
-- value but the DB constraint was never updated.
-- Run in Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.lift_off_requests
  DROP CONSTRAINT lift_off_requests_request_type_check;

ALTER TABLE public.lift_off_requests
  ADD CONSTRAINT lift_off_requests_request_type_check
  CHECK (request_type = ANY (ARRAY[
    'register_disclosure'::text,
    'disclosure_only'::text,
    'submission'::text,
    'loan_help_desk'::text,
    'lock_request'::text,
    'credit_repair_referral'::text
  ]));

-- Verify
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'lift_off_requests'::regclass
AND conname = 'lift_off_requests_request_type_check';
