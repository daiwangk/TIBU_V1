-- Run ONLY against a local/dev database (supabase start). Creates fake users.
-- psql "$DEV_DB_URL" -f supabase/tests/rls_smoke_test.sql
-- Expected: every NOTICE says OK, rating becomes 4.0, 4 notifications + 1 digest.
\set ON_ERROR_STOP 1
insert into auth.users(id,email,raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111111','seller@x.in','{"full_name":"Priya Baker","signup_as":"seller"}'),
 ('22222222-2222-2222-2222-222222222222','cust@x.in','{"full_name":"Rahul Mehta","signup_as":"admin"}'),
 ('33333333-3333-3333-3333-333333333333','admin@x.in','{"full_name":"Laiba"}');
update profiles set role='admin' where id='33333333-3333-3333-3333-333333333333';
update profiles set home_lat=19.1197, home_lng=72.8468, home_locality='Andheri West' where id='22222222-2222-2222-2222-222222222222';
select id, role, full_name from profiles order by id;

-- seller session
begin;
set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
insert into businesses(owner_id,slug,name,category_id,description,logo_url,instagram_handle,lat,lng,locality,status)
 values (auth.uid(),'sweet-crumbs','Sweet Crumbs',(select id from categories where slug='desserts'),'Cookies','https://x/logo.webp','sweetcrumbs',19.0596,72.8295,'Bandra West','approved');
select name,status,location is not null as has_geo from businesses;
update businesses set status='approved', rating_avg=5 where owner_id=auth.uid();
select 'after self-approve attempt', status, rating_avg from businesses;
insert into business_contacts values ((select id from businesses where owner_id=auth.uid()),'9876543210','9876543210');
insert into products(business_id,name,price_paise) values ((select id from businesses where owner_id=auth.uid()),'Chocolate Chunk Cookies',35000);
select submit_business_for_review();
commit;

-- try self-promote customer to admin
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
do $$ begin update profiles set role='admin' where id=auth.uid(); raise notice 'BAD: role changed'; exception when others then raise notice 'OK blocked: %', sqlerrm; end $$;
-- customer cannot see pending business
select 'customer sees pending?', count(*) from businesses;
commit;

-- admin approves
begin; set local role authenticated; set local request.jwt.claim.sub='33333333-3333-3333-3333-333333333333';
select name, phone, product_count from admin_list_businesses('pending');
select admin_set_business_status((select id from businesses limit 1),'approved');
commit;

-- anon search
begin; set local role anon;
select name, category_slug, round(distance_m) dist_m from search_businesses(19.1197,72.8468,15,'desserts');
select name, price_paise, business_name, round(distance_m) from search_products(19.1197,72.8468,15,null,'cookie');
select 'anon contacts visible', count(*) from business_contacts;
do $$ begin perform reveal_contact((select id from businesses limit 1),'whatsapp'); raise notice 'BAD'; exception when others then raise notice 'OK anon reveal blocked: %', sqlerrm; end $$;
commit;

-- customer
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
select 'cust contacts direct', count(*) from business_contacts;
select * from reveal_contact((select id from businesses limit 1),'whatsapp');
insert into reviews(business_id,user_id,rating,body) values ((select id from businesses limit 1), auth.uid(), 4, 'Great cookies');
select send_enquiry((select id from businesses limit 1),'Do you deliver to Andheri?', (select id from products limit 1)) is not null as enquiry_ok;
insert into saved_businesses(user_id,business_id) values (auth.uid(),(select id from businesses limit 1));
select track_view(p_product := (select id from products limit 1));
select name from my_connected_businesses();
commit;
select name, rating_avg, rating_count from businesses;

-- seller replies
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
select business_name, customer_name, last_message, unread from my_enquiries('seller');
insert into enquiry_messages(enquiry_id,sender_id,body) values ((select id from enquiries limit 1), auth.uid(), 'Yes, ₹50 delivery');
select mark_enquiry_read((select id from enquiries limit 1));
select * from my_business_stats();
do $$ begin insert into reviews(business_id,user_id,rating) values ((select id from businesses limit 1), auth.uid(), 5); raise notice 'BAD self review'; exception when others then raise notice 'OK self-review blocked'; end $$;
commit;

select user_id, type, title from notifications order by id;
select job_new_business_digest(10);
select title from notifications where type='digest_new_businesses';
select job_reset_available_today();
