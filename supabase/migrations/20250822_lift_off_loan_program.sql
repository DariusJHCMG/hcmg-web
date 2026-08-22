-- Split loan_type into loan_purpose + loan_program.
-- loan_type is kept and backfilled for backwards compatibility,
-- but loan_purpose and loan_program are the canonical fields going forward.

alter table lift_off_requests
  add column if not exists loan_purpose text,  -- purchase | refinance
  add column if not exists loan_program text;  -- conventional | fha | va | non_qm | heloc | construction | renovation | other

-- Backfill loan_purpose from existing loan_type values
update lift_off_requests set
  loan_purpose = case
    when loan_type ilike 'purchase%' then 'purchase'
    when loan_type ilike 'refinance%' or loan_type ilike 'cash_out%' then 'refinance'
    when loan_type = 'heloc' then 'purchase'
    else null
  end,
  loan_program = case
    when loan_type ilike '%fha'          then 'fha'
    when loan_type ilike '%va'           then 'va'
    when loan_type ilike '%usda%'        then 'usda'
    when loan_type = 'heloc'             then 'heloc'
    when loan_type = 'cash_out_refi'     then 'conventional'
    when loan_type = 'construction'      then 'construction'
    when loan_type = 'renovation'        then 'renovation'
    when loan_type = 'other'             then 'other'
    when loan_type ilike 'purchase%' or loan_type ilike 'refinance%' then 'conventional'
    else null
  end
where loan_type is not null;
