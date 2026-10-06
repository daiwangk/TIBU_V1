-- Rev2 test for migration 0009 (push subscriptions). LOCAL TEST DATABASE ONLY — never dev or prod.
-- Run after rev2_0008_test.sql (same database). Expected: P1–P8 as in 11_SOW_REV2_CHANGES.md §2,
-- "OK" notices for anon / direct-insert / http-endpoint, 18 tables, 0 without RLS.
\set ON_ERROR_STOP 1
\set ep '''https://fcm.googleapis.com/fcm/send/abc123'''
\set k '''BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM'''
-- P1 anon cannot call the RPC
begin; set local role anon;
do $$ begin perform save_push_subscription('https://x.example/1','BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4','authsecret1'); raise notice 'BAD anon saved';
  exception when insufficient_privilege then raise notice 'OK anon save blocked (no execute)'; end $$;
commit;
-- P2 customer saves; reads own
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
select save_push_subscription(:ep, :k, 'tBHItJI5svbpez7KI4CCXg', 'Mozilla/5.0 Android');
select 'P2 customer sees own', count(*) from push_subscriptions;
commit;
-- P3 seller on the same phone takes the endpoint over; customer row disappears
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
select 'P3 seller sees customer row before?', count(*) from push_subscriptions;
select save_push_subscription(:ep, :k, 'tBHItJI5svbpez7KI4CCXg', 'Mozilla/5.0 Android');
select 'P3 seller sees own after takeover', count(*) from push_subscriptions;
commit;
select 'P3 owner of endpoint now', p.full_name from push_subscriptions s join profiles p on p.id=s.user_id;
-- P4 direct insert by authenticated is refused
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
do $$ begin insert into push_subscriptions(user_id,endpoint,p256dh,auth) values (auth.uid(),'https://x.example/2',repeat('k',30),'authsecret1'); raise notice 'BAD direct insert';
  exception when insufficient_privilege then raise notice 'OK direct insert blocked'; end $$;
-- P5 customer can't delete seller's subscription via RPC or directly
select delete_push_subscription(:ep);
delete from push_subscriptions;
commit;
select 'P5 rows after customer delete attempts', count(*) from push_subscriptions;
-- P6 seller deletes own
begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
select delete_push_subscription(:ep);
commit;
select 'P6 rows after seller delete', count(*) from push_subscriptions;
-- P7 bad endpoint rejected
begin; set local role authenticated; set local request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
do $$ begin perform save_push_subscription('http://insecure.example/1', repeat('k',30), 'authsecret1'); raise notice 'BAD http endpoint accepted';
  exception when check_violation then raise notice 'OK non-https endpoint rejected'; end $$;
commit;
-- P8 global checks
select 'P8 tables', count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE';
select 'P8 tables without RLS', count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;
