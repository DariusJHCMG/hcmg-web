-- SLICE by HCMG — Add previous_value column to webhook_log
-- Stores a before-snapshot of goal_production fields so the admin UI
-- can show "Before → After" diffs for every sync update.

alter table public.webhook_log
  add column if not exists previous_value jsonb;
