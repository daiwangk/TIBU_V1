# Rev2 tasks (R1–R6) and add-ons to existing prompts

SOW Revision 2 adds a few things the original prompts don't cover (`docs/build/11_SOW_REV2_CHANGES.md`). They're handled by six new tasks and by **add-on blocks** you paste directly after an existing task prompt (after the Session Opener S1 and the original prompt, in the same message).

The update kit folder (`tibu-update-2026-10-02/`) sits next to the repo, like the build kit. Paths below assume that.

| ID | Task | Who | Est | Needs | Week |
|---|---|---|---|---|---|
| R1 | Rev2 schema (0008, 0009) on dev + contract v1.2 + decisions + AGENTS.md | A | 1.5 h | F5 checks | 1 (weekend) or Mon W2 |
| R2 | Rev2 fields on the Product and Business pages | B | 1.5 h | R1, B1.7, B1.8 | 2 |
| R3 | Add-on to A4.1: seller services write the Rev2 fields, location rounding | A | +0.5 h | R1 | 4 |
| R4 | Add-on to B4.2/B4.3: onboarding + product form Rev2 fields, detail templates | B | +1 h | R1, R3 | 4 |
| R5 | Push backend: Edge Function, secrets, webhook, push services | A | 2.5 h | R1, A5.1 | 5 |
| R6 | Push frontend: manifest, service worker, settings switch, logout cleanup | B | 2.5 h | R5, B5.3 | 5 |

---

## R1 · Rev2 schema + contract v1.2
**Owner** A · **Branch** `chore/r1-rev2-schema` · **Tool** you (terminal + dashboard), then Cursor Agent · **Est** 1.5 h · **Needs** the F5 checks in `10_REPO_REVIEW` (0007 applied remotely)

**Part 1 — database (you, 20 min):**
```bash
git checkout main && git pull && git checkout -b chore/r1-rev2-schema
cp ../tibu-update-2026-10-02/migrations/20261002000008_rev2_delivery_fields.sql supabase/migrations/
cp ../tibu-update-2026-10-02/migrations/20261002000009_push_subscriptions.sql supabase/migrations/
npx supabase projects list          # the ● LINKED row must be tibu-dev, never tibu-prod
npx supabase migration list         # remote shows 0001–0007
npx supabase db push                # applies 0008 and 0009 only
```
In the SQL editor:
```sql
select column_name, table_name from information_schema.columns
where table_schema = 'public'
  and ((table_name = 'businesses' and column_name in ('delivery_time','established_year'))
    or (table_name = 'products' and column_name in ('delivery_available','pickup_available','delivery_time')));  -- 5 rows
select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE';      -- 18
select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;                                         -- 0 rows
```
Re-run the function-list query (runbook `06` §4) and overwrite `docs/kit/rpc-signatures.txt` — it should now include `save_push_subscription` and `delete_push_subscription`. Then copy the new SOW: `cp ../tibu-update-2026-10-02/repo/docs/Tibu_SoW_Phase1_Rev2.md docs/` (skip if the docs branch already brought it in).

**Part 2 — paste into Cursor (Agent) after S1:**
```
TASK R1 — Contract v1.2 for SOW Revision 2 (no UI).
Read: AGENTS.md, docs/build/11_SOW_REV2_CHANGES.md §3, §4 and §5 (the exact text to apply), docs/CONTRACT.md, src/services/contract.js, src/services/index.js, src/services/mock/*, src/services/supabase/index.js, supabase/migrations/20261002000008_rev2_delivery_fields.sql and 20261002000009_push_subscriptions.sql.
1. docs/CONTRACT.md: apply 11_SOW_REV2_CHANGES.md §4 exactly; header becomes v1.2 with the note.
2. docs/DECISIONS.md: append the "SOW Revision 2" block from §3 verbatim.
3. AGENTS.md and .env.example: the line changes listed in §5, nothing else.
4. src/services/contract.js: update the JSDoc typedefs; add 'savePushSubscription' and 'deletePushSubscription' to FUNCTION_NAMES.
5. src/services/index.js: export the two new names.
6. Mock adapter: BusinessDetail gains deliveryTime and establishedYear; ProductDetail gains deliveryAvailable, pickupAvailable, deliveryTime as effective values (product override ?? business). Give 3–4 fixtures realistic values ("Same day", "1–2 days", 2019, 2021) and give one product an override that differs from its business; leave the rest null so empty states get exercised. MyProduct isn't in mock (seller functions throw). savePushSubscription/deletePushSubscription throw AppError('unavailable_in_mock').
7. Supabase adapter (if A1.5 came from patch 0003, the column lists are the BUSINESS_PUBLIC and PRODUCT_DETAIL_SELECT constants in src/services/supabase/catalog.js — add the new columns there, and map them in mappers.js mapBusinessDetail / mapProductDetail; extend catalog.integration.test.js with one assertion per new field): if A1.5 has NOT merged yet, add the two new names as notImplemented stubs only. If A1.5 HAS merged: in mappers.js map delivery_time → deliveryTime, established_year → establishedYear, and the product effective values with `??` (NOT `||` — false is a real value); implement savePushSubscription / deletePushSubscription with the RPCs in CONTRACT §7.
8. Tests: a mock test that ProductDetail uses the product override when set and the business value when it's null; the contract test must still pass.
Plan first.
```
**Verify:** `npm run check` green · `docs/CONTRACT.md` line 1 says v1.2 · `git grep -n "Final.pdf" AGENTS.md` → nothing · in the mock, open the product that has an override and confirm in the console (`getProductById`) that its delivery values differ from its business.
**Commit:** `chore(r1): SOW Rev2 migrations 0008-0009, contract v1.2, decisions D32-D38`

---

## A1.5 add-on (paste after the A1.5 prompt)

> **Easier:** apply `patches/0003-a1-5-supabase-catalog.patch` instead (`patches/README.md`). It already includes this add-on and was tested against a live API. Use the add-on below only if you build A1.5 with an agent.
```
ADD-ON (docs/build/10_REPO_REVIEW_2026-10-02.md F3, DECISIONS D36):
- products.details exists in two forms: the seed's object form ({"weight":"500g","shelf_life":"10 days"}) and the app's array form ([{label,value}]). I have copied src/services/supabase/details.js and details.test.js into the repo (tested). Use detailsFromDb() in the product mapper. Never return the raw jsonb.
- If docs/CONTRACT.md says v1.2 (R1 merged): also map businesses.delivery_time → deliveryTime, businesses.established_year → establishedYear, and for ProductDetail deliveryAvailable / pickupAvailable / deliveryTime = product column ?? business column (use ??, not ||).
- Include the new columns in the getProductById / getBusinessBySlug selects. They are public columns; never select business_contacts.
```
Before pasting: `cp ../tibu-update-2026-10-02/reference/src/services/supabase/details.* src/services/supabase/`

---

## R2 · Rev2 fields on the Product and Business pages
**Owner** B · **Branch** `feat/r2-rev2-page-fields` · **Tool** Cursor Agent · **Est** 1.5 h · **Needs** R1, B1.7, B1.8
```
TASK R2 — Show the SOW Rev2 fields on the public pages. UI only: the data is already in contract v1.2.
Read: AGENTS.md, docs/CONTRACT.md §3 (v1.2), docs/Tibu_SoW_Phase1_Rev2.md §3 (Business Page and Product Page bullets), src/pages/product/*, src/pages/business/*, src/components/*, .agents/rules/design-system.md.
1. src/components/FulfilmentInfo.jsx — props { deliveryAvailable, pickupAvailable, deliveryTime }. Render a compact row of Chips: Truck icon "Delivery" and/or Store icon "Pick-up" (only the available ones), plus Clock icon "Delivers in <deliveryTime>" when delivery is available and deliveryTime is set. Neither available → muted text "Ask the seller about delivery". lucide icons, Tailwind tokens, no inline styles.
2. ProductPage: FulfilmentInfo with the product's (effective) values under the price. A "Details" section rendering details as label/value rows (a <dl> in two columns); hide the section when details is empty. A rating line (Rating component + "(12 reviews)") that links to /b/<businessSlug>?tab=reviews. The seller block shows business name, locality and distance (formatDistance) linking to /b/<slug>.
3. BusinessPage header: "Est. <year>" Badge next to the category when establishedYear is set; FulfilmentInfo with the business values.
4. Add FulfilmentInfo to the /dev/ui gallery in three states (delivery + time, pick-up only, neither).
No new fields: if the page needs something not in CONTRACT v1.2, stop and say so.
Plan first.
```
**Verify:** a product whose override differs from its business shows the product's values; a product with no override shows the business's · "Est. 2019" on that business, nothing on businesses without a year · empty details → no "Details" heading · 360/390/430 px, no horizontal scroll.
**Commit:** `feat(r2): delivery info, est. year, details and rating on public pages`

---

## R3 · Add-on to A4.1 (paste after the A4.1 prompt)
```
ADD-ON (SOW Rev2, CONTRACT v1.2, DECISIONS D36–D38):
- saveMyBusiness writes delivery_time (trimmed; empty → null) and established_year (empty → null; outside 1900..current year → AppError('validation', 'Enter a year between 1900 and <current year>')).
- Before writing businesses.lat/lng, round both to 3 decimals (D38). Add a unit test for the rounding helper.
- saveProduct maps deliveryOverride: null → write NULL to products.delivery_available, pickup_available and delivery_time (= same as my shop); an object → write its three values (deliveryTime empty → NULL).
- getMyBusiness / listMyProducts return MyProduct.deliveryOverride = null when all three product columns are NULL, else { deliveryAvailable: p ?? business, pickupAvailable: p ?? business, deliveryTime: p.delivery_time }.
- saveProduct writes details with detailsToDb() from src/services/supabase/details.js; reads use detailsFromDb().
```

---

## R4 · Add-on to B4.2 and B4.3 (paste after the B4.2 prompt; B4.3 reuses ProductForm)
```
ADD-ON (SOW Rev2, CONTRACT v1.2, DECISIONS D36–D38):
Step 1 Basics: optional "Business started in" number input (placeholder "e.g. 2019", 1900..current year) → establishedYear.
Step 2 Location: when the Delivery switch is on, show "Usual delivery time": preset Chips "Same day" · "Next day" · "2–3 days" · "Within a week" plus "Other" which reveals a text input (max 40) → deliveryTime. Under the location picker, one muted line: "Customers see your area and an approximate distance, not your exact location. The address line is optional and shown publicly — leave it blank if you work from home."
ProductForm (shared with B4.3):
- "Delivery for this product": radio "Same as my shop" (default → deliveryOverride null) | "Different for this product" → reveals Delivery / Pick-up switches and the same delivery-time chips. Helper text: "Leave the time blank to use your shop's usual time."
- Details: create src/lib/productDetailTemplates.js exporting templateFor(categorySlug) → string[] of labels, using exactly the lists in docs/build/11_SOW_REV2_CHANGES.md §3 D36 (a child slug falls back to its parent's list; unknown → []). When the product's category (or the business category) is known and the details list is empty, prefill rows with those labels and empty values. The seller can rename, delete and add rows (max 12, label ≤ 40, value ≤ 200). For fashion categories show the hint: "Add a size chart as rows (e.g. M — Chest 38 in) or upload it as one of the product photos." Rows left without a value are dropped on save.
- Up to 5 images per product.
Unit-test templateFor (parent, child, unknown).
```

---

## R5 · Push backend
**Owner** A · **Branch** `feat/r5-push-backend` · **Tool** you (terminal + dashboard), then Cursor Agent · **Est** 2.5 h · **Needs** R1, A5.1 · **Guide** `docs/build/12_PUSH_NOTIFICATIONS.md`

**Part 1 — you (1 h):** follow `12` §4 on **dev**: VAPID keys → secrets → copy `../tibu-update-2026-10-02/reference/supabase/functions/send-push/index.ts` to `supabase/functions/send-push/index.ts` → deploy with `--no-verify-jwt` → create the `notify-push` webhook → `12` §5 test 1 (expect `{"sent":0}`). Optionally copy `reference/supabase/tests/push-encryption-check.ts` to `supabase/tests/` (runs with Deno; not part of `npm run check`).

**Part 2 — Cursor Agent after S1:**
```
TASK R5 — Push subscription services (CONTRACT v1.2 §7 push).
Read: AGENTS.md, docs/CONTRACT.md §7, docs/build/12_PUSH_NOTIFICATIONS.md §1 and §4, supabase/migrations/20261002000009_push_subscriptions.sql, src/services/supabase/* (follow the existing module pattern), src/services/supabase/errors.js.
1. src/services/supabase/push.js: savePushSubscription({ endpoint, p256dh, auth }) → rpc('save_push_subscription', { p_endpoint, p_p256dh, p_auth, p_user_agent: navigator.userAgent.slice(0, 300) }); deletePushSubscription(endpoint) → rpc('delete_push_subscription', { p_endpoint }). Errors through the existing mapper (login_required → auth_required).
2. Export both from src/services/supabase/index.js, replacing the R1 stubs.
3. Don't touch supabase/functions/ (deployed by hand) and don't add web-push to package.json.
Plan first.
```
**Verify:** from the browser console on the dev app, logged in, call the service with a fake `https://` endpoint → a row appears in `push_subscriptions` for your user; call delete → gone · as a guest → `auth_required` · `npm run check` green.
**Commit:** `feat(r5): push subscription services; send-push edge function`

---

## R6 · Push frontend
**Owner** B · **Branch** `feat/r6-push-frontend` · **Tool** Cursor Agent · **Est** 2.5 h · **Needs** R5, B5.3 · **Guide** `docs/build/12_PUSH_NOTIFICATIONS.md`

**Before the session (you):**
```bash
cp ../tibu-update-2026-10-02/reference/public/sw.js ../tibu-update-2026-10-02/reference/public/manifest.webmanifest public/
cp ../tibu-update-2026-10-02/reference/src/lib/push.js ../tibu-update-2026-10-02/reference/src/lib/push.test.js src/lib/
mkdir -p public/icons    # add icon-192.png, icon-512.png, icon-512-maskable.png, badge-72.png from the final logo
```
Then Cursor Agent after S1:
```
TASK R6 — Web Push opt-in (SOW Rev2 §3, DECISIONS D33). public/sw.js, public/manifest.webmanifest and src/lib/push.js (+ test) are already in place and tested — use them, don't rewrite them.
Read: AGENTS.md, docs/build/12_PUSH_NOTIFICATIONS.md §1, §2 and §5, src/lib/push.js, src/pages/notifications/NotificationSettingsPage.jsx, src/queries/notifications.js, wherever signOut is called (git grep -n "signOut" src).
1. index.html: <link rel="manifest" href="/manifest.webmanifest"> and <link rel="apple-touch-icon" href="/icons/icon-192.png">.
2. src/queries/push.js: usePushState() (useQuery on getBrowserPushState, refetchOnWindowFocus), useEnablePush() (subscribeBrowser(import.meta.env.VITE_VAPID_PUBLIC_KEY) then savePushSubscription; invalidate usePushState), useDisablePush() (unsubscribeBrowser(); if it returns an endpoint, deletePushSubscription(endpoint)).
3. NotificationSettingsPage: under the digest switch, a row "Push notifications on this device" with a Switch:
   'on'/'off' → the switch (turning on calls useEnablePush from the tap handler — the browser only allows the permission prompt from a user gesture);
   'denied' → disabled switch + "Notifications are blocked for Tibu in your browser settings.";
   'needs-install' → disabled switch + "On iPhone: tap Share → Add to Home Screen, open Tibu from the icon, then turn this on.";
   'unsupported' → muted text "This browser doesn't support push notifications. You'll still see everything under the bell."
   Errors map to toasts: push_permission_denied → "Permission wasn't granted", push_not_configured → "Push isn't set up yet".
4. Log out: before signOut, call the disable mutation and ignore its errors, so a shared phone stops getting the previous user's notifications.
5. One-time hint card (dismiss saved with src/lib/storage.js key 'tibu.pushHintDismissed'): on the seller's "Under review" status screen and on a chat thread after the customer's first message — "Get notified when they reply" → link to /notifications/settings. Never call Notification.requestPermission anywhere except the settings switch.
Plan first.
```
**Verify:** `12` §5 tests 2–7 on a real Android phone and an iPhone · `git grep -n "requestPermission" src` → only `src/lib/push.js` · Lighthouse (Chrome DevTools) → the manifest is detected with icons · `npm run check` green.
**Commit:** `feat(r6): web push opt-in, service worker, manifest`

---

## Add-ons for other existing prompts

**A4.2 add-on** (correction — `10_REPO_REVIEW` F19):
```
ADD-ON / CORRECTION: ignore the "typically <bucket>/<uid>/<uuid>.webp" hint in the prompt above. The business-media storage policy (supabase/migrations/20260925000005_storage.sql) checks owns_business(first folder), so the FIRST folder must be the business id. Use exactly the paths in docs/CONTRACT.md §13:
  business-media/{businessId}/logo-<timestamp>.webp
  business-media/{businessId}/banner-<timestamp>.webp
  business-media/{businessId}/gallery/<uuid>.webp
  business-media/{businessId}/products/{productId}/<uuid>.webp
  avatars/{userId}/<uuid>.webp
Get businessId from getMyBusiness(); if there's no business yet, throw AppError('validation', 'Save your business details first').
If compression fails (e.g. a HEIC file the browser can't decode), throw AppError('validation', 'Please choose a JPG or PNG photo') instead of hanging.
```

**B5.1 add-on** (Rev2 "in-app chatbox", D34):
```
ADD-ON: Rev2 calls this the in-app chatbox. UI copy: the button is "Chat with seller" (MessageCircle icon) beside WhatsApp and Call; the inbox page title is "Messages"; the seller dashboard card says "Messages". Keep the routes /enquiries/... and /seller/enquiries/... exactly (the database writes them into notifications, CONTRACT §14) and keep the code names (enquiries).
```

**B5.3 change** (D33): in the B5.3 prompt, replace the sentence `No browser push permission anywhere.` with:
```
No browser permission prompt here. The push switch is added by task R6 below the digest switch; leave space for it.
```

**B3.4 add-on** (F18):
```
ADD-ON: the "Notification settings" row links to /notifications/settings. Until B5.3 creates that page, add a temporary route /notifications/settings → the legacy NotificationPreferences page, and keep /notifications/preferences working.
```
