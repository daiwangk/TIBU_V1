# 09 · SQL reconciliation (dev kit migrations vs. the contract) — 27 Sep 2026

I applied the dev kit's six migrations, in order, to PostgreSQL 16 + PostGIS 3.4 with Supabase-style stubs (roles `anon`/`authenticated`/`service_role`, `auth.users` + `auth.uid()`, `storage.buckets`/`storage.objects` + `storage.foldername()`, PostGIS in the `extensions` schema, database `search_path` including `extensions` as Supabase sets it). Then I ran the kit's smoke test and ten extra edge-case tests the frontend depends on.

## 1. What passed

| Check | Result |
|---|---|
| Migrations 0001–0006 apply in order | ✅ all six |
| Public tables | ✅ 17 |
| Tables without RLS | ✅ 0 |
| Category slugs vs. CONTRACT §2 | ✅ identical (one name differs: `food` is **"Home Food"**) |
| Smoke test | ✅ seller can't self-approve (status stays `draft`), can't self-promote to admin, customer can't see pending, anon/customer can't read contacts, anon `reveal_contact` blocked, customer reveal works, rating aggregates to 4.0, self-review blocked, distances real (Bandra → Andheri ≈ 6.9 km) |
| Storage policy | ✅ a seller can upload into `business-media/<own business id>/…`, is blocked from another business's folder |
| Enquiry replies | ✅ seller replies by direct insert into `enquiry_messages`; `send_enquiry` correctly refuses the seller (`cannot_enquire_own_business`) |
| Seller reading customer names | ✅ blocked by `profiles` RLS; available only through `my_enquiries()` (by design) |

## 2. Bug found and fixed

**`my_connected_businesses()` did not return "newest first".** `DISTINCT ON (b.id)` forces `ORDER BY b.id` first, so rows came back in uuid order and `LIMIT` kept an arbitrary subset. With 25 contacted businesses, `my_connected_businesses(5)` returned `biz-9, biz-17, biz-6, biz-25, biz-14` instead of `biz-25 … biz-21`. The "Previously connected" screen (SOW §3) would have shown random businesses.

**Fix:** `supabase-fixes/20260927000007_fix_connected_order.sql` (same signature, `create or replace`, safe anywhere). After applying: `biz-25, biz-24, biz-23, biz-22, biz-21` ✅. The full chain 0001 → 0007 plus the smoke test re-runs cleanly.

**Action (A1.2):** copy it into `supabase/migrations/` together with the kit's six files **before** the first `db push`.

## 3. Traps the frontend must respect (confirmed by test)

| # | Behaviour | Test result | Contract rule (v1.1) |
|---|---|---|---|
| T1 | `p_available_today => null` does **not** mean "don't filter" — SQL three-valued logic keeps only available-today rows | null → 6 rows, false → 31, omitted → 31 | Adapter always sends a boolean |
| T2 | Unknown `p_sort` values are silently ignored (fall back to newest) | `'nearest'` returned the newest business; `'distance'` returned the nearest | Contract sort values are the SQL ones: `distance`, `newest`, `rating`, `price_asc`, `price_desc` |
| T3 | `p_limit` is capped at 50 | `p_limit => 100` returned 50 | "Load more" uses `offset`, never a growing `limit` |
| T4 | With an origin, the default radius is 15 km | Thane business excluded from Bandra search by default, included with `p_radius_km => null` | `radiusKm` undefined → 15 km; `null` → no limit (distance still returned) |
| T5 | `search_businesses` returns `approved_at`, not `created_at` | — | `BusinessSummary.approvedAt` replaces `createdAt` |
| T6 | Table selects (business/product detail) don't return a distance | — | Adapter computes `distanceM` with haversine from `lat`/`lng` |
| T7 | Owners see their own inactive products through RLS | — | Public detail mapper filters `is_active` explicitly |

## 4. Contract changes (v1.0 → v1.1) caused by the SQL

- Sort values renamed to the SQL values (T2). URL param `?sort=distance`.
- `BusinessSummary.approvedAt` (T5); `ProductSummary` gains `businessLogoUrl`, `businessRating` (returned by `search_products`).
- `ConnectedItem.business` is a slim `BusinessRef` and has no product (the RPC returns neither product nor category).
- Enquiries follow the real RPCs: `sendEnquiry()` (customer; creates or reuses the thread and sends a message), `sendMessage()` (direct insert; seller replies and customer follow-ups), `findMyThread()`; `openThread()` removed. Thread list fields = `my_enquiries()` columns.
- Unread badges: one `getUnreadCounts()` → `{ notifications, enquiries }` (the `unread_counts()` RPC). `getUnreadEnquiryCount` / `getUnreadNotificationCount` removed.
- `SellerStats` = `my_business_stats()` columns.
- `ApplicationRow` = `admin_list_businesses()` columns (incl. owner email, phone, WhatsApp, product count; no pagination).
- New sections: error-code mapping (§11), validation limits from CHECK constraints (§12), storage paths (§13).

## 5. Supabase-only risks I could not test locally

1. **Extension schema / search_path.** The migrations rely on Supabase's database `search_path` including `extensions` (for the `geography` type). This is Supabase's default; on a plain Postgres the first migration fails with `type "geography" does not exist`, which is exactly what happened before I added it to the stubs. If `db push` shows this error, the project's search_path was changed — don't edit the migrations; fix the setting.
2. **`auth.users` trigger and `storage.objects` policies** run under Supabase's real ownership model. They're standard patterns but can differ from the stubs; they're the first place to look if `db push` fails (prompt D3).
3. **Table grants.** The stubs mimic Supabase's default privileges for `anon`/`authenticated`. If REST calls return `permission denied for table …` (not an empty array), the project isn't granting defaults. Ask before adding grants: a blanket grant would undo the column-level hardening on `notifications` and `enquiries` in 0003 unless those revokes are re-applied after it.
4. **The smoke test is a psql script.** Its first line (`\set ON_ERROR_STOP 1`) is a psql command and the Supabase SQL editor only shows the last result, not the NOTICE lines. Run it with psql (runbook §3).

## 6. Minor notes (no action for Phase 1)

- `reviews.user_id` is readable by anyone (anon has column privilege); it's a uuid, not personal data, but don't display it.
- Customer follow-up messages inserted directly bypass `send_enquiry`'s 20/hour rate limit. Acceptable for Phase 1; use `sendEnquiry()` for customer messages in the UI anyway.
- A seller tapping their own WhatsApp button is counted in their stats.
- Admins can read enquiry messages (`is_admin()` in the enquiries policy). Mention it in the privacy policy.
- `submit_business_for_review()` requires an active product but not a product image; the UI requires one image (D29).

## 7. Reproduce locally (optional)

`supabase-fixes/local-test-stubs.sql` is the stub file I used. On a machine with PostgreSQL 16 + PostGIS:
```bash
createdb tibu_test
psql -d tibu_test -c 'alter database tibu_test set search_path = "$user", public, extensions;'
psql -d tibu_test -v ON_ERROR_STOP=1 -f supabase-fixes/local-test-stubs.sql
for f in supabase/migrations/*.sql; do psql -d tibu_test -v ON_ERROR_STOP=1 -f "$f"; done
psql -d tibu_test -f supabase/tests/rls_smoke_test.sql
```
This is optional; the real target is `tibu-dev` on Supabase.
