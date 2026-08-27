-- Add source column to goal_notifications to distinguish portal vs liftoff vs slice notifications
ALTER TABLE goal_notifications
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'slice';
