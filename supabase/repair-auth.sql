-- ═══════════════════════════════════════════════════════════════════
-- HCMG Auth Repair Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- This hard-deletes the invalid auth.users rows (created via raw SQL),
-- then recreates all 19 users properly via GoTrue so passwords work.
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Wipe all existing broken auth data
-- (Safe because there are 0 leads and no production data yet)

-- Delete profiles first (FK child)
DELETE FROM public.profiles;
DELETE FROM public.funnel_links;
DELETE FROM public.audit_log;

-- Hard-delete all auth.users (cascade removes identities, sessions, etc.)
DELETE FROM auth.users;

-- Verify clean slate
SELECT 'auth.users' as tbl, count(*) FROM auth.users
UNION ALL SELECT 'profiles', count(*) FROM public.profiles
UNION ALL SELECT 'funnel_links', count(*) FROM public.funnel_links;

-- ═══════════════════════════════════════════════════════════════════
-- IMPORTANT: After running Step 1 above, the API-based user creation
-- will work. Run the Node.js script:
--
--   node scripts/fix-auth-v2.mjs
--
-- That script creates all 19 users via the admin API which properly
-- handles password hashing and fires the handle_new_user trigger.
-- ═══════════════════════════════════════════════════════════════════
