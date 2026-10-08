-- Backfill: mark uni_progress rows as completed=true where the learner
-- reached or exceeded the lesson's watch threshold but the completed flag
-- was never flipped (common for HeyGen iframe lessons and text lessons
-- that were watched before the session/complete integrity check was added).
--
-- Safe: only touches rows where completed=false AND watch_pct >= threshold
-- AND completion_mode = 'watch_pct' (does not touch quiz_pass lessons).

UPDATE uni_progress up
SET
  completed    = true,
  completed_at = COALESCE(up.completed_at, now())
FROM uni_lessons l
WHERE up.lesson_id = l.id
  AND up.completed = false
  AND up.watch_pct >= COALESCE(l.completion_threshold_pct, 80)
  AND l.completion_mode = 'watch_pct';
