-- Run only on a dev/disposable database with migrations through 0012 applied; never production.
-- Example (local Supabase): psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/tests/h4_enquiry_contact_integrity_test.sql
-- Fixtures and assertions run in one transaction and roll back. Expected: three OK notices, then ROLLBACK.
\set ON_ERROR_STOP 1
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('a4000000-0000-0000-0000-000000000001', 'h4-owner-a@example.invalid', '{"signup_as":"seller"}'),
  ('a4000000-0000-0000-0000-000000000002', 'h4-owner-b@example.invalid', '{"signup_as":"seller"}'),
  ('a4000000-0000-0000-0000-000000000003', 'h4-customer@example.invalid', '{}');

insert into public.businesses (id, owner_id, slug, name, status) values
  ('a4100000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000001',
    'h4-shop-a', 'H4 Shop A', 'approved'),
  ('a4100000-0000-0000-0000-000000000002', 'a4000000-0000-0000-0000-000000000002',
    'h4-shop-b', 'H4 Shop B', 'approved');

insert into public.business_contacts (business_id, phone, whatsapp) values
  ('a4100000-0000-0000-0000-000000000001', '9876543210', '9876543210');

insert into public.products (id, business_id, name, price_paise) values
  ('a4200000-0000-0000-0000-000000000001', 'a4100000-0000-0000-0000-000000000001', 'Product A', 1000),
  ('a4200000-0000-0000-0000-000000000002', 'a4100000-0000-0000-0000-000000000002', 'Product B', 1000);

insert into public.enquiries (id, customer_id, business_id) values
  ('a4300000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000003',
    'a4100000-0000-0000-0000-000000000001');

set local role authenticated;
set local request.jwt.claim.sub = 'a4000000-0000-0000-0000-000000000003';

do $$
declare
  v_read_at timestamptz;
begin
  insert into public.enquiry_messages (enquiry_id, sender_id, body, read_at)
  values ('a4300000-0000-0000-0000-000000000001', auth.uid(), 'Cannot pre-mark as read', now())
  returning read_at into v_read_at;
  if v_read_at is not null then
    raise exception 'Inserted message was pre-marked as read';
  end if;
  raise notice 'OK a sender cannot set read_at on insert';
end $$;

do $$
declare
  v_business constant uuid := 'a4100000-0000-0000-0000-000000000001';
  v_own_product constant uuid := 'a4200000-0000-0000-0000-000000000001';
  v_other_product constant uuid := 'a4200000-0000-0000-0000-000000000002';
  v_phone text;
begin
  select phone into v_phone from public.reveal_contact(v_business, 'whatsapp', v_own_product);
  if v_phone is distinct from '9876543210' then
    raise exception 'Valid product reveal failed';
  end if;

  select phone into v_phone from public.reveal_contact(v_business, 'call');
  if v_phone is distinct from '9876543210' then
    raise exception 'Business reveal without product failed';
  end if;

  begin
    perform public.reveal_contact(v_business, 'whatsapp', v_other_product);
    raise exception 'Expected another business product to be rejected';
  exception when check_violation then
    if sqlerrm <> 'product_not_in_business' then raise; end if;
  end;

  begin
    perform public.reveal_contact(v_business, 'whatsapp', 'a4200000-0000-0000-0000-000000000099');
    raise exception 'Expected a missing product to be rejected';
  exception when check_violation then
    if sqlerrm <> 'product_not_in_business' then raise; end if;
  end;

  if (select count(*) from public.contact_events where user_id = auth.uid()) <> 2 then
    raise exception 'Rejected reveals must not log contact events';
  end if;
  raise notice 'OK valid reveals work and mismatched or missing products are rejected without events';
end $$;

set local request.jwt.claim.sub = 'a4000000-0000-0000-0000-000000000001';

do $$
declare
  v_thread constant uuid := 'a4300000-0000-0000-0000-000000000001';
  v_unread integer;
begin
  select unread into v_unread from public.my_enquiries('seller') where enquiry_id = v_thread;
  if v_unread is distinct from 1 then
    raise exception 'Seller inbox should show one unread message, got %', v_unread;
  end if;
  select enquiries into v_unread from public.unread_counts();
  if v_unread is distinct from 1 then
    raise exception 'Seller unread count should be one, got %', v_unread;
  end if;
  perform public.mark_enquiry_read(v_thread);
  select enquiries into v_unread from public.unread_counts();
  if v_unread is distinct from 0 then
    raise exception 'Marking the thread read should clear its count, got %', v_unread;
  end if;
  raise notice 'OK unread counts include the new message until the recipient marks it read';
end $$;

rollback;
