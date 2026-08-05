-- ═══════════════════════════════════════════════════════════════
-- HCMG Goal Engine™ — DEMO SEED DATA
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ⚠️  Run the migration (20250101_goal_engine.sql) FIRST
-- ═══════════════════════════════════════════════════════════════
--
-- This seeds realistic demo data so you can see the full system
-- working: a published goal, 6 LO commitments, and production data.
--
-- It uses YOUR REAL LO profiles from the profiles table.
-- ═══════════════════════════════════════════════════════════════

-- ── Step 1: Create the current month goal ────────────────────
INSERT INTO public.goal_months (
  month_label, month_year, month_num,
  funded_volume_goal, funded_units_goal,
  app_volume_goal, app_units_goal,
  clo_message, awards_enabled,
  start_date, end_date,
  is_published, emails_sent
) VALUES (
  'July 2025', 2025, 7,
  20000000, 60,
  40000000, 120,
  'This month we are attacking purchases and DSCR. Every loan officer needs to own a piece of this goal. Let''s set the record.',
  true,
  '2025-07-01', '2025-07-31',
  true, true
)
ON CONFLICT (month_year, month_num) DO UPDATE SET
  funded_volume_goal = EXCLUDED.funded_volume_goal,
  funded_units_goal  = EXCLUDED.funded_units_goal,
  clo_message        = EXCLUDED.clo_message,
  is_published       = true;

-- ── Step 2: Store goal ID for later use ──────────────────────
DO $$
DECLARE
  gid UUID;
  lo_ids UUID[];
  lo_names TEXT[];
  i INT;

  -- Demo production data per LO (funded_volume, funded_units, app_volume, app_units)
  volumes     NUMERIC[]  := ARRAY[1820000, 1540000, 1390000, 980000, 720000, 410000];
  units       INTEGER[]  := ARRAY[7, 6, 5, 4, 3, 2];
  apps        NUMERIC[]  := ARRAY[3200000, 2800000, 2400000, 1900000, 1400000, 900000];
  appunts     INTEGER[]  := ARRAY[12, 10, 9, 7, 5, 3];

  commit_vols  NUMERIC[]  := ARRAY[2200000, 1750000, 1500000, 1250000, 1000000, 750000];
  commit_units INTEGER[]  := ARRAY[8, 7, 6, 5, 4, 3];
  conf_pcts    INTEGER[]  := ARRAY[70, 75, 80, 85, 90, 95];

  focuses TEXT[] := ARRAY[
    'Doubling down on my realtor referral network — targeting 4 new partners this month.',
    'Following up every pre-approval within 24 hours and hosting 2 lunch-and-learns.',
    'Focusing on DSCR investors — I have a pipeline of rental property buyers ready.',
    'Working the expired listing database with 3 realtor partners for purchase leads.',
    'Calling every lead from the last 90 days and re-engaging stale pipeline.',
    'Partnering with a new real estate team — targeting first-time homebuyers.'
  ];
  challenges TEXT[] := ARRAY[
    'Rate volatility making borrowers hesitant — need to educate on buydowns.',
    'Limited purchase inventory in my market slowing decisions.',
    'Competing lenders offering aggressive rates on DSCR products.',
    'Summer slowdown — realtors are traveling and less responsive.',
    'Processing timeline delays affecting close dates.',
    'Building trust with new referral partners takes time.'
  ];

BEGIN
  -- Get goal ID
  SELECT id INTO gid FROM public.goal_months WHERE month_year = 2025 AND month_num = 7;

  -- Get up to 6 active LO profile IDs
  SELECT ARRAY(
    SELECT id FROM public.profiles
    WHERE role = 'loan_officer' AND is_active = true
    ORDER BY full_name
    LIMIT 6
  ) INTO lo_ids;

  -- If fewer than 6 LOs exist, just work with what we have
  FOR i IN 1..array_length(lo_ids, 1) LOOP

    -- Insert commitment
    INSERT INTO public.goal_commitments (
      goal_month_id, profile_id,
      funded_volume_commitment, funded_units_commitment,
      app_volume_commitment, app_units_commitment,
      biggest_focus, biggest_challenge,
      confidence_pct, digital_agreement, locked, submitted_at
    ) VALUES (
      gid, lo_ids[i],
      commit_vols[i], commit_units[i],
      commit_vols[i] * 2, commit_units[i] * 2,
      focuses[i], challenges[i],
      conf_pcts[i],
      true, true, NOW() - (INTERVAL '1 day' * (7 - i))
    )
    ON CONFLICT (goal_month_id, profile_id) DO UPDATE SET
      funded_volume_commitment = EXCLUDED.funded_volume_commitment,
      funded_units_commitment  = EXCLUDED.funded_units_commitment;

    -- Insert production records (simulate funded loans)
    -- Loan 1
    INSERT INTO public.goal_production (
      profile_id, goal_month_id, loan_id,
      funded_date, funded_volume, funded_unit,
      app_date, app_volume, app_unit, source
    ) VALUES (
      lo_ids[i], gid, 'DEMO-' || i || '-001',
      '2025-07-03', volumes[i] * 0.45, 1,
      '2025-06-28', apps[i] * 0.40, 1, 'demo'
    ) ON CONFLICT DO NOTHING;

    -- Loan 2
    INSERT INTO public.goal_production (
      profile_id, goal_month_id, loan_id,
      funded_date, funded_volume, funded_unit,
      app_date, app_volume, app_unit, source
    ) VALUES (
      lo_ids[i], gid, 'DEMO-' || i || '-002',
      '2025-07-08', volumes[i] * 0.35, 1,
      '2025-07-01', apps[i] * 0.30, 1, 'demo'
    ) ON CONFLICT DO NOTHING;

    -- Additional apps (not yet funded)
    INSERT INTO public.goal_production (
      profile_id, goal_month_id, loan_id,
      app_date, app_volume, app_unit,
      funded_date, funded_volume, funded_unit, source
    ) VALUES (
      lo_ids[i], gid, 'DEMO-' || i || '-003',
      '2025-07-10', apps[i] * 0.30, appunts[i] - 2,
      NULL, NULL, 0, 'demo'
    ) ON CONFLICT DO NOTHING;

  END LOOP;

  -- Also seed commitment for ADMIN user (so they can see their own dashboard)
  INSERT INTO public.goal_commitments (
    goal_month_id, profile_id,
    funded_volume_commitment, funded_units_commitment,
    app_volume_commitment, app_units_commitment,
    biggest_focus, biggest_challenge,
    confidence_pct, digital_agreement, locked, submitted_at
  )
  SELECT
    gid, id,
    2500000, 9,
    5000000, 18,
    'Leading by example — closing my own pipeline while coaching the team.',
    'Balancing coaching responsibilities with personal production.',
    95, true, true, NOW() - INTERVAL '5 days'
  FROM public.profiles
  WHERE (role = 'admin' OR role = 'developer') AND is_active = true
  LIMIT 1
  ON CONFLICT (goal_month_id, profile_id) DO NOTHING;

END $$;

-- ── Step 3: Verify it worked ──────────────────────────────────
SELECT
  gm.month_label,
  p.full_name,
  gc.funded_volume_commitment,
  gc.funded_units_commitment,
  COALESCE(SUM(gp.funded_volume), 0) AS actual_funded,
  COALESCE(SUM(gp.funded_unit),   0) AS actual_units
FROM public.goal_months gm
JOIN public.goal_commitments gc ON gc.goal_month_id = gm.id
JOIN public.profiles p ON p.id = gc.profile_id
LEFT JOIN public.goal_production gp
  ON gp.profile_id = gc.profile_id
  AND gp.goal_month_id = gm.id
WHERE gm.month_year = 2025 AND gm.month_num = 7
GROUP BY gm.month_label, p.full_name, gc.funded_volume_commitment, gc.funded_units_commitment
ORDER BY actual_funded DESC;
