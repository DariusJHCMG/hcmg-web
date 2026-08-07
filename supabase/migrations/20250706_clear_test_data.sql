-- ==============================================================
-- SLICE by HCMG - Clear all test data before going live
-- Run in: Supabase Dashboard -> SQL Editor
--
-- Deletes ALL goal engine data:
--   goal_months, goal_production, goal_commitments,
--   goal_awards, goal_assignments, goal_coaching_notes
--
-- Profiles (LO accounts) and auth users are NOT touched.
-- ==============================================================

-- Delete in FK-safe order (children before parents)

DELETE FROM goal_coaching_notes;
DELETE FROM goal_awards;
DELETE FROM goal_production;
DELETE FROM goal_commitments;
DELETE FROM goal_assignments;
DELETE FROM goal_months;

-- Verify all counts are 0
SELECT
  (SELECT COUNT(*) FROM goal_months)         AS goal_months,
  (SELECT COUNT(*) FROM goal_production)     AS goal_production,
  (SELECT COUNT(*) FROM goal_commitments)    AS goal_commitments,
  (SELECT COUNT(*) FROM goal_awards)         AS goal_awards,
  (SELECT COUNT(*) FROM goal_assignments)    AS goal_assignments,
  (SELECT COUNT(*) FROM goal_coaching_notes) AS goal_coaching_notes;
