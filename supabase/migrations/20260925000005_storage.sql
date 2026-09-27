-- =====================================================================
-- Tibu Phase 1 — 0005: Storage buckets + policies
-- Path conventions (enforced by policy):
--   business-media/{business_id}/logo-<ts>.webp
--   business-media/{business_id}/banner-<ts>.webp
--   business-media/{business_id}/gallery/<uuid>.webp
--   business-media/{business_id}/products/{product_id}/<uuid>.webp
--   avatars/{user_id}/<uuid>.webp
-- Buckets are public-read (images are public anyway); writes are owner-only.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('business-media', 'business-media', true, 3145728, array['image/webp', 'image/jpeg', 'image/png']),
  ('avatars',        'avatars',        true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Safe uuid parse (bad folder names → null → policy false, no error)
create or replace function public.try_uuid(p text)
returns uuid language plpgsql immutable as $$
begin return p::uuid; exception when others then return null; end $$;

create policy "business-media owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'business-media'
              and public.owns_business(public.try_uuid((storage.foldername(name))[1])));
create policy "business-media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'business-media'
         and public.owns_business(public.try_uuid((storage.foldername(name))[1])));
create policy "business-media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'business-media'
         and (public.owns_business(public.try_uuid((storage.foldername(name))[1])) or public.is_admin()));

create policy "avatars owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
