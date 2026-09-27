# 06 · Backend runbook (Supabase, Cloudflare, email)

Owner: Person A. Read with the dev kit's `docs/kit/08_Setup_Deployment_Ops.md`; where they differ, this file wins (JS repo, new paths).

## 1. Accounts (Day 1, client-owned — D28)
Ask the client (message in `08` §3) to create or invite you to: a GitHub organisation (or give you admin on the repo), a Supabase organisation, a Cloudflare account, a Resend account, and the domain (ideally with DNS on Cloudflare). Store every password in one shared password manager, not in chat.

If her Supabase org isn't ready by Day 2, create `tibu-dev` in your own org and transfer it later (project settings → transfer project).

## 2. Put the dev kit into the repo (A1.2)

```bash
git checkout -b chore/a1-2-supabase
# from the earlier dev-kit download:
cp -r ../tibu-phase1-dev-kit/supabase ./supabase          # migrations/, cron.sql, tests/
mkdir -p docs/kit && cp ../tibu-phase1-dev-kit/docs/0[1-9]*.md docs/kit/
cp -r ../tibu-phase1-dev-kit/snippets ./docs/kit/snippets   # reference only; A1.3 converts to JS
cp ../tibu-build-kit/supabase-fixes/20260927000007_fix_connected_order.sql supabase/migrations/   # real bug fix, see docs/build/09
npx supabase init            # creates supabase/config.toml if missing (keep the copied migrations)
ls supabase/migrations       # expect six 20260925… files + 20260927000007
```

## 3. Create `tibu-dev` and push

1. Supabase dashboard → New project `tibu-dev`, region **Mumbai (ap-south-1)**, strong DB password saved in the password manager.
2. Push the schema:
   ```bash
   npx supabase login
   npx supabase link --project-ref <dev-ref>
   npx supabase db push          # applies the six migrations in order
   npx supabase migration list   # local and remote columns must match
   ```
3. Enable **pg_cron** (Dashboard → Database → Extensions, or Integrations → Cron), then paste `supabase/cron.sql` into the SQL editor and run it.
4. Run the smoke test **with psql, not the SQL editor** (its first line is a psql command, and the SQL editor only shows the last result, not the OK notices). Get the connection string from the dashboard's **Connect** button → **Session pooler** (the direct `db.<ref>.supabase.co` host is IPv6-only on free projects), then:
   ```bash
   psql "postgresql://postgres.<ref>:<db-password>@<pooler-host>:5432/postgres" -f supabase/tests/rls_smoke_test.sql
   ```
   Expect `OK blocked: role_change_not_allowed`, `OK anon reveal blocked: login_required`, `OK self-review blocked`, status `draft` after the self-approve attempt, `customer sees pending? 0`, contacts counts `0`, rating `4.0`. (If you don't have psql: install the PostgreSQL client tools, or delete the first `\set` line and run it in the SQL editor section by section, reading each result.) Then delete the test users it created (Authentication → Users) — deleting them cascades to their test business.

**If `db push` fails:** copy the full error and the failing statement into Claude.ai with the "Supabase migration failed" prompt (`prompts/00`). Because the failing file never applied, you may edit the kit migrations **until the first fully successful push**. After that, every change is a new migration file.

## 4. Verification SQL (run in the SQL editor after the push)

```sql
-- 1. Tables: expect 17 (profiles, categories, businesses, business_contacts, business_images,
--    business_videos, products, product_images, reviews, saved_businesses, saved_products,
--    recent_views, contact_events, enquiries, enquiry_messages, notifications, admin_actions)
select count(*) as tables from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE';

-- 2. RLS must be ON for every public table (expect zero rows)
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 3. The RPCs the app calls (names used in CONTRACT mapping; check they exist)
select p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by 1;

-- 4. Categories match CONTRACT §2
select slug, name, (select slug from categories p where p.id = c.parent_id) as parent
from categories c order by sort_order;

-- 5. Storage buckets and cron jobs
select id, public from storage.buckets;
select jobname, schedule, active from cron.job;

-- 6. PostGIS works
select postgis_version();
```

Save the output of query 3 into `docs/kit/rpc-signatures.txt`; agents use it to get exact RPC names and parameters.

## 5. RLS probes from outside (the real attacker view)

Use the **anon** key (Settings → API). These must return `[]` or a permission error, never data:

```bash
URL=https://<dev-ref>.supabase.co; ANON=<anon key>
curl -s "$URL/rest/v1/business_contacts?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
curl -s "$URL/rest/v1/businesses?select=id,status&status=neq.approved" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
curl -s "$URL/rest/v1/admin_actions?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
curl -s "$URL/rest/v1/contact_events?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
# and this one must return data (public read):
curl -s "$URL/rest/v1/categories?select=slug&limit=3" -H "apikey: $ANON" -H "Authorization: Bearer $ANON"
```

Repeat after every new migration and before launch. Record results in `docs/PROGRESS.md`.

## 6. Seed data (A1.4) — dev only

- `cp .env.seed.example .env.seed` and fill in the dev URL, the dev service-role/secret key and `SEED_ALLOWED_REF=<dev-ref>`. `.env.seed` is git-ignored.
- Run: `node --env-file=.env.seed scripts/seed-dev.mjs` (Node 22 reads the env file itself; no dotenv needed).
- The script refuses to run if the URL doesn't contain `SEED_ALLOWED_REF`. Never create `.env.seed` for prod.

## 7. Auth configuration (A1.7 dev, A5.2 prod)

- Authentication → URL configuration: **Site URL** = preview URL (dev) or domain (prod). **Redirect URLs:** `http://localhost:5173/**`, `https://*.<pages-project>.pages.dev/**` (dev) / `https://<domain>/**` (prod).
- Email provider: email + password on; confirm email **on** (D12) unless the client decides otherwise.
- **Custom SMTP (Resend):** verify the sending domain in Resend (it gives SPF/DKIM DNS records to add), then Authentication → SMTP settings: host `smtp.resend.com`, port 465, user `resend`, password = Resend API key, sender `Tibu <hello@<domain>>`. Supabase's built-in mailer is rate-limited and meant only for testing, so SMTP must be live before customers sign up (Week 3 at the latest).
- Email templates: brand the confirm-signup and reset-password templates (Tibu name, plum button). Keep the `{{ .ConfirmationURL }}` variable.

## 8. Cloudflare Pages (A1.6)

1. Workers & Pages → Create → **Pages** → connect to Git → pick the repo.
2. Build command `npm run build`, output directory `dist`, root `/`.
3. Environment variables (Preview and Production separately): `NODE_VERSION=22`, `VITE_DATA_SOURCE` (`mock` until A2.1, then `supabase`), `VITE_SITE_URL` (the preview/prod URL), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. For the OG functions also add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` (non-`VITE_`, read by functions via `context.env`).
4. SPA routing: with no top-level `404.html`, Pages serves `index.html` for unknown paths. Check: hard-load `https://<preview>/p/anything` → the app boots (and shows its not-found state).
5. Every branch push gets a preview URL; `main` deploys production.

## 9. Admin users

After a real person signs up, promote them in the SQL editor (never from the app):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'laiba@example.com');
```

If a guard trigger blocks this, check `20260925000002_functions_triggers.sql` for the documented override (the SQL editor runs as the `postgres` role).

## 10. Production (A5.2)

1. New project `tibu-prod` (Mumbai). `npx supabase link --project-ref <prod-ref>` → `npx supabase db push`. **No seed script, no smoke test on prod.**
2. pg_cron + `cron.sql`. Storage buckets come from the migration.
3. Auth URLs + SMTP + templates as in §7 with the prod domain.
4. Pages production env vars pointing at prod; custom domain in Pages → Custom domains (DNS on Cloudflare makes this one click).
5. RLS probes (§5) against prod with the prod anon key.
6. Promote the client's account to admin (§9).
7. OG check on the real domain with a real product (after the first seller is approved).
8. Re-link your CLI to dev afterwards (`npx supabase link --project-ref <dev-ref>`) so a later `db push` doesn't hit prod by accident. Write the currently linked ref in PROGRESS.

## 11. Ops (A5.3)

- **Keep-alive:** free projects pause after about a week without activity. Enable `.github/workflows/keepalive.yml` with repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` (prod).
- **Backups:** free plans have limited backup access. Weekly, run `npx supabase db dump --linked -f backups/prod-$(date +%F).sql` (linked to prod) and store the file in the client's Google Drive, not in git (it contains personal data).
- **Monitoring (optional):** Sentry free tier for frontend errors; an uptime monitor on the domain.
- **First Phase-2 upgrade:** Supabase Pro (no pausing, daily backups) as soon as there are real users.
