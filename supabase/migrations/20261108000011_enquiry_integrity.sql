-- Apply the rolling limits to every message insert, including direct replies.
create index enquiry_messages_sender_created_idx
  on public.enquiry_messages (sender_id, created_at);

create function public.tg_enquiry_message_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_is_customer boolean;
  v_is_owner boolean;
  v_limit integer;
begin
  -- This runs before RLS checks the row. Reject forged senders before counting.
  if auth.uid() is not null and new.sender_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Keep this lock key and order in sync with send_enquiry below.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('tibu.enquiry_messages:' || new.sender_id::text, 0)
  );

  select e.customer_id = new.sender_id, b.owner_id = new.sender_id
    into v_is_customer, v_is_owner
    from public.enquiries e join public.businesses b on b.id = e.business_id
   where e.id = new.enquiry_id;
  if not found or not (v_is_customer or v_is_owner) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  -- Use database time after the lock, including for direct inserts with a supplied timestamp.
  new.created_at := pg_catalog.clock_timestamp();
  v_limit := case when v_is_customer then 20 else 100 end;
  if (
    select count(*)
      from public.enquiry_messages m
      join public.enquiries e on e.id = m.enquiry_id
      join public.businesses b on b.id = e.business_id
     where m.sender_id = new.sender_id
       and m.created_at > new.created_at - interval '1 hour'
       and (
         (v_is_customer and e.customer_id = m.sender_id)
         or (not v_is_customer and e.customer_id <> m.sender_id and b.owner_id = m.sender_id)
       )
  ) >= v_limit then
    raise exception 'rate_limited' using errcode = '53400';
  end if;
  return new;
end $$;

create trigger enquiry_message_before_insert
  before insert on public.enquiry_messages
  for each row execute function public.tg_enquiry_message_before_insert();

revoke execute on function public.tg_enquiry_message_before_insert()
  from public, anon, authenticated;

create or replace function public.send_enquiry(p_business uuid, p_body text, p_product uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_enquiry uuid;
  v_existing_product uuid;
  v_sender uuid := auth.uid();
begin
  if v_sender is null then raise exception 'login_required' using errcode = '28000'; end if;
  if not exists (select 1 from public.businesses where id = p_business and status = 'approved') then
    raise exception 'business_not_available' using errcode = 'P0002';
  end if;
  if public.owns_business(p_business) then raise exception 'cannot_enquire_own_business'; end if;

  -- Direct inserts take the sender lock before updating the thread in their AFTER trigger.
  -- Take it before the upsert too, so both paths acquire locks in the same order.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('tibu.enquiry_messages:' || v_sender::text, 0)
  );

  if p_product is not null then
    select e.product_id into v_existing_product
      from public.enquiries e
     where e.customer_id = v_sender and e.business_id = p_business;
    if p_product is distinct from v_existing_product then
      perform 1 from public.products p
       where p.id = p_product and p.business_id = p_business
       for share;
      if not found then
        raise exception 'product_not_in_business' using errcode = '23514';
      end if;
    end if;
  end if;

  insert into public.enquiries (customer_id, business_id, product_id)
  values (v_sender, p_business, p_product)
  on conflict (customer_id, business_id)
    do update set product_id = coalesce(excluded.product_id, public.enquiries.product_id)
  returning id into v_enquiry;

  insert into public.enquiry_messages (enquiry_id, sender_id, body)
  values (v_enquiry, v_sender, btrim(p_body));
  return v_enquiry;
end $$;
