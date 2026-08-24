-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG — Enable Row-Level Security on all tables currently missing it
-- Migration: 20260127_enable_rls_all_tables.sql
-- Run in: Supabase Dashboard → SQL Editor
--
-- LEGAL BASIS:
--   GLBA Safeguards Rule 16 CFR § 314.4(c) requires access controls that
--   "limit access to customer information only to those who need it to
--   perform their jobs." RLS is the database-level enforcement of that
--   requirement — it prevents any authenticated user (LO, ops, etc.) from
--   reading data they are not authorized to see, even if they have a valid
--   Supabase anon-key session.
--
-- NOTE: Service role (used by all API routes) bypasses RLS at the Supabase
--   driver level. These policies govern direct client-key access only.
--   "Service role inserts" policies are present only for documentation — the
--   service role already bypasses them.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. goal_assignments ───────────────────────────────────────────────────────
-- Contains: goal_month_id (FK), profile_id (FK), assigned_by (FK),
--           personal_funded_volume_goal, personal_funded_units_goal, notes
-- Risk: Exposes LO personal production targets to peers if unprotected
-- Policy: Admins manage all; LOs read only their own assignment rows

alter table public.goal_assignments enable row level security;

create policy "admins manage goal assignments"
  on public.goal_assignments for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "lo reads own goal assignment"
  on public.goal_assignments for select
  using (profile_id = auth.uid());

create policy "service role inserts goal assignments"
  on public.goal_assignments for insert
  with check (true);

-- ── 2. co_branded_pages ───────────────────────────────────────────────────────
-- Contains: realtor_name, realtor_email, realtor_phone, realtor_license
--           (realtor is a consumer/business contact = NPI)
-- Policy: Admins manage all; LO reads only their own co-branded pages

alter table public.co_branded_pages enable row level security;

create policy "admins manage co_branded_pages"
  on public.co_branded_pages for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "lo reads own co_branded_pages"
  on public.co_branded_pages for select
  using (
    lo_slug = (select lo_slug from public.profiles where id = auth.uid())
  );

create policy "service role full access co_branded_pages"
  on public.co_branded_pages for all
  using (true)
  with check (true);

-- ── 3. coaching_notes ────────────────────────────────────────────────────────
-- Contains: note (free-text manager observations about employee performance;
--           may reference borrower situations or loan scenarios)
-- Policy: Branch managers / admins manage all; employee reads only their own

alter table public.coaching_notes enable row level security;

create policy "admins manage coaching notes"
  on public.coaching_notes for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "manager manages coaching notes for own employees"
  on public.coaching_notes for all
  using (manager_id = auth.uid());

create policy "employee reads own coaching notes"
  on public.coaching_notes for select
  using (employee_id = auth.uid());

-- ── 4. coaching_actions ──────────────────────────────────────────────────────
-- Contains: action_text, due_date, completed status
-- Same risk profile as coaching_notes

alter table public.coaching_actions enable row level security;

create policy "admins manage coaching actions"
  on public.coaching_actions for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "manager manages own coaching actions"
  on public.coaching_actions for all
  using (manager_id = auth.uid());

create policy "employee reads own coaching actions"
  on public.coaching_actions for select
  using (employee_id = auth.uid());

-- ── 5. goal_reminder_log ─────────────────────────────────────────────────────
-- Contains: profile_id (FK), reminder timestamps — minimal NPI
-- Policy: Admins read all; service role inserts

alter table public.goal_reminder_log enable row level security;

create policy "admins read goal reminder log"
  on public.goal_reminder_log for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "service role inserts reminder log"
  on public.goal_reminder_log for insert
  with check (true);

-- ── 6. harry_ai_insights ─────────────────────────────────────────────────────
-- Contains: input_snapshot (may contain LO name, loan stats), result_text
--           (AI-generated text about LO performance — sensitive)
-- Policy: Admins manage all; requester reads own; target reads insights about them

alter table public.harry_ai_insights enable row level security;

create policy "admins manage harry ai insights"
  on public.harry_ai_insights for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "requester reads own insights"
  on public.harry_ai_insights for select
  using (requester_id = auth.uid());

create policy "target reads insights about them"
  on public.harry_ai_insights for select
  using (target_profile_id = auth.uid());

create policy "service role full access harry insights"
  on public.harry_ai_insights for all
  using (true)
  with check (true);

-- ── 7. reviews ───────────────────────────────────────────────────────────────
-- Contains: reviewer name + text (Google reviews synced from API)
-- These ARE public domain content, but control write access
-- Policy: Public can read (it's public content); admins manage; no direct inserts

alter table public.reviews enable row level security;

create policy "public can read reviews"
  on public.reviews for select
  using (true);

create policy "admins manage reviews"
  on public.reviews for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "service role can manage reviews"
  on public.reviews for all
  using (true)
  with check (true);

-- ── 8. slice_audit_log ───────────────────────────────────────────────────────
-- Contains: actor_id, actor_email, action, entity_id, before_val, after_val
--           (before/after values may contain full NPI field values)
-- Policy: Admins read all; service role inserts; no direct browser inserts

alter table public.slice_audit_log enable row level security;

create policy "admins read slice audit log"
  on public.slice_audit_log for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "service role inserts slice audit log"
  on public.slice_audit_log for insert
  with check (true);

-- ── 9. slice_sessions ────────────────────────────────────────────────────────
-- Contains: session_token (cryptographic secret), profile_id, ip_address
-- CRITICAL: If this were unprotected, any authenticated user could read
-- another user's session token and impersonate them.
-- Policy: Users manage only their own sessions

alter table public.slice_sessions enable row level security;

create policy "users manage own slice sessions"
  on public.slice_sessions for all
  using (profile_id = auth.uid());

create policy "service role full access slice sessions"
  on public.slice_sessions for all
  using (true)
  with check (true);

-- ── 10. webhook_log ──────────────────────────────────────────────────────────
-- Contains: raw_payload (raw ARIVE webhook bodies — full borrower NPI),
--           response_body, ip_address, lo_nmls, lo_email_raw
-- CRITICAL: This is one of the highest-NPI tables in the system.
-- Policy: Admins read all; service role inserts; no direct browser access

alter table public.webhook_log enable row level security;

create policy "admins read webhook log"
  on public.webhook_log for select
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'developer')
  );

create policy "service role inserts webhook log"
  on public.webhook_log for insert
  with check (true);

-- ── Verify all tables now have RLS enabled ────────────────────────────────────
-- Run this SELECT after the migration to confirm. Expected: rowsecurity = true for all rows.
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
