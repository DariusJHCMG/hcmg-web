-- Lift Off — Loan Help Desk request type
-- Replaces restructure_suspense with loan_help_desk.
-- No data migration needed — no prod rows have request_type = 'restructure_suspense'.

-- Add new columns for help desk sub-type and description
alter table lift_off_requests
  add column if not exists help_desk_sub_type    text,
  add column if not exists help_desk_description text;

-- Update the request_type check constraint to allow loan_help_desk
-- (drop old constraint and recreate with new values)
alter table lift_off_requests
  drop constraint if exists lift_off_requests_request_type_check;

alter table lift_off_requests
  add constraint lift_off_requests_request_type_check
    check (request_type in (
      'register_disclosure',
      'disclosure_only',
      'submission',
      'loan_help_desk',
      'lock_request'
    ));
