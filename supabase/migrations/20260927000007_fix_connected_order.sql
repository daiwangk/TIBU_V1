-- =====================================================================
-- Tibu Phase 1 — 0007: fix my_connected_businesses ordering
-- Bug: DISTINCT ON (b.id) forces ORDER BY b.id first, so the function returned
-- businesses in uuid order and LIMIT kept an arbitrary subset — not "newest first".
-- Fix: pick each business's latest contact in a subquery, then order by recency.
-- Same signature and return type, so CREATE OR REPLACE is safe on any environment.
-- =====================================================================
create or replace function public.my_connected_businesses(p_limit int default 20)
returns table (business_id uuid, slug text, name text, logo_url text, locality text,
               last_contacted_at timestamptz, last_channel public.contact_channel)
language sql stable security definer set search_path = public as $$
  select x.id, x.slug, x.name, x.logo_url, x.locality, x.created_at, x.channel
  from (
    select distinct on (b.id) b.id, b.slug, b.name, b.logo_url, b.locality, ce.created_at, ce.channel
    from public.contact_events ce
    join public.businesses b on b.id = ce.business_id
    where ce.user_id = auth.uid() and b.status = 'approved'
    order by b.id, ce.created_at desc
  ) x
  order by x.created_at desc
  limit least(coalesce(p_limit, 20), 50);
$$;
