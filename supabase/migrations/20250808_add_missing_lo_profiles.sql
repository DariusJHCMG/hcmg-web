-- SLICE by HCMG — Add missing LOs and ARIVE name aliases
-- Adds Aaron Clark, Darius James, QuTeece Square profiles
-- Sets arive_name aliases for all LOs whose ARIVE-sent name differs from SLICE full_name
-- Run in: Supabase Dashboard → SQL Editor

-- ── 1. Add missing LO profiles ──────────────────────────────────────
-- These LOs appear in ARIVE but have no SLICE profile yet.
-- They are created as loan_officer accounts with no login password —
-- an admin invite can be sent later via /goal-engine/admin/users.

DO $$
DECLARE
  uid uuid;
  accounts jsonb := '[
    {
      "email":     "aaron.clark@hcmgloans.com",
      "full_name": "Aaron Clark",
      "nmls":      "1588427",
      "lo_slug":   "aaron-clark",
      "arive_name":"Aaron Clark"
    },
    {
      "email":     "darius.james@hcmgloans.com",
      "full_name": "Darius James",
      "nmls":      "1097168",
      "lo_slug":   "darius-james",
      "arive_name":"Darius James"
    },
    {
      "email":     "quteece.square@hcmgloans.com",
      "full_name": "QuTeece Square",
      "nmls":      "1930150",
      "lo_slug":   "quteece-square",
      "arive_name":"QuTeece Square"
    }
  ]';
  acc jsonb;
BEGIN
  FOR acc IN SELECT * FROM jsonb_array_elements(accounts)
  LOOP
    -- Only create auth user if one doesn't already exist for this email
    SELECT id INTO uid FROM auth.users WHERE email = acc->>'email';
    IF uid IS NULL THEN
      INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at,
        raw_user_meta_data, created_at, updated_at, aud, role
      ) VALUES (
        gen_random_uuid(),
        acc->>'email',
        crypt('HCMGteam2025!', gen_salt('bf')),
        now(),
        jsonb_build_object('full_name', acc->>'full_name', 'role', 'loan_officer'),
        now(), now(), 'authenticated', 'authenticated'
      ) RETURNING id INTO uid;
    END IF;

    -- Upsert profile
    INSERT INTO public.profiles (id, email, full_name, role, nmls, lo_slug, arive_name, notify_email, is_active)
    VALUES (
      uid,
      acc->>'email',
      acc->>'full_name',
      'loan_officer',
      acc->>'nmls',
      acc->>'lo_slug',
      acc->>'arive_name',
      acc->>'email',
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name  = EXCLUDED.full_name,
      nmls       = EXCLUDED.nmls,
      lo_slug    = EXCLUDED.lo_slug,
      arive_name = EXCLUDED.arive_name,
      is_active  = true;

  END LOOP;
END $$;

-- ── 2. Set arive_name aliases for existing LOs ────────────────────────
-- ARIVE sends the name exactly as stored in ARIVE — set arive_name to match.

-- Lamont: ARIVE sends "Lamont Harris", SLICE stores "Lamont Harris Jr."
UPDATE public.profiles
SET arive_name = 'Lamont Harris'
WHERE full_name ILIKE 'Lamont Harris%'
AND is_active = true
AND (arive_name IS NULL OR arive_name != 'Lamont Harris');

-- ── 3. Verify ──────────────────────────────────────────────────────────
SELECT
  full_name,
  email,
  nmls,
  arive_name,
  is_active
FROM public.profiles
WHERE full_name IN (
  'Aaron Clark', 'Darius James', 'QuTeece Square',
  'Lamont Harris Jr.', 'Lamont Harris'
)
OR arive_name IS NOT NULL
ORDER BY full_name;
