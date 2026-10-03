# 12 · Push notifications (SOW Rev2 §3, DECISIONS D33)

Rev2 asks for in-app notifications "paired with push notifications where the platform supports them", while customers "can use Tibu fully without granting notification permission". This is the smallest design that does that on free tiers, with no new notification logic: **every push is a copy of a row the database already writes into `notifications`.**

Built in Week 5: R5 (A, backend) and R6 (B, frontend). Prompts in `prompts/REV2_TASKS.md`.

## 1. How it works

```
DB trigger (already exists) ─► INSERT into public.notifications
                                     │
                     Supabase Database Webhook "notify-push" (INSERT)
                                     │  POST + x-webhook-secret
                                     ▼
                 Edge Function send-push (Deno, service role)
                   1. reads push_subscriptions for record.user_id
                   2. web-push sendNotification(title, body, link)  ← VAPID-signed, encrypted
                   3. deletes subscriptions that answer 404/410
                                     │
                     Browser push service (FCM / Mozilla / Apple)
                                     ▼
                public/sw.js  ─►  showNotification  ─►  tap  ─►  opens the in-app link
```

Opt-in lives in one place: **Notification settings → "Push notifications on this device"**. Flipping it on asks the browser for permission, subscribes, and saves the subscription through `save_push_subscription()`. Flipping it off, or logging out, unsubscribes and deletes the row, so a shared phone stops receiving the previous user's notifications.

## 2. Platform support (what to tell the client)

| Device | Works? | Notes |
|---|---|---|
| Android — Chrome, Edge, Samsung Internet | ✅ in a normal tab | Most of her customers and sellers |
| Desktop Chrome, Edge, Firefox, Safari | ✅ | |
| iPhone / iPad — Safari tab | ❌ | Apple allows Web Push only for web apps added to the Home Screen |
| iPhone / iPad — added to Home Screen (iOS 16.4+) | ✅ | The settings row explains "Share → Add to Home Screen" |
| Any browser with permission blocked | ❌ | Row says it's blocked; in-app bell still works |

## 3. Files (all in the update kit; tested where marked)

| File | Goes to | Status |
|---|---|---|
| `migrations/20261002000009_push_subscriptions.sql` | `supabase/migrations/` (task R1) | ✅ tested on Postgres 16 + PostGIS (`11` §2) |
| `reference/supabase/functions/send-push/index.ts` | `supabase/functions/send-push/index.ts` (R5) | ✅ `deno check` passes; encryption verified (§6); not yet run on hosted Supabase |
| `reference/supabase/tests/push-encryption-check.ts` | `supabase/tests/` (R5, optional) | ✅ runs with Deno 2 |
| `reference/public/sw.js` | `public/sw.js` (R6) | ✅ passes the repo's ESLint |
| `reference/public/manifest.webmanifest` | `public/` (R6) | ✅ valid JSON; needs the icons |
| `reference/src/lib/push.js` + `push.test.js` | `src/lib/` (R6) | ✅ 7/7 vitest, ESLint clean, guards OK |

The service worker has **no fetch handler and no caching**. That's deliberate: an offline cache is the most common way a PWA ends up showing yesterday's deploy, and Phase 1 doesn't need offline mode.

## 4. One-time setup per environment (R5 on dev, again in A5.2 for prod)

1. **VAPID keys** (once per environment, keep them in the password manager — losing the private key means everyone has to re-enable push):
   ```bash
   npx --yes web-push generate-vapid-keys
   ```
   (Runs without adding `web-push` to `package.json`.)
2. **Secrets** (CLI linked to the right project — check `npx supabase projects list` first):
   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY=<public> VAPID_PRIVATE_KEY=<private> \
     VAPID_SUBJECT=mailto:<support email> PUSH_WEBHOOK_SECRET=$(openssl rand -hex 32)
   ```
   Copy the webhook secret value before you lose it: `npx supabase secrets list` shows only hashes.
3. **Deploy:**
   ```bash
   npx supabase functions deploy send-push --no-verify-jwt
   ```
   `--no-verify-jwt` because the webhook sends no user token; the function checks `x-webhook-secret` instead and returns 401 without it.
4. **Webhook:** Dashboard → Database → Webhooks → Create. Name `notify-push` · table `public.notifications` · events **Insert** only · type HTTP Request · POST `https://<ref>.supabase.co/functions/v1/send-push` · header `x-webhook-secret: <secret>` · timeout 5000 ms.
5. **Frontend env:** Cloudflare Pages (Preview and Production separately) `VITE_VAPID_PUBLIC_KEY=<public>`; locally in `.env.local`. Redeploy.

## 5. Testing (R5 + R6 verify lists)

1. Without any subscription, insert a notification for your test user in the SQL editor:
   ```sql
   insert into public.notifications(user_id, type, title, body, link)
   values ((select id from auth.users where email = '<you>'), 'system', 'Push test', 'Hello from Tibu', '/notifications');
   ```
   Edge Functions → `send-push` → Logs: a 200 with `{"sent":0,"removed":0}`. A 401 means the header secret doesn't match.
2. On an **Android phone** (preview URL, logged in), Notification settings → turn push on → allow. Insert the row again → a system notification appears within seconds; tapping it opens `/notifications`.
3. Close the browser completely and insert again → it still arrives.
4. Real flow: as a customer, send a chat message to a seller whose phone has push on → the seller's phone shows "New message…"; tapping opens `/seller/enquiries/<id>`.
5. Log out on that phone → insert a row for that user → nothing arrives; `select count(*) from push_subscriptions` for that user is 0.
6. iPhone: in a Safari tab the row says "Add to Home Screen". After adding and opening from the icon, turn it on → test 2 works.
7. Block notifications in the browser's site settings → the row shows "blocked" and the switch is disabled; the in-app bell still updates.

## 6. What was verified before handing this over

On Deno 2.9 with `npm:web-push@3.6.7` (the same import the function uses): generated VAPID keys; created a browser-style subscription (P-256 key + 16-byte auth secret); sent to a local HTTPS endpoint → `201`, `Content-Encoding: aes128gcm`, `TTL: 86400`, `Authorization: vapid t=…`; **decrypted the body with the subscriber's private key and got the exact JSON back**; an endpoint answering `410` surfaced `statusCode 410`, which the function uses to delete dead subscriptions. `deno check` passes on `index.ts`.

Not verified: hosted Supabase's Edge runtime (it's Deno-based but not identical) and real FCM/Apple endpoints. That's the first thing R5 tests.

## 7. Limits and costs (free tiers)

- Supabase Edge Functions free tier: 500,000 invocations a month. One invocation per notification row. Fine for Phase 1.
- Push services (FCM, Apple, Mozilla) are free.
- No new paid service, no Firebase project, no app store.

## 8. Cut rule

If R5 + R6 aren't delivering a notification to a real Android phone by **Thu 29 Oct**, stop: remove the settings row (leave the table and function deployed but unused), send `11` §6.5 to the client, and log push in `docs/PHASE2_BACKLOG.md`. In-app notifications (B5.3) are the SOW's main requirement; push is the "where supported" add-on.
