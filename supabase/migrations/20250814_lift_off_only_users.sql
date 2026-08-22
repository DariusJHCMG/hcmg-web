-- Migration: Lift Off-only external user flag
-- Run in Supabase Dashboard → SQL Editor
--
-- Adds liftoff_only boolean to profiles.
-- liftoff_only = true marks an account as an external Lift Off invitee:
--   - Excluded from public website (show_on_website forced false)
--   - Never shown in portal / SLICE / admin pages
--   - Redirected to /liftoff on sign-in
--   - Managed (invite + deactivate) from Lift Off Team & Roles page only

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS liftoff_only boolean NOT NULL DEFAULT false;

-- Ensure liftoff_only users can never flip show_on_website back to true
CREATE OR REPLACE FUNCTION fn_enforce_liftoff_only_no_website()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.liftoff_only = true THEN
    NEW.show_on_website := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_liftoff_only_no_website ON profiles;
CREATE TRIGGER trg_enforce_liftoff_only_no_website
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_liftoff_only_no_website();

COMMENT ON COLUMN profiles.liftoff_only IS
  'True = Lift Off-only external invitee. Excluded from website, portal, and SLICE. Managed via Lift Off Team & Roles.';
