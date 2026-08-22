-- ═══════════════════════════════════════════════════════════════
-- HCMG Lift Off — Lock preference + request linking
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

alter table public.lift_off_requests
  -- Lock/float preference chosen by LO
  -- "lock"             = LO wants it locked (confirmed by lock desk)
  -- "lock_requested"   = LO submitted inline lock request, awaiting lock desk
  -- "float"            = LO wants to float
  add column if not exists lock_preference text
    check (lock_preference in ('lock','lock_requested','float') or lock_preference is null),

  -- On a lock_request row: points back to the parent submission/registration
  add column if not exists parent_request_id uuid
    references public.lift_off_requests(id) on delete set null,

  -- On a parent row: points to the associated lock_request
  add column if not exists linked_lock_request_id uuid
    references public.lift_off_requests(id) on delete set null;

create index if not exists lo_requests_parent_idx on public.lift_off_requests(parent_request_id);
create index if not exists lo_requests_linked_lock_idx on public.lift_off_requests(linked_lock_request_id);
