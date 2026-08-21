-- ═══════════════════════════════════════════════════════════════
-- Add co_branded_page_id to leads for exact attribution
-- Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════

alter table public.leads
  add column if not exists co_branded_page_id uuid
    references public.co_branded_pages(id) on delete set null;

create index if not exists leads_co_branded_page_id_idx
  on public.leads(co_branded_page_id)
  where co_branded_page_id is not null;
