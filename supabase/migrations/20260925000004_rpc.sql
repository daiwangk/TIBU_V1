-- =====================================================================
-- Tibu Phase 1 — 0004: RPC functions (called with supabase.rpc('name', args))
-- Discovery RPCs are SECURITY INVOKER (RLS applies).
-- Action RPCs are SECURITY DEFINER and check auth themselves.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Category helper: slug → ids including children
-- ---------------------------------------------------------------------
create or replace function public.category_ids(p_slug text)
returns setof bigint language sql stable set search_path = public as $$
  select c.id from public.categories c
  where p_slug is null
     or c.slug = p_slug
     or c.parent_id = (select id from public.categories where slug = p_slug);
$$;

-- ---------------------------------------------------------------------
-- Discovery: businesses
-- p_lat/p_lng null  → no distance, sorted newest
-- p_sort: 'distance' | 'newest' | 'rating'
-- ---------------------------------------------------------------------
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
    b.approved_at desc nulls last
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
    p.created_at desc
  limit least(p_limit, 50) offset p_offset;
$$;

-- ---------------------------------------------------------------------
-- Contact reveal: login required. Returns numbers + logs the tap.
-- ---------------------------------------------------------------------
create or replace function public.reveal_contact(
  p_business uuid,
  p_channel public.contact_channel,
  p_product uuid default null
)
returns table (phone text, whatsapp text)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'login_required' using errcode = '28000';
  end if;
  if not exists (select 1 from public.businesses where id = p_business and status = 'approved') then
    raise exception 'business_not_available' using errcode = 'P0002';
  end if;
  -- light abuse brake: 60 reveals / user / hour
  if (select count(*) from public.contact_events
       where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  insert into public.contact_events (user_id, business_id, product_id, channel)
  values (auth.uid(), p_business, p_product, p_channel);

  return query select c.phone, c.whatsapp from public.business_contacts c where c.business_id = p_business;
end $$;

-- ---------------------------------------------------------------------
-- Recently viewed (logged-in). Keeps latest 50 per user, no duplicates.
-- ---------------------------------------------------------------------
create or replace function public.track_view(p_business uuid default null, p_product uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or num_nonnulls(p_business, p_product) <> 1 then return; end if;
  delete from public.recent_views
   where user_id = auth.uid()
     and business_id is not distinct from p_business
     and product_id  is not distinct from p_product;
  insert into public.recent_views (user_id, business_id, product_id) values (auth.uid(), p_business, p_product);
  delete from public.recent_views
   where user_id = auth.uid()
     and id not in (select id from public.recent_views where user_id = auth.uid() order by viewed_at desc limit 50);
end $$;

-- "Previously connected" — distinct businesses the user contacted, newest first
create or replace function public.my_connected_businesses(p_limit int default 20)
returns table (business_id uuid, slug text, name text, logo_url text, locality text,
               last_contacted_at timestamptz, last_channel public.contact_channel)
language sql stable security definer set search_path = public as $$
  select distinct on (b.id) b.id, b.slug, b.name, b.logo_url, b.locality, ce.created_at, ce.channel
  from public.contact_events ce join public.businesses b on b.id = ce.business_id
  where ce.user_id = auth.uid() and b.status = 'approved'
  order by b.id, ce.created_at desc
  limit least(p_limit, 50);
$$;

-- ---------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------
create or replace function public.send_enquiry(p_business uuid, p_body text, p_product uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_enquiry uuid;
begin
  if auth.uid() is null then raise exception 'login_required' using errcode = '28000'; end if;
  if not exists (select 1 from public.businesses where id = p_business and status = 'approved') then
    raise exception 'business_not_available' using errcode = 'P0002';
  end if;
  if public.owns_business(p_business) then raise exception 'cannot_enquire_own_business'; end if;
  if (select count(*) from public.enquiry_messages
       where sender_id = auth.uid() and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  insert into public.enquiries (customer_id, business_id, product_id)
  values (auth.uid(), p_business, p_product)
  on conflict (customer_id, business_id)
    do update set product_id = coalesce(excluded.product_id, public.enquiries.product_id)
  returning id into v_enquiry;

  insert into public.enquiry_messages (enquiry_id, sender_id, body) values (v_enquiry, auth.uid(), btrim(p_body));
  return v_enquiry;
end $$;

create or replace function public.mark_enquiry_read(p_enquiry uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.enquiries e
                 where e.id = p_enquiry and (e.customer_id = auth.uid() or public.owns_business(e.business_id))) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  update public.enquiry_messages set read_at = now()
   where enquiry_id = p_enquiry and sender_id <> auth.uid() and read_at is null;
  update public.notifications set read_at = now()
   where user_id = auth.uid() and read_at is null and payload->>'enquiry_id' = p_enquiry::text;
end $$;

-- Inbox list for either side, with unread counts
create or replace function public.my_enquiries(p_as text default 'customer')   -- 'customer' | 'seller'
returns table (enquiry_id uuid, business_id uuid, business_name text, customer_name text,
               product_id uuid, product_name text, last_message text, last_message_at timestamptz,
               unread int, status public.enquiry_status)
language sql stable security definer set search_path = public as $$
  select e.id, b.id, b.name, coalesce(pr.full_name, 'Customer'), p.id, p.name,
         (select m.body from public.enquiry_messages m where m.enquiry_id = e.id order by m.created_at desc limit 1),
         e.last_message_at,
         (select count(*)::int from public.enquiry_messages m
           where m.enquiry_id = e.id and m.sender_id <> auth.uid() and m.read_at is null),
         e.status
  from public.enquiries e
  join public.businesses b on b.id = e.business_id
  join public.profiles pr on pr.id = e.customer_id
  left join public.products p on p.id = e.product_id
  where (p_as = 'customer' and e.customer_id = auth.uid())
     or (p_as = 'seller' and b.owner_id = auth.uid())
  order by e.last_message_at desc;
$$;

create or replace function public.unread_counts()
returns table (notifications int, enquiries int)
language sql stable security definer set search_path = public as $$
  select
    (select count(*)::int from public.notifications where user_id = auth.uid() and read_at is null),
    (select count(*)::int from public.enquiry_messages m join public.enquiries e on e.id = m.enquiry_id
       join public.businesses b on b.id = e.business_id
      where m.read_at is null and m.sender_id <> auth.uid()
        and (e.customer_id = auth.uid() or b.owner_id = auth.uid()));
$$;

-- ---------------------------------------------------------------------
-- Seller lifecycle
-- ---------------------------------------------------------------------
create or replace function public.become_seller()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'login_required' using errcode = '28000'; end if;
  update public.profiles set role = 'seller' where id = auth.uid() and role = 'customer';
end $$;

-- Validates the application is complete, then moves draft/rejected → pending
create or replace function public.submit_business_for_review()
returns public.business_status language plpgsql security definer set search_path = public as $$
declare b public.businesses; missing text[] := '{}';
begin
  select * into b from public.businesses where owner_id = auth.uid();
  if not found then raise exception 'no_business'; end if;
  if b.status not in ('draft', 'rejected') then raise exception 'invalid_status:%', b.status; end if;

  if b.category_id is null            then missing := missing || 'category'; end if;
  if b.description is null            then missing := missing || 'description'; end if;
  if b.logo_url is null               then missing := missing || 'logo'; end if;
  if b.location is null               then missing := missing || 'location'; end if;
  if b.instagram_handle is null       then missing := missing || 'instagram_handle'; end if;
  if not exists (select 1 from public.business_contacts where business_id = b.id) then missing := missing || 'contacts'; end if;
  if not exists (select 1 from public.products where business_id = b.id and is_active) then missing := missing || 'at_least_one_product'; end if;
  if array_length(missing, 1) > 0 then
    raise exception 'incomplete_application:%', array_to_string(missing, ',');
  end if;

  update public.businesses set status = 'pending', submitted_at = now(), rejection_reason = null where id = b.id;
  return 'pending';
end $$;

-- ---------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------
create or replace function public.admin_set_business_status(
  p_business uuid, p_status public.business_status, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare b public.businesses;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into b from public.businesses where id = p_business for update;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;

  if not (
       (b.status = 'pending'     and p_status in ('approved', 'rejected'))
    or (b.status = 'approved'    and p_status = 'unpublished')
    or (b.status = 'unpublished' and p_status = 'approved')
    or (b.status = 'rejected'    and p_status = 'approved')
  ) then
    raise exception 'invalid_transition:%->%', b.status, p_status;
  end if;
  if p_status in ('rejected', 'unpublished') and coalesce(btrim(p_reason), '') = '' then
    raise exception 'reason_required';
  end if;

  update public.businesses set
    status = p_status,
    rejection_reason = case when p_status in ('rejected', 'unpublished') then p_reason else null end,
    approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else approved_at end,
    approved_by = case when p_status = 'approved' then auth.uid() else approved_by end
  where id = p_business;

  insert into public.admin_actions (admin_id, business_id, action, reason)
  values (auth.uid(), p_business,
          case p_status when 'approved' then (case when b.status = 'unpublished' then 'republish' else 'approve' end)
                        when 'rejected' then 'reject' else 'unpublish' end,
          p_reason);

  insert into public.notifications (user_id, type, title, body, link)
  values (b.owner_id,
          case p_status when 'approved' then 'business_approved'::public.notification_type
                        when 'rejected' then 'business_rejected'::public.notification_type
                        else 'business_unpublished'::public.notification_type end,
          case p_status when 'approved' then b.name || ' is live on Tibu 🎉'
                        when 'rejected' then 'Your application needs changes'
                        else b.name || ' has been unpublished' end,
          p_reason, '/seller');
end $$;

-- Admin dashboard list (includes contacts for verification)
create or replace function public.admin_list_businesses(p_status public.business_status default 'pending')
returns table (id uuid, name text, slug text, status public.business_status, category_name text,
               owner_name text, owner_email text, phone text, whatsapp text, instagram_handle text,
               locality text, submitted_at timestamptz, product_count int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
  select b.id, b.name, b.slug, b.status, c.name, p.full_name, u.email::text, bc.phone, bc.whatsapp,
         b.instagram_handle, b.locality, b.submitted_at,
         (select count(*)::int from public.products x where x.business_id = b.id)
  from public.businesses b
  join public.profiles p on p.id = b.owner_id
  join auth.users u on u.id = b.owner_id
  left join public.categories c on c.id = b.category_id
  left join public.business_contacts bc on bc.business_id = b.id
  where p_status is null or b.status = p_status
  order by b.submitted_at desc nulls last, b.created_at desc;
end $$;

-- ---------------------------------------------------------------------
-- Seller "basic figures" (Phase 1 only; advanced analytics = Phase 2)
-- ---------------------------------------------------------------------
create or replace function public.my_business_stats()
returns table (contacts_7d int, contacts_30d int, whatsapp_30d int, calls_30d int,
               saves int, open_enquiries int, rating_avg numeric, rating_count int)
language sql stable security definer set search_path = public as $$
  with b as (select id, rating_avg, rating_count from public.businesses where owner_id = auth.uid())
  select
    (select count(*)::int from public.contact_events ce, b where ce.business_id = b.id and ce.created_at > now() - interval '7 days'),
    (select count(*)::int from public.contact_events ce, b where ce.business_id = b.id and ce.created_at > now() - interval '30 days'),
    (select count(*)::int from public.contact_events ce, b where ce.business_id = b.id and ce.channel = 'whatsapp' and ce.created_at > now() - interval '30 days'),
    (select count(*)::int from public.contact_events ce, b where ce.business_id = b.id and ce.channel = 'call' and ce.created_at > now() - interval '30 days'),
    (select count(*)::int from public.saved_businesses s, b where s.business_id = b.id),
    (select count(*)::int from public.enquiries e, b where e.business_id = b.id and e.status = 'open'),
    (select rating_avg from b), (select rating_count from b);
$$;

-- ---------------------------------------------------------------------
-- Cron jobs (scheduled in cron.sql — not callable by clients)
-- ---------------------------------------------------------------------
create or replace function public.job_reset_available_today()
returns void language sql security definer set search_path = public as $$
  update public.businesses set available_today = false where available_today;
  update public.products   set available_today = false where available_today;
$$;

create or replace function public.job_new_business_digest(p_radius_km double precision default 5)
returns int language plpgsql security definer set search_path = public, extensions as $$
declare v_rows int;
begin
  insert into public.notifications (user_id, type, title, link, payload)
  select p.id, 'digest_new_businesses',
         n.cnt || case when n.cnt = 1 then ' new business' else ' new businesses' end
               || ' joined Tibu near ' || coalesce(p.home_locality, 'you'),
         '/search?tab=businesses&sort=newest',
         jsonb_build_object('count', n.cnt)
  from public.profiles p
  cross join lateral (
    select count(*)::int as cnt from public.businesses b
    where b.status = 'approved' and b.approved_at > now() - interval '24 hours'
      and st_dwithin(b.location, p.home_location, p_radius_km * 1000)
  ) n
  where p.notify_digest and p.home_location is not null and n.cnt > 0;
  get diagnostics v_rows = row_count;
  return v_rows;
end $$;

-- ---------------------------------------------------------------------
-- Execute grants: lock down admin/cron functions
-- ---------------------------------------------------------------------
revoke execute on function public.job_reset_available_today()          from public, anon, authenticated;
revoke execute on function public.job_new_business_digest(double precision) from public, anon, authenticated;
revoke execute on function public.recompute_business_rating(uuid)      from public, anon, authenticated;
revoke execute on function public.admin_set_business_status(uuid, public.business_status, text) from public, anon;
revoke execute on function public.admin_list_businesses(public.business_status) from public, anon;
revoke execute on function public.submit_business_for_review() from public, anon;
revoke execute on function public.become_seller()              from public, anon;
revoke execute on function public.send_enquiry(uuid, text, uuid) from public, anon;
revoke execute on function public.mark_enquiry_read(uuid)       from public, anon;
grant  execute on function public.admin_set_business_status(uuid, public.business_status, text) to authenticated;
grant  execute on function public.admin_list_businesses(public.business_status) to authenticated;
grant  execute on function public.submit_business_for_review() to authenticated;
grant  execute on function public.become_seller()              to authenticated;
grant  execute on function public.send_enquiry(uuid, text, uuid) to authenticated;
grant  execute on function public.mark_enquiry_read(uuid)       to authenticated;
