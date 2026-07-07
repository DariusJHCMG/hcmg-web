-- Seed all team portal accounts (safe to re-run)
-- Uses DO $$ blocks to skip existing users
-- Default password for all new accounts: HCMGteam2025!

DO $$
DECLARE
  uid uuid;
  accounts jsonb := '[
    {"email":"lamont@hcmgloans.com",        "full_name":"Lamont Harris Jr.",          "role":"admin",        "lo_slug":"lamont-harris-jr",    "nmls":null},
    {"email":"astrine@hcmgloans.com",       "full_name":"Astrine Covington",          "role":"admin",        "lo_slug":"astrine-covington",   "nmls":null},
    {"email":"ranada@hcmgloans.com",        "full_name":"Ranada Harris",              "role":"admin",        "lo_slug":"ranada-harris",       "nmls":null},
    {"email":"aysha@hcmgloans.com",         "full_name":"Aysha Randall",              "role":"admin",        "lo_slug":"aysha-randall",       "nmls":"2341853"},
    {"email":"mesia@hcmgloans.com",         "full_name":"Mesia Crews",                "role":"admin",        "lo_slug":"mesia-crews",         "nmls":null},
    {"email":"adam@hcmgloans.com",          "full_name":"Adam DeMarco",               "role":"admin",        "lo_slug":"adam-demarco",        "nmls":"2749110"},
    {"email":"cason@hcmgloans.com",         "full_name":"Cason Thomas Knight",        "role":"loan_officer", "lo_slug":"cason-knight",        "nmls":"2234863"},
    {"email":"don@hcmgloans.com",           "full_name":"Don Ray Earl",               "role":"loan_officer", "lo_slug":"don-earl",            "nmls":"896069"},
    {"email":"glenda@hcmgloans.com",        "full_name":"Glenda Adesmiler Medina",    "role":"loan_officer", "lo_slug":"glenda-medina",       "nmls":"2247461"},
    {"email":"james.sadowski@hcmgloans.com","full_name":"James Carl Sadowski Jr",     "role":"loan_officer", "lo_slug":"james-sadowski",      "nmls":"2711950"},
    {"email":"james.pasquale@hcmgloans.com","full_name":"James Michael Pasquale",     "role":"loan_officer", "lo_slug":"james-pasquale",      "nmls":"2410580"},
    {"email":"jason@hcmgloans.com",         "full_name":"Jason Matthew Kelly",        "role":"loan_officer", "lo_slug":"jason-kelly",         "nmls":"2000016"},
    {"email":"jimmy@hcmgloans.com",         "full_name":"Jimmy Flores Castillo",      "role":"loan_officer", "lo_slug":"jimmy-castillo",      "nmls":"2140847"},
    {"email":"latonya@hcmgloans.com",       "full_name":"LaTonya Matrice Jordan-Odom","role":"loan_officer", "lo_slug":"latonya-jordan-odom", "nmls":"1798502"},
    {"email":"liudmila@hcmgloans.com",      "full_name":"Liudmila Paliankova",        "role":"loan_officer", "lo_slug":"liudmila-paliankova", "nmls":"1979184"},
    {"email":"philbert@hcmgloans.com",      "full_name":"Philbert Wilson",            "role":"loan_officer", "lo_slug":"philbert-wilson",     "nmls":"1053787"},
    {"email":"rafael@hcmgloans.com",        "full_name":"Rafael Espinoza",            "role":"loan_officer", "lo_slug":"rafael-espinoza",     "nmls":"2083843"},
    {"email":"tamara@hcmgloans.com",        "full_name":"Tamara Hodges-Brown",        "role":"loan_officer", "lo_slug":"tamara-hodges-brown", "nmls":"2465567"}
  ]';
  acc jsonb;
BEGIN
  FOR acc IN SELECT * FROM jsonb_array_elements(accounts)
  LOOP
    -- Skip if user already exists
    SELECT id INTO uid FROM auth.users WHERE email = acc->>'email';
    IF uid IS NULL THEN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
      VALUES (
        gen_random_uuid(),
        acc->>'email',
        crypt('HCMGteam2025!', gen_salt('bf')),
        now(),
        jsonb_build_object('full_name', acc->>'full_name', 'role', acc->>'role'),
        now(), now(), 'authenticated', 'authenticated'
      ) RETURNING id INTO uid;
    END IF;

    -- Upsert profile (update even if exists)
    UPDATE public.profiles SET
      full_name    = acc->>'full_name',
      role         = acc->>'role',
      lo_slug      = acc->>'lo_slug',
      nmls         = CASE WHEN acc->>'nmls' = 'null' THEN NULL ELSE acc->>'nmls' END,
      notify_email = acc->>'email',
      is_active    = true
    WHERE id = uid;

    -- Create funnel link for this person
    INSERT INTO public.funnel_links (lo_slug, lo_name, url, is_active)
    VALUES (
      acc->>'lo_slug',
      acc->>'full_name',
      'https://getorangekey.com/go/' || (acc->>'lo_slug'),
      true
    )
    ON CONFLICT (lo_slug) DO NOTHING;

  END LOOP;
END $$;

-- Verify
SELECT email, full_name, role, lo_slug, nmls FROM public.profiles ORDER BY role, full_name;
