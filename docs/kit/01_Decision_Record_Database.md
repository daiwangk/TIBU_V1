# 01 · Decision Record — Supabase (Postgres) vs MongoDB

**Status:** Accepted · **Date:** 25 Sep 2026 · **Owners:** Daiwang Khera, Deepak Bangari

## The question

Should Tibu's Phase 1 backend use MongoDB (e.g. MongoDB Atlas + a Node/Express API) or Supabase (managed Postgres + Auth + Storage)?

## Short answer

**Supabase.** MongoDB isn't a bad database, and it *could* store Tibu's data. But the choice isn't really "Mongo vs Postgres". It is:

- **(a)** Mongo **+** an API server you write and host **+** an auth system **+** file storage **+** access-control code, **vs**
- **(b)** Supabase, which ships all of those in one free project.

With two people, part-time, 4–5 weeks and ₹12,000, option (b) removes roughly a third of the work.

## Side-by-side for *this* project

| Need (from the SOW) | MongoDB route | Supabase route |
|---|---|---|
| Database | Atlas M0 free (512 MB) ✅ | Postgres free (500 MB) ✅ |
| **Backend API** | You write Express/Nest routes for every screen, then host them. Free Node hosts (e.g. Render) sleep → 30–50 s cold starts on first request | Auto-generated REST API from tables + RPC functions. Nothing to host |
| **Email/password login** | Build it yourself (bcrypt, JWT, refresh tokens, reset-password emails) or add Auth0/Clerk/Firebase Auth — another vendor | Built in, including password reset and email confirmation |
| **Who can see/edit what** (seller edits only their products, guests can't see phone numbers, only admin approves) | Middleware checks in every route. Miss one → data leak | Row-Level Security in the database. Enforced even if the frontend has a bug |
| **Nearby search sorted by distance** | `2dsphere` index + `$geoNear` ✅ (Mongo is genuinely good here) | PostGIS `ST_DWithin` / `ST_Distance` ✅ (industry standard) |
| **Image upload** | Separate service (Cloudinary/S3) + signed-upload endpoint | Storage built in, with the same access rules |
| Scheduled jobs (daily digest, reset "Available Today") | Separate cron service | `pg_cron` built in |
| Data shape | Documents: flexible | Tables: strict |
| Lock-in | Low | Low — it's plain Postgres; `pg_dump` and move anywhere |
| Phase 2 (orders, payments, order ↔ product ↔ customer ↔ seller) | Multi-document transactions work but are awkward | Relational + transactions are Postgres's home turf |

## Why Tibu's data is relational

Look at the entities: a **seller** owns a **business**; a business has **products**, **images**, **videos**, **reviews**; a **customer** saves products, reviews businesses, contacts sellers, sends **enquiries**. Almost every screen is a join ("products near me, with their business name and first image"). The rules are relational too: "one review per customer per business", "a product must belong to a real business", "deleting a business removes its products". Postgres enforces these with foreign keys and unique constraints. In Mongo you would enforce them in application code.

The prototype's biggest problem (see `sources/CODEBASE_AUDIT.md` §3) is **inconsistent data shapes**: prices as strings, missing IDs, four different product shapes. A strict schema is the cure. Mongo's flexibility is exactly what created that mess.

## When MongoDB *would* be the right call

- The team already has a production Node + Mongo template (auth, uploads, deploy) they can reuse as-is.
- The data is mostly independent documents with few relations (logs, CMS content, IoT events).
- The schema changes daily and nothing needs to join.

None of these apply to Tibu Phase 1.

## Risks of choosing Supabase and mitigations

| Risk | Mitigation |
|---|---|
| Free projects pause after ~1 week of zero activity | Daily keep-alive ping via GitHub Actions (see `08_Setup_Deployment_Ops.md`); upgrade to Pro ($25/mo) in Phase 2 |
| No automatic backups on free tier | Weekly `pg_dump` via GitHub Actions to a private artifact / client's Google Drive |
| Business logic in SQL is unfamiliar | All SQL is written and tested already (`supabase/migrations`). New logic follows the same patterns |
| Built-in email is rate-limited | Custom SMTP (Resend free tier) before launch — mandatory |
| Vendor outage | Postgres is portable; frontend talks through one `lib/api` layer, so swapping the backend later is contained |

## Decision

Use Supabase for DB, Auth, Storage and scheduled jobs. Use Cloudflare Pages for the frontend + two tiny Pages Functions for link previews. Revisit only if Phase 2 introduces a workload Postgres handles poorly (unlikely for a marketplace).
