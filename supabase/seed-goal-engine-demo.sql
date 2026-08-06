-- ═══════════════════════════════════════════════════════════════
-- HCMG SLICE — Demo Seed Data
-- Run AFTER the main migration AND after creating Supabase auth users.
--
-- HOW TO USE:
-- 1. In Supabase Dashboard → Auth → Users → Add User for each LO
-- 2. Copy the UUID of Darius James from the Users list
-- 3. Replace DARIUS_UUID below with that UUID
-- 4. Do the same for any other LOs you want to seed
-- 5. Run this script in Supabase SQL Editor
--
-- OR: Use the "Seed Demo Data" button in /goal-engine/admin
-- which calls /api/goal-engine/seed-demo and uses the actual
-- logged-in user's ID.
-- ═══════════════════════════════════════════════════════════════

-- ── Insert a demo goal for this month ────────────────────────
-- (Uses ON CONFLICT DO NOTHING so safe to re-run)
insert into public.goal_months (
  id, month_label, month_year, month_num,
  funded_volume_goal, funded_units_goal,
  app_volume_goal, app_units_goal,
  clo_message, start_date, end_date,
  is_published, emails_sent
)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  to_char(date_trunc('month', now()), 'Month YYYY'),
  extract(year  from now())::integer,
  extract(month from now())::integer,
  20000000, 60,
  28000000, 80,
  'This month we are attacking purchases and DSCR. Let''s all own a piece of this goal. Every loan counts — every commitment matters. Let''s make history.',
  date_trunc('month', now())::date,
  (date_trunc('month', now()) + interval '1 month - 1 day')::date,
  true, false
)
on conflict (month_year, month_num) do nothing;
