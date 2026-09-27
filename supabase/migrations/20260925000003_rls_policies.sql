-- =====================================================================
-- Tibu Phase 1 — 0003: Row-Level Security
-- Rule of thumb: every table has RLS ON. No policy = no access.
-- Writes that need cross-table logic go through RPCs in 0004 instead.
-- =====================================================================

alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.businesses        enable row level security;
alter table public.business_contacts enable row level security;
alter table public.business_images   enable row level security;
alter table public.business_videos   enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.reviews           enable row level security;
alter table public.saved_businesses  enable row level security;
alter table public.saved_products    enable row level security;
alter table public.recent_views      enable row level security;
alter table public.contact_events    enable row level security;
alter table public.enquiries         enable row level security;
alter table public.enquiry_messages  enable row level security;
alter table public.notifications     enable row level security;
alter table public.admin_actions     enable row level security;

-- ---------- profiles ----------
create policy profiles_select_own   on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own   on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- (insert happens via handle_new_user trigger; delete via auth user deletion)

-- ---------- categories ----------
create policy categories_read       on public.categories for select to anon, authenticated using (is_active or public.is_admin());
create policy categories_admin_all  on public.categories for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- businesses ----------
create policy businesses_read on public.businesses for select to anon, authenticated
  using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy businesses_insert_own on public.businesses for insert to authenticated
  with check (
    owner_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('seller', 'admin')));
create policy businesses_update_own on public.businesses for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy businesses_delete_admin on public.businesses for delete to authenticated using (public.is_admin());

-- ---------- business_contacts (owner + admin only; customers use rpc reveal_contact) ----------
create policy contacts_owner_read   on public.business_contacts for select to authenticated using (public.owns_business(business_id) or public.is_admin());
create policy contacts_owner_insert on public.business_contacts for insert to authenticated with check (public.owns_business(business_id));
create policy contacts_owner_update on public.business_contacts for update to authenticated using (public.owns_business(business_id)) with check (public.owns_business(business_id));

-- ---------- business_images / business_videos ----------
-- "visible parent" subquery inherits the businesses RLS above.
create policy business_images_read on public.business_images for select to anon, authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id));
create policy business_images_write on public.business_images for all to authenticated
  using (public.owns_business(business_id)) with check (public.owns_business(business_id));

create policy business_videos_read on public.business_videos for select to anon, authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id));
create policy business_videos_write on public.business_videos for all to authenticated
  using (public.owns_business(business_id)) with check (public.owns_business(business_id));

-- ---------- products / product_images ----------
create policy products_read on public.products for select to anon, authenticated
  using (
    (is_active and exists (select 1 from public.businesses b where b.id = business_id and b.status = 'approved'))
    or public.owns_business(business_id) or public.is_admin());
create policy products_write on public.products for all to authenticated
  using (public.owns_business(business_id)) with check (public.owns_business(business_id));
create policy products_admin on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy product_images_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
create policy product_images_write on public.product_images for all to authenticated
  using (public.owns_product(product_id)) with check (public.owns_product(product_id));

-- ---------- reviews ----------
create policy reviews_read on public.reviews for select to anon, authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id));
create policy reviews_insert on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and not public.owns_business(business_id)
    and exists (select 1 from public.businesses b where b.id = business_id and b.status = 'approved'));
create policy reviews_update_own on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reviews_delete on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------- saved lists / recent views ----------
create policy saved_businesses_own on public.saved_businesses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy saved_products_own on public.saved_products for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recent_views_own_read on public.recent_views for select to authenticated using (user_id = auth.uid());
create policy recent_views_own_del  on public.recent_views for delete to authenticated using (user_id = auth.uid());
-- inserts via rpc track_view

-- ---------- contact_events (insert only via rpc reveal_contact) ----------
create policy contact_events_read on public.contact_events for select to authenticated
  using (user_id = auth.uid() or public.owns_business(business_id) or public.is_admin());

-- ---------- enquiries ----------
create policy enquiries_read on public.enquiries for select to authenticated
  using (customer_id = auth.uid() or public.owns_business(business_id) or public.is_admin());
create policy enquiries_update_status on public.enquiries for update to authenticated
  using (customer_id = auth.uid() or public.owns_business(business_id))
  with check (customer_id = auth.uid() or public.owns_business(business_id));
-- create via rpc send_enquiry

create policy enquiry_messages_read on public.enquiry_messages for select to authenticated
  using (exists (select 1 from public.enquiries e where e.id = enquiry_id));   -- inherits enquiries RLS
create policy enquiry_messages_insert on public.enquiry_messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (select 1 from public.enquiries e
                where e.id = enquiry_id
                  and (e.customer_id = auth.uid() or public.owns_business(e.business_id))));
-- read receipts via rpc mark_enquiry_read

-- ---------- notifications ----------
create policy notifications_own_read   on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_own_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ---------- admin_actions ----------
create policy admin_actions_read on public.admin_actions for select to authenticated using (public.is_admin());

-- ---------- Column-level hardening ----------
-- Clients may only flip read_at on notifications.
revoke update on public.notifications from authenticated;
grant  update (read_at) on public.notifications to authenticated;
-- Clients may only change status on enquiries.
revoke update on public.enquiries from authenticated;
grant  update (status) on public.enquiries to authenticated;
