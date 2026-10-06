-- 0008 · SOW Revision 2 (25 Sep 2026) §3 — fields the original schema doesn't have:
--   Business page: "expected delivery time", "est. since" (optional, seller-provided)
--   Product page:  "delivery availability", "expected delivery time"
--   Seller-facing: "set delivery/pick-up availability and expected delivery time at the
--                   business level and, where needed, override it per product"
--
-- Additive only: nullable columns + CHECK constraints. No data changes, no policy changes.
-- The existing policies already cover these columns because they live on the same rows:
--   businesses_read / products_read  → public can read them on approved, active rows
--   owner update policies            → only the owner (or admin) can write them
--   tg_businesses_guard              → does not touch these columns (they are seller-editable)
--
-- Product override rule (applied in the frontend mapper, not in SQL):
--   effective = coalesce(products.<col>, businesses.<col>)   NULL on the product = "same as my business"
--
-- Tested on Postgres 16 + PostGIS 3.4 with the Supabase stubs, after 0001–0007 (see 11_REV2_SQL_TESTS.md).

alter table public.businesses
  add column if not exists delivery_time text
    check (delivery_time is null or char_length(btrim(delivery_time)) between 1 and 40),
  add column if not exists established_year smallint
    check (established_year is null or established_year between 1900 and 2100);

comment on column public.businesses.delivery_time is
  'Seller-provided expected delivery time shown on the Business and Product pages, e.g. "Same day", "1–2 days". NULL = not stated.';
comment on column public.businesses.established_year is
  'Optional "est. since" year (SOW Rev2 §3). The UI also blocks years later than the current year.';

alter table public.products
  add column if not exists delivery_available boolean,
  add column if not exists pickup_available boolean,
  add column if not exists delivery_time text
    check (delivery_time is null or char_length(btrim(delivery_time)) between 1 and 40);

comment on column public.products.delivery_available is 'Per-product override. NULL = use businesses.delivery_available.';
comment on column public.products.pickup_available   is 'Per-product override. NULL = use businesses.pickup_available.';
comment on column public.products.delivery_time      is 'Per-product override. NULL = use businesses.delivery_time.';
