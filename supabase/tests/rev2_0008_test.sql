-- Rev2 test for migration 0008 (delivery fields). LOCAL TEST DATABASE ONLY — never dev or prod.
-- Run order on an empty local Postgres 16 + PostGIS with the build kit's supabase-fixes/local-test-stubs.sql:
--   stubs → supabase/migrations/0001…0007 → 0008 → supabase/tests/rls_smoke_test.sql → this file
-- It reuses the smoke test's users (seller 1111…, customer 2222…) and adds a second seller (4444…).
-- Expected: T1–T6 rows as in docs/build/11_SOW_REV2_CHANGES.md §2 and three "OK …" notices.
\set ON_ERROR_STOP 1
-- second seller with own business (draft)
insert into auth.users(id,email,raw_user_meta_data) values
 ('44444444-4444-4444-4444-444444444444','seller2@x.in','{"full_name":"Other Seller","signup_as":"seller"}') on conflict do nothing;
begin; set local role authenticated; set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
insert into businesses(owner_id,slug,name,category_id) values (auth.uid(),'other-shop','Other Shop',(select id from categories where slug='gifts'));
commit;

-- T1 owner writes new business + product columns
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
update businesses set delivery_time='Same day', established_year=2019, delivery_available=true, pickup_available=true where owner_id=auth.uid();
update products set delivery_available=false, delivery_time='2–3 days' where business_id=(select id from businesses where owner_id=auth.uid());
select 'T1 owner write', b.status, b.delivery_time, b.established_year, p.delivery_available, p.pickup_available, p.delivery_time
  from businesses b join products p on p.business_id=b.id where b.owner_id=auth.uid();
commit;

-- T2 another seller cannot change them (RLS: 0 rows updated, values unchanged)
begin; set local role authenticated; set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
update businesses set delivery_time='HACKED', established_year=1950 where slug='sweet-crumbs';
update products set delivery_time='HACKED' where business_id=(select id from businesses where slug='sweet-crumbs');
commit;
select 'T2 after other-seller attempt', delivery_time, established_year from businesses where slug='sweet-crumbs';
select 'T2 product after attempt', delivery_time from products where business_id=(select id from businesses where slug='sweet-crumbs');

-- T3 anon reads the new columns on approved rows, sees nothing from the draft
begin; set local role anon;
select 'T3 anon business', slug, delivery_time, established_year from businesses order by slug;
select 'T3 anon product + effective', p.name,
       coalesce(p.delivery_available, b.delivery_available) eff_delivery,
       coalesce(p.pickup_available,  b.pickup_available)    eff_pickup,
       coalesce(p.delivery_time,     b.delivery_time)       eff_time
  from products p join businesses b on b.id=p.business_id;
commit;

-- T4 CHECK constraints
do $$ begin update businesses set established_year=1850 where slug='sweet-crumbs'; raise notice 'BAD year accepted';
  exception when check_violation then raise notice 'OK year 1850 rejected'; end $$;
do $$ begin update businesses set delivery_time=repeat('x',41) where slug='sweet-crumbs'; raise notice 'BAD 41-char accepted';
  exception when check_violation then raise notice 'OK 41-char delivery_time rejected'; end $$;
do $$ begin update products set delivery_time='   ' where name='Chocolate Chunk Cookies'; raise notice 'BAD blank accepted';
  exception when check_violation then raise notice 'OK blank delivery_time rejected'; end $$;

-- T5 seller still cannot self-approve after 0008 (guard intact)
begin; set local role authenticated; set local request.jwt.claim.sub='44444444-4444-4444-4444-444444444444';
update businesses set status='approved', established_year=2020 where owner_id=auth.uid();
select 'T5 other-shop after self-approve attempt', status, established_year from businesses where owner_id=auth.uid();
commit;

-- T6 search RPCs unaffected
select 'T6 search_businesses rows', count(*) from search_businesses(p_available_today => false);
select 'T6 search_products rows', count(*) from search_products(p_available_today => false);
