-- Run with psql on a disposable database with migrations through 0011 applied.
-- Connect as postgres for fixture setup. The assertions run as authenticated users.
-- All fixture rows roll back. Expected result: three OK notices and ROLLBACK.
\set ON_ERROR_STOP 1
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('c2000000-0000-0000-0000-000000000001', 'c2-owner-a@example.invalid', '{"signup_as":"seller"}'),
  ('c2000000-0000-0000-0000-000000000002', 'c2-owner-b@example.invalid', '{"signup_as":"seller"}'),
  ('c2000000-0000-0000-0000-000000000003', 'c2-customer@example.invalid', '{}');

insert into public.businesses (id, owner_id, slug, name, status) values
  ('c2100000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000001',
    'c2-shop-a', 'C2 Shop A', 'approved'),
  ('c2100000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002',
    'c2-shop-b', 'C2 Shop B', 'approved');

insert into public.products (id, business_id, name, price_paise) values
  ('c2200000-0000-0000-0000-000000000001', 'c2100000-0000-0000-0000-000000000001', 'Product A', 1000),
  ('c2200000-0000-0000-0000-000000000002', 'c2100000-0000-0000-0000-000000000002', 'Product B', 1000),
  ('c2200000-0000-0000-0000-000000000003', 'c2100000-0000-0000-0000-000000000002', 'Product C', 1000);

-- Simulate a legacy mismatch and give the seller a second conversation.
insert into public.enquiries (id, customer_id, business_id, product_id) values
  ('c2300000-0000-0000-0000-000000000001', 'c2000000-0000-0000-0000-000000000003',
    'c2100000-0000-0000-0000-000000000001', 'c2200000-0000-0000-0000-000000000002'),
  ('c2300000-0000-0000-0000-000000000002', 'c2000000-0000-0000-0000-000000000002',
    'c2100000-0000-0000-0000-000000000001', null);

set local role authenticated;
set local request.jwt.claim.sub = 'c2000000-0000-0000-0000-000000000001';

do $$
declare
  v_shop_thread constant uuid := 'c2300000-0000-0000-0000-000000000001';
  v_other_shop_thread constant uuid := 'c2300000-0000-0000-0000-000000000002';
  v_written_at timestamptz;
begin
  insert into public.enquiry_messages (enquiry_id, sender_id, body, created_at)
  values (v_shop_thread, auth.uid(), 'Reply with backdated input', now() - interval '2 hours')
  returning created_at into v_written_at;
  if v_written_at < transaction_timestamp() or v_written_at > clock_timestamp() then
    raise exception 'Expected a database timestamp, got %', v_written_at;
  end if;

  insert into public.enquiry_messages (enquiry_id, sender_id, body)
  select v_shop_thread, auth.uid(), 'Reply ' || n from generate_series(2, 100) as n;

  begin
    insert into public.enquiry_messages (enquiry_id, sender_id, body, created_at)
    values (v_other_shop_thread, auth.uid(), 'Reply 101', now() - interval '2 hours');
    raise exception 'Expected the 101st reply across threads to be rejected';
  exception when sqlstate '53400' then
    if sqlerrm <> 'rate_limited' then raise; end if;
  end;
  raise notice 'OK seller can send 100 replies, and backdating cannot bypass the limit';
end $$;

-- The same account now shops as a customer, after using all 100 seller slots.
do $$
declare
  v_shop constant uuid := 'c2100000-0000-0000-0000-000000000002';
  v_wrong_product constant uuid := 'c2200000-0000-0000-0000-000000000001';
  v_product constant uuid := 'c2200000-0000-0000-0000-000000000002';
  v_changed_product constant uuid := 'c2200000-0000-0000-0000-000000000003';
  v_thread uuid;
begin
  begin
    perform public.send_enquiry(v_shop, 'Wrong shop on new thread', v_wrong_product);
    raise exception 'Expected wrong product on new thread to be rejected';
  exception when check_violation then
    if sqlerrm <> 'product_not_in_business' then raise; end if;
  end;

  begin
    perform public.send_enquiry(v_shop, 'Unknown product', 'c2200000-0000-0000-0000-000000000099');
    raise exception 'Expected missing product to be rejected';
  exception when check_violation then
    if sqlerrm <> 'product_not_in_business' then raise; end if;
  end;

  v_thread := public.send_enquiry(v_shop, 'Customer message 1 without product');
  perform public.send_enquiry(v_shop, 'Customer message 2 with product', v_product);
  perform public.send_enquiry(v_shop, 'Customer message 3 with changed product', v_changed_product);

  begin
    perform public.send_enquiry(v_shop, 'Wrong replacement', v_wrong_product);
    raise exception 'Expected wrong replacement product to be rejected';
  exception when check_violation then
    if sqlerrm <> 'product_not_in_business' then raise; end if;
  end;
  if (select product_id from public.enquiries where id = v_thread) is distinct from v_changed_product then
    raise exception 'Expected the valid replacement product to remain on the thread';
  end if;

  insert into public.enquiry_messages (enquiry_id, sender_id, body)
  select v_thread, auth.uid(), 'Customer message ' || n from generate_series(4, 20) as n;

  begin
    perform public.send_enquiry(v_shop, 'Customer message 21 via RPC');
    raise exception 'Expected the RPC to reject the 21st customer message';
  exception when sqlstate '53400' then
    if sqlerrm <> 'rate_limited' then raise; end if;
  end;

  begin
    insert into public.enquiry_messages (enquiry_id, sender_id, body)
    values (v_thread, auth.uid(), 'Customer message 21 via direct insert');
    raise exception 'Expected direct insert to reject the 21st customer message';
  exception when sqlstate '53400' then
    if sqlerrm <> 'rate_limited' then raise; end if;
  end;
  raise notice 'OK new and changed products validated, and seller replies do not spend customer slots';
end $$;

set local request.jwt.claim.sub = 'c2000000-0000-0000-0000-000000000003';
do $$
declare
  v_shop constant uuid := 'c2100000-0000-0000-0000-000000000001';
  v_legacy_product constant uuid := 'c2200000-0000-0000-0000-000000000002';
  v_thread constant uuid := 'c2300000-0000-0000-0000-000000000001';
begin
  if public.send_enquiry(v_shop, 'Follow-up reusing legacy product', v_legacy_product)
     is distinct from v_thread then
    raise exception 'Expected the existing thread to be reused';
  end if;
  perform public.send_enquiry(v_shop, 'Follow-up without a product');
  if (select product_id from public.enquiries where id = v_thread) is distinct from v_legacy_product then
    raise exception 'Expected the existing product to be preserved';
  end if;
  raise notice 'OK legacy product can be reused or omitted in a follow-up';
end $$;

rollback;
