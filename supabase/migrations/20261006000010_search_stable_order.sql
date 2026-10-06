-- =====================================================================
-- Tibu Phase 1 — 0010: deterministic search ordering
-- Offset paging ("Load more") needs a total order. search_businesses and search_products ended their
-- ORDER BY with a non-unique column (approved_at / created_at), and rating_avg is 0 for every business
-- without reviews, so rows with equal values could repeat or disappear between pages.
-- This only appends the primary key as the last sort term. Signatures, return types, filters and
-- privileges are unchanged (CREATE OR REPLACE keeps existing grants). Safe to re-run.
-- Not yet run against a database: apply with `npx supabase db push` on tibu-dev first.
-- =====================================================================

create or replace function public.search_businesses(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 15,
  p_category text default null,
  p_query text default null,
  p_available_today boolean default false,
  p_sort text default 'distance',
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid, slug text, name text, category_slug text, category_name text,
  logo_url text, banner_url text, locality text, city text,
  rating_avg numeric, rating_count int, available_today boolean,
  delivery_available boolean, pickup_available boolean,
  approved_at timestamptz, distance_m double precision
)
language sql stable set search_path = public, extensions as $$
  with o as (
    select case when p_lat is not null and p_lng is not null
                then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end as g
  )
  select b.id, b.slug, b.name, c.slug, c.name, b.logo_url, b.banner_url, b.locality, b.city,
         b.rating_avg, b.rating_count, b.available_today, b.delivery_available, b.pickup_available,
         b.approved_at,
         case when o.g is not null then st_distance(b.location, o.g) end as distance_m
  from public.businesses b
  join public.categories c on c.id = b.category_id
  cross join o
  where b.status = 'approved'
    and b.category_id in (select public.category_ids(p_category))
    and (o.g is null or p_radius_km is null or st_dwithin(b.location, o.g, p_radius_km * 1000))
    and (p_query is null or btrim(p_query) = ''
         or b.name ilike '%' || btrim(p_query) || '%'
         or b.description ilike '%' || btrim(p_query) || '%'
         or c.name ilike '%' || btrim(p_query) || '%')
    and (not p_available_today or b.available_today)
  order by
    case when p_sort = 'distance' and o.g is not null then st_distance(b.location, o.g) end asc nulls last,
    case when p_sort = 'rating' then b.rating_avg end desc nulls last,
    b.approved_at desc nulls last,
    b.id
  limit least(p_limit, 50) offset p_offset;
$$;

-- ---------------------------------------------------------------------
-- Discovery: products (joined to their business for location)
-- ---------------------------------------------------------------------
create or replace function public.search_products(
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 15,
  p_category text default null,
  p_query text default null,
  p_min_price_paise int default null,
  p_max_price_paise int default null,
  p_available_today boolean default false,
  p_sort text default 'distance',       -- 'distance' | 'newest' | 'price_asc' | 'price_desc'
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid, name text, price_paise int, image_url text, available_today boolean,
  business_id uuid, business_slug text, business_name text, business_logo_url text,
  locality text, rating_avg numeric, category_slug text,
  created_at timestamptz, distance_m double precision
)
language sql stable set search_path = public, extensions as $$
  with o as (
    select case when p_lat is not null and p_lng is not null
                then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end as g
  )
  select p.id, p.name, p.price_paise,
         (select pi.url from public.product_images pi where pi.product_id = p.id order by pi.sort_order, pi.created_at limit 1),
         p.available_today,
         b.id, b.slug, b.name, b.logo_url, b.locality, b.rating_avg, c.slug,
         p.created_at,
         case when o.g is not null then st_distance(b.location, o.g) end
  from public.products p
  join public.businesses b on b.id = p.business_id
  join public.categories c on c.id = coalesce(p.category_id, b.category_id)
  cross join o
  where p.is_active and b.status = 'approved'
    and c.id in (select public.category_ids(p_category))
    and (o.g is null or p_radius_km is null or st_dwithin(b.location, o.g, p_radius_km * 1000))
    and (p_query is null or btrim(p_query) = ''
         or p.name ilike '%' || btrim(p_query) || '%'
         or p.description ilike '%' || btrim(p_query) || '%'
         or b.name ilike '%' || btrim(p_query) || '%')
    and (p_min_price_paise is null or p.price_paise >= p_min_price_paise)
    and (p_max_price_paise is null or p.price_paise <= p_max_price_paise)
    and (not p_available_today or p.available_today)
  order by
    case when p_sort = 'distance' and o.g is not null then st_distance(b.location, o.g) end asc nulls last,
    case when p_sort = 'price_asc'  then p.price_paise end asc,
    case when p_sort = 'price_desc' then p.price_paise end desc,
    p.created_at desc,
    p.id
  limit least(p_limit, 50) offset p_offset;
$$;
