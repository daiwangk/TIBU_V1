-- =====================================================================
-- Run ONCE per project, AFTER enabling the pg_cron extension
-- (Dashboard → Database → Extensions → pg_cron). Times are UTC.
-- =====================================================================

-- 00:00 IST (18:30 UTC): clear "Available Today" toggles so the section never shows stale items.
-- ⚠ Confirm with client: SOW says "manual toggle". Daily reset is our recommendation.
select cron.schedule('tibu-reset-available-today', '30 18 * * *',
  $$ select public.job_reset_available_today(); $$);

-- 10:30 IST (05:00 UTC): grouped "N new businesses near <area>" in-app digest.
select cron.schedule('tibu-new-business-digest', '0 5 * * *',
  $$ select public.job_new_business_digest(5); $$);

-- Housekeeping: drop read notifications older than 90 days (03:00 IST).
select cron.schedule('tibu-notifications-cleanup', '30 21 * * *',
  $$ delete from public.notifications where read_at is not null and created_at < now() - interval '90 days'; $$);

-- Inspect / remove:
--   select * from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 20;
--   select cron.unschedule('tibu-new-business-digest');
