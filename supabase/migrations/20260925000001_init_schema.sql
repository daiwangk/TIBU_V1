-- =====================================================================
-- Tibu Phase 1 — 0001: extensions, enums, tables, indexes
-- Run order: 0001 → 0006. All migrations are idempotent-safe for a fresh DB.
-- Conventions:
--   * All PKs are uuid (gen_random_uuid) except append-only logs (bigint identity)
--   * Money is integer paise (₹350 = 35000). Format in the UI only.
--   * Location is lat/lng columns (what the app reads/writes) + a PostGIS
--     geography column maintained by trigger (what search uses).
--   * Timestamps are timestamptz, stored UTC, displayed in Asia/Kolkata.
-- =====================================================================

create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------- Enums ----------
create type public.user_role        as enum ('customer', 'seller', 'admin');
create type public.business_status  as enum ('draft', 'pending', 'approved', 'rejected', 'unpublished');
create type public.contact_channel  as enum ('whatsapp', 'call');
create type public.enquiry_status   as enum ('open', 'closed');
create type public.notification_type as enum (
  'enquiry_new',            -- seller: a customer sent a new message
  'enquiry_reply',          -- customer: seller replied
  'business_approved',      -- seller
  'business_rejected',      -- seller
  'business_unpublished',   -- seller
  'review_new',             -- seller
  'digest_new_businesses',  -- customer: "8 new businesses joined Tibu near Andheri"
  'system'
);

-- ---------- Profiles (1:1 with auth.users) ----------
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            public.user_role not null default 'customer',
  full_name       text check (char_length(full_name) <= 80),
  phone           text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  avatar_url      text,
  home_locality   text,                          -- e.g. "Andheri West" (for digest copy)
  home_lat        double precision check (home_lat between -90 and 90),
  home_lng        double precision check (home_lng between -180 and 180),
  home_location   geography(Point, 4326),        -- maintained by trigger
  notify_digest   boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- Categories (2-level hierarchy) ----------
create table public.categories (
  id          bigint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  parent_id   bigint references public.categories(id) on delete restrict,
  icon        text,                               -- emoji or icon name for UI chips
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Businesses (Phase 1: one business per seller) ----------
create table public.businesses (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null unique references public.profiles(id) on delete cascade,
  slug                 text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                 text not null check (char_length(name) between 2 and 80),
  category_id          bigint references public.categories(id),
  description          text check (char_length(description) <= 2000),
  logo_url             text,
  banner_url           text,
  instagram_handle     text check (instagram_handle is null or instagram_handle ~ '^[A-Za-z0-9._]{1,30}$'),
  address_text         text check (char_length(address_text) <= 300),
  locality             text,                      -- "Bandra West"
  city                 text not null default 'Mumbai',
  lat                  double precision check (lat between -90 and 90),
  lng                  double precision check (lng between -180 and 180),
  location             geography(Point, 4326),    -- maintained by trigger from lat/lng
  delivery_available   boolean not null default false,
  pickup_available     boolean not null default false,
  available_today      boolean not null default false,
  available_today_at   timestamptz,
  status               public.business_status not null default 'draft',
  rejection_reason     text,
  rating_avg           numeric(2,1) not null default 0,   -- maintained by trigger
  rating_count         int not null default 0,            -- maintained by trigger
  submitted_at         timestamptz,
  approved_at          timestamptz,
  approved_by          uuid references public.profiles(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Contact numbers are split out so they are NEVER publicly readable.
-- Customers get them only via rpc reveal_contact() after login.
create table public.business_contacts (
  business_id  uuid primary key references public.businesses(id) on delete cascade,
  phone        text not null check (phone ~ '^[6-9][0-9]{9}$'),
  whatsapp     text not null check (whatsapp ~ '^[6-9][0-9]{9}$'),
  updated_at   timestamptz not null default now()
);

create table public.business_images (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  storage_path  text not null,
  url           text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table public.business_videos (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  instagram_url  text not null,
  shortcode      text not null check (shortcode ~ '^[A-Za-z0-9_-]{5,40}$'),
  caption        text check (char_length(caption) <= 200),
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  unique (business_id, shortcode)
);

-- ---------- Products ----------
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses(id) on delete cascade,
  name                text not null check (char_length(name) between 2 and 100),
  price_paise         int not null check (price_paise >= 0 and price_paise <= 100000000),
  description         text check (char_length(description) <= 2000),
  details             jsonb not null default '{}'::jsonb,   -- {"weight":"500g","serves":"4"}
  category_id         bigint references public.categories(id),  -- null = inherit business category
  available_today     boolean not null default false,
  available_today_at  timestamptz,
  is_active           boolean not null default true,
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  url           text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- Reviews (one per customer per business) ----------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  reviewer_name  text not null default 'Tibu user',   -- denormalised first name, set by trigger
  rating         smallint not null check (rating between 1 and 5),
  body           text check (char_length(body) <= 1000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (business_id, user_id)
);

-- ---------- Customer lists ----------
create table public.saved_businesses (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table public.saved_products (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.recent_views (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  business_id  uuid references public.businesses(id) on delete cascade,
  product_id   uuid references public.products(id) on delete cascade,
  viewed_at    timestamptz not null default now(),
  check (num_nonnulls(business_id, product_id) = 1)
);

-- Every WhatsApp/Call tap. Powers "Previously connected" + seller basic figures.
create table public.contact_events (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  business_id  uuid not null references public.businesses(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  channel      public.contact_channel not null,
  created_at   timestamptz not null default now()
);

-- ---------- Enquiries (non-real-time messaging) ----------
-- One thread per (customer, business). product_id = product the thread started from.
create table public.enquiries (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.profiles(id) on delete cascade,
  business_id      uuid not null references public.businesses(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  status           public.enquiry_status not null default 'open',
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  unique (customer_id, business_id)
);

create table public.enquiry_messages (
  id          bigint generated always as identity primary key,
  enquiry_id  uuid not null references public.enquiries(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

-- ---------- Notifications (in-app inbox) ----------
create table public.notifications (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null,
  title       text not null,
  body        text,
  link        text,                                -- in-app route, e.g. /enquiries/<id>
  payload     jsonb not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------- Admin audit log ----------
create table public.admin_actions (
  id           bigint generated always as identity primary key,
  admin_id     uuid not null references public.profiles(id),
  business_id  uuid references public.businesses(id) on delete set null,
  action       text not null,        -- approve | reject | unpublish | republish
  reason       text,
  created_at   timestamptz not null default now()
);

-- ---------- Indexes ----------
create index businesses_location_gix   on public.businesses using gist (location);
create index businesses_status_idx     on public.businesses (status);
create index businesses_category_idx   on public.businesses (category_id);
create index businesses_approved_idx   on public.businesses (approved_at desc) where status = 'approved';
create index businesses_name_trgm      on public.businesses using gin (name extensions.gin_trgm_ops);
create index profiles_home_gix         on public.profiles using gist (home_location);
create index categories_parent_idx     on public.categories (parent_id);
create index products_business_idx     on public.products (business_id);
create index products_created_idx      on public.products (created_at desc);
create index products_name_trgm        on public.products using gin (name extensions.gin_trgm_ops);
create index product_images_prod_idx   on public.product_images (product_id, sort_order);
create index business_images_biz_idx   on public.business_images (business_id, sort_order);
create index business_videos_biz_idx   on public.business_videos (business_id, sort_order);
create index reviews_business_idx      on public.reviews (business_id, created_at desc);
create index recent_views_user_idx     on public.recent_views (user_id, viewed_at desc);
create index contact_events_user_idx   on public.contact_events (user_id, created_at desc);
create index contact_events_biz_idx    on public.contact_events (business_id, created_at desc);
create index enquiries_business_idx    on public.enquiries (business_id, last_message_at desc);
create index enquiries_customer_idx    on public.enquiries (customer_id, last_message_at desc);
create index enquiry_messages_thr_idx  on public.enquiry_messages (enquiry_id, created_at);
create index notifications_user_idx    on public.notifications (user_id, created_at desc);
create index notifications_unread_idx  on public.notifications (user_id) where read_at is null;
