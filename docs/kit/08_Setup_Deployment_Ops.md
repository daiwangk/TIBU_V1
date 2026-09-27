# 08 · Setup, Deployment & Operations Runbook

## 1. Accounts (client-owned wherever possible)

| Service | Plan | Owner | Used for |
|---|---|---|---|
| Domain registrar | paid by client | client | `tibu.in` (example) |
| Cloudflare | Free | client (team invited) | DNS, Pages hosting, Pages Functions |
| Supabase | Free (2 projects) | client org, team as members | DB, Auth, Storage, cron |
| Resend | Free | client | Auth emails (SMTP) |
| GitHub | Free | client org (or team → transfer at handover) | Code, Actions |
| Sentry | Free | client | Frontend error monitoring |

## 2. Environment variables

| Name | Where | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Cloudflare Pages (build), `.env.local` | no |
| `VITE_SUPABASE_ANON_KEY` | same | no (public by design; RLS protects data) |
| `VITE_SITE_URL` | same | no |
| `VITE_SENTRY_DSN` | same | no |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Pages Functions runtime vars (for OG functions) | no |
| `SUPABASE_SERVICE_ROLE_KEY` | local seed script / GitHub Actions secret only | **YES — never in frontend** |
| `SUPABASE_DB_URL` | GitHub Actions secret (backup job) | **YES** |
| `RESEND_API_KEY` | Supabase → Auth → SMTP settings | **YES** |

Use separate values for Preview (dev project) and Production (prod project) in Cloudflare Pages.

## 3. Supabase project configuration (both projects)

1. **Region:** Mumbai (ap-south-1).
2. **Migrations:** `npx supabase link --project-ref <ref> && npx supabase db push`.
3. **Extensions:** postgis + pg_trgm are created by migration 0001; enable **pg_cron** in the dashboard, then run `supabase/cron.sql` once.
4. **Auth → Providers:** Email enabled; "Confirm email" ON (prod), can be OFF in dev; minimum password length 8.
5. **Auth → URL configuration:** Site URL = `https://tibu.in` (prod) / preview URL (dev). Redirect URLs: `https://tibu.in/**`, `http://localhost:5173/**`, `https://*.<project>.pages.dev/**`.
6. **Auth → SMTP:** host `smtp.resend.com`, port 465, user `resend`, password = Resend API key, sender `Tibu <hello@tibu.in>` (verify the domain in Resend first — DNS records in Cloudflare).
7. **Auth → Email templates:** brand the confirm-signup and reset-password templates.
8. **Auth → Rate limits:** keep defaults; they protect against signup spam.
9. **API → Exposed schemas:** `public` only.
10. **First admin:** after the client signs up: `update profiles set role='admin' where id=(select id from auth.users where email='<client email>');`

## 4. Frontend deploy (Cloudflare Pages)

- Build command `npm run build`, output `dist`, Node 20+.
- `public/_redirects` is **not** needed for SPA fallback if there is no `404.html` (Pages serves `index.html`). Keep `functions/` at repo root for the OG functions.
- Production branch `main` → `tibu.in`; every other branch → preview URL on the dev project.
- Custom domain: Pages → Custom domains → add `tibu.in` and `www` (redirect www → apex).
- Headers (`public/_headers`):
  ```
  /*
    X-Frame-Options: DENY
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: geolocation=(self), camera=(), microphone=()
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```
  (Don't set a strict CSP until Instagram iframes and Supabase domains are listed; add it in Phase 2.)

## 5. Keep-alive & backups (free-tier survival)

`.github/workflows/ops.yml`:
```yaml
name: ops
on:
  schedule:
    - cron: '0 3 * * *'     # daily 08:30 IST keep-alive
    - cron: '0 20 * * 0'    # weekly Sunday backup (01:30 IST Mon)
  workflow_dispatch:
jobs:
  keepalive:
    if: github.event.schedule == '0 3 * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sf "$SUPABASE_URL/rest/v1/categories?select=id&limit=1" \
            -H "apikey: $ANON" -H "Authorization: Bearer $ANON" > /dev/null
        env:
          SUPABASE_URL: ${{ secrets.PROD_SUPABASE_URL }}
          ANON: ${{ secrets.PROD_SUPABASE_ANON_KEY }}
  backup:
    if: github.event.schedule == '0 20 * * 0' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - run: sudo apt-get update && sudo apt-get install -y postgresql-client
      - run: pg_dump "$DB_URL" --no-owner --no-privileges -Fc -f tibu-$(date +%F).dump
        env: { DB_URL: '${{ secrets.PROD_SUPABASE_DB_URL }}' }
      - uses: actions/upload-artifact@v4
        with: { name: tibu-backup, path: '*.dump', retention-days: 30 }
```
Notes: use the **session pooler** connection string for `pg_dump`. Storage files are not in `pg_dump`; images can be re-uploaded or synced with the Supabase CLI if needed. Artifacts in a private repo are private to collaborators.

## 6. Monitoring

- Sentry for frontend errors (release = git SHA).
- Supabase dashboard → Reports weekly: DB size (500 MB cap), storage (1 GB), auth users.
- `select * from cron.job_run_details order by start_time desc limit 20;` to confirm jobs run.
- Set a calendar reminder at 70% of any free quota → quote Phase 2 upgrade to the client.

## 7. Common operations

| Task | How |
|---|---|
| Add a category | SQL insert into `categories` (or build a tiny admin form in Phase 2) |
| Promote/demote admin | SQL update `profiles.role` |
| Remove abusive review | Admin: `delete from reviews where id=…` (RLS allows admin) |
| Take a business down fast | Admin panel → Unpublish (reason) |
| Seller locked out | They use "Forgot password"; admin can also send a reset from Auth → Users |
| New schema change | New migration file → dev push → test → regenerate types → PR → prod push at release |
| Rollback frontend | Cloudflare Pages → Deployments → "Rollback to this deployment" |

## 8. Launch checklist (prod)

- [ ] Migrations pushed to prod; cron.sql run; smoke test NOT run on prod (it creates fake users)
- [ ] SMTP working (send yourself a reset email)
- [ ] Auth Site URL + redirects set to the real domain
- [ ] Cloudflare prod env vars point to prod project; custom domain + HTTPS
- [ ] OG preview works for a real product (send the link on WhatsApp)
- [ ] First admin promoted; admin panel reachable
- [ ] Privacy policy + Terms pages live (DPDP Act: say what you collect — name, email, phone, location — why, and how to request deletion)
- [ ] Sentry receiving events; keep-alive + backup workflows green
- [ ] No demo/fake businesses in prod
- [ ] Credentials documented in the handover doc
