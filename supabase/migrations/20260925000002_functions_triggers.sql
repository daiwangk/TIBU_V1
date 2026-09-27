-- =====================================================================
-- Tibu Phase 1 — 0002: helper functions + triggers
-- "Privileged" = running as postgres/service_role (SECURITY DEFINER functions,
-- cron jobs, dashboard). Direct client requests run as anon/authenticated.
-- =====================================================================

create or replace function public.is_privileged()
returns boolean language sql stable as $$
  select current_user in ('postgres', 'service_role', 'supabase_admin');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_business(p_business uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.businesses where id = p_business and owner_id = auth.uid());
$$;

create or replace function public.owns_product(p_product uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.products p join public.businesses b on b.id = p.business_id
    where p.id = p_product and b.owner_id = auth.uid());
$$;

-- ---------- updated_at ----------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger set_updated_at before update on public.profiles          for each row execute function public.tg_set_updated_at();
create trigger set_updated_at before update on public.businesses        for each row execute function public.tg_set_updated_at();
create trigger set_updated_at before update on public.business_contacts for each row execute function public.tg_set_updated_at();
create trigger set_updated_at before update on public.products          for each row execute function public.tg_set_updated_at();
create trigger set_updated_at before update on public.reviews           for each row execute function public.tg_set_updated_at();

-- ---------- lat/lng → geography ----------
create or replace function public.tg_business_location()
returns trigger language plpgsql set search_path = public, extensions as $$
begin
  if new.lat is not null and new.lng is not null then
    new.location := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  else
    new.location := null;
  end if;
  return new;
end $$;
create trigger business_location before insert or update of lat, lng on public.businesses
  for each row execute function public.tg_business_location();

create or replace function public.tg_profile_location()
returns trigger language plpgsql set search_path = public, extensions as $$
begin
  if new.home_lat is not null and new.home_lng is not null then
    new.home_location := st_setsrid(st_makepoint(new.home_lng, new.home_lat), 4326)::geography;
  else
    new.home_location := null;
  end if;
  return new;
end $$;
create trigger profile_location before insert or update of home_lat, home_lng on public.profiles
  for each row execute function public.tg_profile_location();

-- ---------- New auth user → profile ----------
-- Client signs up with options.data = { full_name, signup_as: 'customer'|'seller' }.
-- 'admin' can never be self-assigned; promote admins manually in SQL.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
    case when new.raw_user_meta_data->>'signup_as' = 'seller'
         then 'seller'::public.user_role else 'customer'::public.user_role end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Guard: users cannot change their own role ----------
create or replace function public.tg_profiles_guard()
returns trigger language plpgsql as $$
begin
  if not public.is_privileged() and new.role is distinct from old.role then
    raise exception 'role_change_not_allowed' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.tg_profiles_guard();

-- ---------- Guard: sellers cannot self-approve or edit system fields ----------
create or replace function public.tg_businesses_guard()
returns trigger language plpgsql as $$
begin
  if public.is_privileged() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'draft';
    new.rating_avg := 0; new.rating_count := 0;
    new.submitted_at := null; new.approved_at := null; new.approved_by := null;
    new.rejection_reason := null;
    return new;
  end if;
  -- UPDATE by owner: freeze system-managed columns
  new.owner_id         := old.owner_id;
  new.status           := old.status;
  new.rejection_reason := old.rejection_reason;
  new.rating_avg       := old.rating_avg;
  new.rating_count     := old.rating_count;
  new.submitted_at     := old.submitted_at;
  new.approved_at      := old.approved_at;
  new.approved_by      := old.approved_by;
  if new.available_today and not old.available_today then
    new.available_today_at := now();
  end if;
  return new;
end $$;
create trigger businesses_guard before insert or update on public.businesses
  for each row execute function public.tg_businesses_guard();

create or replace function public.tg_products_available_today()
returns trigger language plpgsql as $$
begin
  if new.available_today and (tg_op = 'INSERT' or not old.available_today) then
    new.available_today_at := now();
  end if;
  return new;
end $$;
create trigger products_available_today before insert or update on public.products
  for each row execute function public.tg_products_available_today();

-- ---------- Reviews: reviewer name + rating aggregate + seller notification ----------
-- Not SECURITY DEFINER on purpose: current_user must stay the caller so the
-- guard works. The reviewer can read their own profile under RLS.
create or replace function public.tg_reviews_before()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.is_privileged() then
    new.user_id := auth.uid();
    if tg_op = 'UPDATE' then new.business_id := old.business_id; end if;
  end if;
  select coalesce(nullif(split_part(btrim(full_name), ' ', 1), ''), 'Tibu user')
    into new.reviewer_name from public.profiles where id = new.user_id;
  new.reviewer_name := coalesce(new.reviewer_name, 'Tibu user');
  return new;
end $$;

create trigger reviews_before before insert or update on public.reviews
  for each row execute function public.tg_reviews_before();

create or replace function public.recompute_business_rating(p_business uuid)
returns void language sql security definer set search_path = public as $$
  update public.businesses b set
    rating_avg   = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where business_id = p_business), 0),
    rating_count = (select count(*) from public.reviews where business_id = p_business)
  where b.id = p_business;
$$;

create or replace function public.tg_reviews_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_name text;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recompute_business_rating(new.business_id);
  end if;
  if tg_op in ('DELETE', 'UPDATE') and (tg_op = 'DELETE' or old.business_id <> new.business_id) then
    perform public.recompute_business_rating(old.business_id);
  end if;
  if tg_op = 'INSERT' then
    select owner_id, name into v_owner, v_name from public.businesses where id = new.business_id;
    insert into public.notifications (user_id, type, title, body, link, payload)
    values (v_owner, 'review_new', 'New ' || new.rating || '★ review on ' || v_name,
            left(new.body, 140), '/seller/reviews', jsonb_build_object('review_id', new.id));
  end if;
  return null;
end $$;
create trigger reviews_after after insert or update or delete on public.reviews
  for each row execute function public.tg_reviews_after();

-- ---------- Enquiry messages: bump thread + notify the other party ----------
create or replace function public.tg_enquiry_message_after()
returns trigger language plpgsql security definer set search_path = public as $$
declare e record;
begin
  select q.id, q.customer_id, b.owner_id, b.name as business_name
    into e
    from public.enquiries q join public.businesses b on b.id = q.business_id
   where q.id = new.enquiry_id;

  update public.enquiries set last_message_at = new.created_at, status = 'open'
   where id = new.enquiry_id;

  if new.sender_id = e.customer_id then
    insert into public.notifications (user_id, type, title, body, link, payload)
    values (e.owner_id, 'enquiry_new', 'New enquiry', left(new.body, 140),
            '/seller/enquiries/' || e.id, jsonb_build_object('enquiry_id', e.id));
  else
    insert into public.notifications (user_id, type, title, body, link, payload)
    values (e.customer_id, 'enquiry_reply', e.business_name || ' replied', left(new.body, 140),
            '/enquiries/' || e.id, jsonb_build_object('enquiry_id', e.id));
  end if;
  return null;
end $$;
create trigger enquiry_message_after after insert on public.enquiry_messages
  for each row execute function public.tg_enquiry_message_after();
