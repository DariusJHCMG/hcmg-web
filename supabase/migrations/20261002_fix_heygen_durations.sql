-- Fix known incorrect duration_secs for HeyGen lessons where the admin
-- entered estimates that don't match the actual video length.
-- "Welcome to Harry's Playbook" was set to 240s but is actually 51s.
UPDATE uni_lessons
SET duration_secs = 51
WHERE id = '56c97f0b-74f0-4cec-a522-2b99e2243ce5';

-- Clear the stale video_duration_secs on sessions for this lesson
-- so heartbeats use the corrected lesson duration going forward.
UPDATE uni_lesson_sessions
SET video_duration_secs = NULL
WHERE lesson_id = '56c97f0b-74f0-4cec-a522-2b99e2243ce5'
  AND ended_at IS NULL;
