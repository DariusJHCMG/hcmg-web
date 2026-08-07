-- ============================================================
-- SLICE by HCMG — Clear all test data before going live
-- Run in: Supabase Dashboard → SQL Editor
--
-- This deletes ALL goal engine data:
--   - All goal months (test goals)
--   - All production records (test loans from webhooks)
--   - All LO commitments
--   - All awards issued
--   - All coaching notes
--   - All goal assignments
--
-- Profiles (LO accounts) and auth users are NOT touched.
-- ============================================================

-- Delete in FK-safe order (children before parents)

-- 1. Coaching notes (reference goal_months)
DELETE FROM goal_coaching_notes;

-- 2. Awards (reference goal_months + profiles)
DELETE FROM goal_awards;

-- 3. Production records (reference goal_months + profiles)
DELETE FROM goal_production;

-- 4. Commitments (reference goal_months + profiles)
DELETE FROM goal_commitments;

-- 5. Goal assignments / notifications (reference goal_months + profiles)
DELETE FROM goal_assignments;

-- 6. Goal months (top-level parent)
DELETE FROM goal_months;

-- ── Verify everything is empty ────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM goal_months)         AS goal_months,
  (SELECT COUNT(*) FROM goal_production)     AS goal_production,
  (SELECT COUNT(*) FROM goal_commitments)    AS goal_commitments,
  (SELECT COUNT(*) FROM goal_awards)         AS goal_awards,
  (SELECT COUNT(*) FROM goal_assignments)    AS goal_assignments,
  (SELECT COUNT(*) FROM goal_coaching_notes) AS goal_coaching_notes;

-- All counts should be 0.
-- You are now ready to create your first real goal and connect Zapier.
