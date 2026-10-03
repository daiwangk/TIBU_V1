# 11 · SOW Revision 2 — what changes in the build (2 Oct 2026)

The build kit (27 Sep) was written against `Tibu_SoW_Phase1_Final.pdf`. The signed scope is **Revision 2 (25 Sep 2026)**, now in the repo as `docs/Tibu_SoW_Phase1_Rev2.md`. Most of Rev2 was already covered by the kit and the database. This file lists the real differences, the two new migrations (tested), contract v1.2, the new decisions, and the updated client messages.

Nothing here changes the week order. It adds six tasks (R1–R6, prompts in `prompts/REV2_TASKS.md`) and a few lines to existing prompts.

---

## 1. Rev2 vs. the kit, item by item

| Rev2 §3 item | Kit / database today | Gap | Where it's handled |
|---|---|---|---|
| Business page: delivery/pick-up availability | `businesses.delivery_available`, `pickup_available`; in contract | — | B1.8 |
| Business page: **expected delivery time** | no column | **missing** | 0008 + R1 + R2 + R3/R4 |
| Business page: **"est. since"** (optional) | no column | **missing** | 0008 + R1 + R2 + R4 |
| Product page: multiple images | `product_images`; contract `images[]` | — | B1.7, A4.2 |
| Product page: quantity / size charts / weight (custom fields) | `products.details jsonb` | seed stores an **object**, contract expects an **array** | D36 + `details.js` helper in A1.5, R4 templates |
| Product page: delivery availability + expected delivery time | none per product | **missing** | 0008 (override columns) + R1 + R2 |
| Product page: review & rating | business rating via `rating_avg` | show it on the product page | R2 |
| Product page: seller/business location | business locality + distance | — | B1.7 / R2 |
| Delivery & fulfilment settings, **per-product override** | none | **missing** | 0008 + R3/R4 |
| Per-product custom fields set at listing time, category-appropriate | free label/value rows | add category templates | R4 (D36) |
| In-app **chatbox** (replaces enquiry box) | enquiry tables, RPCs, notifications | same system, new name | D34; B5.1 copy |
| Notifications & pop-ups **paired with push where supported** | D21 said in-app only | **push missing** | 0009 + R5 + R6 (D33) |
| Grouped updates ("8 new businesses near Andheri") | `job_new_business_digest` cron | — | A5.1 |
| Previously connected = contacted **or viewed** | connected + recently viewed | — | A3.4, B3.5 |
| Rating = simple average | trigger computes average | — | — |
| Instagram ID for admin verification | `instagram_handle`; admin panel | — | B4.2, B4.4 |
| §8 payments **40 / 30 / 30** | kit says 50 / 50 | **comms outdated** | D35, §6 below |
| §13 "advance payment" (still in Rev2) vs §8 (no advance) | flagged earlier | still unresolved | decisions email §6.1 |

---

## 2. The two new migrations (tested)

Both are in the update kit's `migrations/` folder. They are additive and safe to push to `tibu-dev` now (task R1). Push them to prod in A5.2 with everything else.

**`20261002000008_rev2_delivery_fields.sql`**
- `businesses.delivery_time text` (1–40 chars) and `businesses.established_year smallint` (1900–2100; the UI blocks future years).
- `products.delivery_available boolean`, `products.pickup_available boolean`, `products.delivery_time text` — **NULL means "same as my shop"**. The effective value is `product ?? business`, computed in the mapper.
- No policy changes. The existing policies already cover these columns: anyone reads them on approved rows; only the owner (or admin) writes them; the guard trigger doesn't touch them.

**`20261002000009_push_subscriptions.sql`**
- Table `push_subscriptions` (endpoint, keys, user agent) with RLS: users read and delete only their own rows; no direct inserts.
- `save_push_subscription(p_endpoint, p_p256dh, p_auth, p_user_agent)` and `delete_push_subscription(p_endpoint)`, `SECURITY DEFINER`, `search_path` pinned, `login_required` for guests, not executable by `anon`.
- Why an RPC: an endpoint belongs to a browser, not a person. When a second person logs in on the same phone, the save must take the endpoint over, and RLS correctly hides the first person's row from them.

**How they were tested** (PostgreSQL 16 + PostGIS 3.4 with the kit's Supabase stubs): a fresh database, migrations 0001 → 0009 in order, the kit's smoke test, then `migrations/tests/rev2_0008_test.sql` and `rev2_0009_test.sql`.

| Test | Result |
|---|---|
| 0001–0009 apply on an empty database; each new file re-applies cleanly | ✅ |
| Smoke test (role guard, anon reveal blocked, self-review blocked) still passes | ✅ |
| Owner writes delivery time, est. year and product overrides | ✅ |
| Another seller's update changes nothing (RLS) | ✅ |
| Guest reads the new values on the approved business; effective product values via `coalesce` | ✅ (`f`, `t`, `2–3 days`) |
| Year 1850, 41-char delivery time, blank delivery time rejected | ✅ |
| Seller still can't self-approve after 0008 | ✅ status stays `draft` |
| Search RPCs unaffected | ✅ |
| Guest can't call `save_push_subscription` | ✅ no execute |
| Customer saves a subscription and sees only their own | ✅ |
| Seller on the same phone takes the endpoint over; the customer's row is gone | ✅ |
| Direct insert into `push_subscriptions` refused | ✅ |
| Customer can't delete the seller's subscription (RPC or direct) | ✅ row survives |
| `http://` endpoint rejected | ✅ |
| 18 tables, 0 without RLS | ✅ |

What I could **not** test: hosted Supabase's ownership model for `SECURITY DEFINER` functions and the `revoke` statements. If `db push` errors on 0009, paste the error into Claude.ai with prompt D3.

---

## 3. New decisions — append to `docs/DECISIONS.md` (task R1)

```markdown
## SOW Revision 2 (added 2 Oct 2026)
- **D32 Rev2 governs.** The signed scope is `docs/Tibu_SoW_Phase1_Rev2.md` (25 Sep 2026). Where the original PDF differs, Rev2 wins.
- **D33 Push notifications (replaces "in-app only" in D21).** Web Push mirrors the in-app notification rows: same events, same text, same link. A Database Webhook on `notifications` INSERT calls the Edge Function `send-push`. Permission is requested only when the user turns on the switch in Notification settings, never on page load. Works on Android Chrome and desktop browsers; on iPhone only after "Add to Home Screen" (iOS 16.4+). The app is fully usable without permission. Cut rule: if push isn't working on a real Android phone by Thu 29 Oct, ship in-app notifications only and send the SOW §12 notice (`11_SOW_REV2_CHANGES.md` §6.5). [CLIENT] informed.
- **D34 "In-app chatbox" (Rev2 wording) = the enquiry system.** D20 still applies (non-real-time, 60 s polling). UI copy says "Chat" / "Messages"; code, database and routes keep "enquiries" (the database writes `/enquiries/<id>` into notifications — CONTRACT §14).
- **D35 Payments 40/30/30 (SOW Rev2 §8).** M1, 40% (₹4,800): D27 definition, end of Week 2. M2, 30% (₹3,600): backend, database and the core loop working on real data — accounts, WhatsApp/Call after login, saved / recently viewed / previously connected, seller signup + onboarding with photos + dashboard, admin approve/reject/unpublish, chat backend — end of Week 4. M3, 30% (₹3,600): chat, reviews and notifications screens, push, production on her domain, handover. [CLIENT] confirm the M2 definition in writing.
- **D36 Product custom fields = `products.details` as an ordered jsonb array** `[{ "label": "Weight", "value": "500g" }]`. Read both the array form and the seed's object form (`src/services/supabase/details.js`); always write the array form. Max 12 rows, label ≤ 40, value ≤ 200. Category templates prefill empty label rows: desserts & food → Weight / Quantity, Serves, Shelf life, Veg / Eggless; fashion, womens-fashion, mens-fashion → Sizes available, Size chart, Fabric, Fit; jewellery → Material, Size; crochet, embroidery, resin-art, handmade → Dimensions, Material, Made to order; candles → Burn time, Wax, Fragrance; gifts → What's included, Personalisation. Size charts are detail rows and/or one product photo. No per-category database schema.
- **D37 Delivery fields (migration 0008).** Business: `delivery_time` (preset chips "Same day", "Next day", "2–3 days", "Within a week", or custom ≤ 40 chars) and optional `established_year`. Product: override columns where NULL = same as the business. A product override with a blank delivery time shows the shop's time.
- **D38 Seller location privacy.** Many sellers work from home. Store `lat`/`lng` rounded to 3 decimals (about 100 m) — distance sorting is unaffected. The address line is optional and labelled "shown publicly". Public pages show locality and distance only; sellers share an exact pick-up address over WhatsApp.
```

---

## 4. Contract v1.1 → v1.2 — exact changes for `docs/CONTRACT.md` (task R1)

Change the header line to `# Service contract v1.2` and add this note under it:
> v1.2 (2 Oct 2026): SOW Rev2 — delivery time, est. year, per-product delivery override, push subscription functions, details storage rule. Migrations 0008, 0009.

**§3 Public catalog shapes** — in the `BusinessDetail` typedef, add after `products`:
```js
 *   deliveryTime: string|null,      // v1.2 e.g. "Same day"; null = not stated
 *   establishedYear: number|null,   // v1.2 "Est. 2019"; null = not stated
```
In the `ProductDetail` typedef, add:
```js
 *   deliveryAvailable: boolean,     // v1.2 effective: product override ?? business
 *   pickupAvailable: boolean,       // v1.2 effective
 *   deliveryTime: string|null,      // v1.2 effective
```
and change the `details` comment to:
```js
 *   details: Array<{ label: string, value: string }>,  // products.details jsonb; read array or legacy object form (D36)
```

**§5 Seller shapes** — add above `MyBusiness`:
```js
/** @typedef {{ deliveryAvailable: boolean, pickupAvailable: boolean, deliveryTime: string|null }} DeliveryOverride   // v1.2 */
```
In `BusinessInput` add `@property {string|null} deliveryTime` and `@property {number|null} establishedYear`.
Change `MyProduct` to:
```js
/** @typedef {ProductDetail & { isActive: boolean, sortOrder: number, deliveryOverride: DeliveryOverride|null }} MyProduct
 *  deliveryOverride is null when all three product columns are NULL (= same as the business). */
```
In `ProductInput` add `@property {DeliveryOverride|null} deliveryOverride   null = same as my shop`.

**§7 Functions** — add two rows at the end:

| Module | Function | Returns | Auth | In mock? |
|---|---|---|---|---|
| push | `savePushSubscription({ endpoint, p256dh, auth })` → `rpc('save_push_subscription', { p_endpoint, p_p256dh, p_auth, p_user_agent: navigator.userAgent })` | `void` | user | ❌ |
| | `deletePushSubscription(endpoint)` → `rpc('delete_push_subscription', { p_endpoint })` | `void` | user | ❌ |

**§12 Validation** — add rows:

| Field | Rule |
|---|---|
| Delivery time (business or product) | 1–40 chars after trim; empty → `null` |
| Established year | 1900 – current year; empty → `null` |
| Product details | ≤ 12 rows; label ≤ 40, value ≤ 200; rows with an empty label or value are dropped |
| Business lat/lng | rounded to 3 decimals before saving (D38) |

---

## 5. Lines to change in existing files (task R1, same PR)

- `AGENTS.md` §2 first line: replace `docs/Tibu_SoW_Phase1_Final.pdf` with `docs/Tibu_SoW_Phase1_Rev2.md (Revision 2 — the signed scope)`.
- `AGENTS.md` §1 Hosting line: "TypeScript is allowed in `functions/` (Cloudflare) and `supabase/functions/` (Edge Functions), nowhere else."
- `AGENTS.md` §6: add `VITE_VAPID_PUBLIC_KEY` to the list of browser variables (it's a public key by design).
- `AGENTS.md` §7 "Must keep": add "in-app chat (the enquiry system, D34)" and "push only through the Notification settings switch (D33)".
- `.env.example`: add `VITE_VAPID_PUBLIC_KEY=<public VAPID key — set in R5>`.
- `.agents/rules/00-project.md` rule 10 and `.cursor/rules/tibu.mdc`: no change needed (they point at AGENTS.md).

---

## 6. Client messages (replace the matching parts of `08_CLIENT_COMMS.md`)

### 6.1 Send now (today or Monday morning): decisions + Rev2 + domain

> Hi Laiba, quick update and a few confirmations we need in writing so the build matches Revision 2 exactly.
>
> **Progress:** the app now builds and runs cleanly, the database is live on our development server with test data, and the new Product and Business pages are being finished this weekend.
>
> **Please confirm (a short "yes" per point is enough):**
> 1. Guests browse and search freely; login is needed for WhatsApp/Call, saving, chat and reviews.
> 2. New accounts confirm their email before logging in (stops fake sign-ups).
> 3. Categories: Desserts, Home Food, Handmade (Crochet, Embroidery, Resin Art, Candles), Fashion (Women's, Men's), Jewellery, Gifts.
> 4. "Available Today" resets every night at midnight.
> 5. Editing an approved shop doesn't send it back for approval; you can unpublish any shop from the admin panel.
> 6. Offers, the Discover feed and the address book from the prototype are Phase 2.
> 7. **First payment (40%)** — "existing codebase stabilised" means every reviewed bug is fixed, or removed because that screen was rebuilt or is Phase 2. Demo planned for **<Fri 9 / Mon 12 Oct>**.
> 8. **Second payment (30%)** — when the core works end to end on real data: customer sign-up, WhatsApp/Call with the pre-filled message, saved and recently viewed, seller sign-up and onboarding with photos, your approval in the admin panel, and the chat system's backend. Planned for the end of the week of 19 Oct.
> 9. Push notifications will work on Android and computers. On iPhone, Apple only allows them once Tibu is added to the Home Screen; everyone can use Tibu fully without turning them on.
> 10. Seller locations are shown as area + distance, not the exact home address.
> 11. Section 13 mentions an advance payment, but Section 8 doesn't list one — can you confirm there's no advance and the 40/30/30 plan applies?
>
> **One thing we need this week:** the **domain name**. Sign-up confirmation emails can only be sent to real customers from a verified domain, and customer accounts are built in the week of 12 Oct. If you haven't bought it yet, a `.in` or `.com` costs a few hundred rupees a year; we'll guide you through it.

### 6.2 Milestone 1 (replaces `08` §4)

> Hi Laiba, Milestone 1 is ready. Could we do a 15-minute demo on **<day, time>**? We'll walk through the rebuilt app on a phone and the bug-resolution summary.
>
> After the demo: (1) summary of every reviewed bug and how it was resolved (attached); (2) invoice for the **first payment, 40% — ₹4,800** (SOW Rev2 §8); (3) next: customer accounts, WhatsApp/Call with the pre-filled message, saved items and recently viewed.

### 6.3 Milestone 2 (new — end of Week 4)

> Hi Laiba, the core of Tibu now works end to end on real data. Could we do a 20-minute demo on **<day, time>**? You'll sign up as a seller, list a product with photos, approve it yourself in the admin panel, and then contact that seller as a customer on WhatsApp.
>
> After the demo: invoice for the **second payment, 30% — ₹3,600** (SOW Rev2 §8). Next: the chat screens, reviews, notifications and going live on your domain.

### 6.4 Final payment (replaces the invoice line in `08` §7)

> …and the invoice for the **final payment, 30% — ₹3,600**. Repository and account ownership transfer as soon as it's received (SOW §11).

### 6.5 Push simplification notice (only if D33's cut rule triggers)

> Hi Laiba, a quick scope note under SOW §12: browser push notifications are taking significantly longer than planned, so for launch Tibu will show all updates inside the app (notification bell, badges and pop-ups) without phone push. Everything else stays on schedule. Push is noted for Phase 2.

### 6.6 Real sellers before Diwali (send in Week 4)

> Hi Laiba, Diwali is on Sunday 8 November, and we'd like Tibu to go live with real sellers before then. Could you line up 3–5 sellers who can onboard between **30 Oct and 4 Nov**? Each needs about 15 minutes: logo, a banner photo, 3–5 product photos with prices, their WhatsApp number and Instagram handle. We'll help them on a call if needed.
