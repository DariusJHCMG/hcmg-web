-- Lift Off — Add help_desk_agent role
-- Adds the help_desk_agent value to the supported liftoff_roles set.
-- liftoff_roles is a text[] column (no array-level CHECK constraint),
-- so no constraint alteration is needed — this migration serves as
-- documentation and applies the role label in the app layer.
--
-- Users with help_desk_agent role:
--   - Can access /liftoff/helpdesk (Help Desk Queue) only
--   - Cannot access Ops Queue, Pipeline, or SLA Tracker (unless they also hold another liftoff role)
--   - Roles are additive: help_desk_agent + liftoff_team = both queues visible

-- Add a comment to the profiles table column documenting the new value
comment on column public.profiles.liftoff_roles is
  'Array of Lift Off roles for this user. Valid values: liftoff_admin, liftoff_team, lock_desk_admin, ops_manager, help_desk_agent';
