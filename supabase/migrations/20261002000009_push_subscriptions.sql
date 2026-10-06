-- 0009 · SOW Revision 2 §3 — "paired with push notifications where the platform supports them".
-- Stores browser Web Push subscriptions. Sending happens outside SQL: a Supabase Database
-- Webhook on INSERT into public.notifications calls the Edge Function `send-push`
-- (see docs/build/12_PUSH_NOTIFICATIONS.md). Every push mirrors an in-app notification row,
-- so push adds no new notification types and the app stays fully usable without permission.
--
-- Why RPCs instead of direct inserts: an endpoint identifies a browser, not a person.
-- If two people use the same phone, the second login must take the endpoint over, but
-- RLS (correctly) hides the first person's row, so a plain upsert would fail. The
-- SECURITY DEFINER function deletes any row for that endpoint and inserts it for auth.uid().
--
-- Tested on Postgres 16 + PostGIS 3.4 with the Supabase stubs, after 0001–0008 (see 11_REV2_SQL_TESTS.md).

create table if not exists public.push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  endpoint      text not null unique
                  check (endpoint ~ '^https://' and char_length(endpoint) <= 1000),
  p256dh        text not null check (char_length(p256dh) between 20 and 200),
  auth          text not null check (char_length(auth) between 8 and 100),
  user_agent    text check (user_agent is null or char_length(user_agent) <= 300),
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- Users can see and delete only their own subscriptions. No direct insert/update policy:
-- writes go through save_push_subscription(). The Edge Function uses the service role.
drop policy if exists push_subscriptions_read_own on public.push_subscriptions;
create policy push_subscriptions_read_own on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

revoke insert, update on public.push_subscriptions from anon, authenticated;
revoke all on public.push_subscriptions from anon;

create or replace function public.save_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'login_required' using errcode = '28000';
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
  insert into public.push_subscriptions(user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300));
end $$;

create or replace function public.delete_push_subscription(p_endpoint text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'login_required' using errcode = '28000';
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
end $$;

revoke all on function public.save_push_subscription(text, text, text, text) from public, anon;
revoke all on function public.delete_push_subscription(text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;
