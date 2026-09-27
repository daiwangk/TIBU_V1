# 06 · Feature Specifications (Phase 1)

Each feature maps to a line in the SOW (§3). Format: **story → behavior → acceptance criteria (AC) → data.** "Done" = every AC passes on a real phone against the dev project.

---

## Customer-facing

### F1 · Guest browsing
- **Story:** As a visitor I can explore Tibu without an account.
- **Behavior:** Home, Search, Category, Business and Product pages work logged-out. Login is asked only for: Call, WhatsApp, Enquiry, Save, Write review, Profile areas.
- **AC:** (1) Fresh incognito session can open every public route. (2) No API call from a guest returns contacts. (3) Tapping a gated action opens the login sheet, not a page redirect.
- **Data:** public RPCs + RLS `anon` policies.

### F2 · Customer registration & login
- **Behavior:** Email + password. Signup fields: full name, email, password (≥8). Email confirmation ON in prod. Forgot/reset password. Session persists across reloads. Logout clears session and query cache.
- **AC:** (1) Signup → confirmation email arrives (Resend) → link logs user in at `/auth/callback`. (2) Wrong password shows an inline error. (3) Reset flow works end to end. (4) After login from the gate, the original action resumes automatically.
- **Open item (SOW §6):** confirm with client: *guests browse everything; contact details revealed only after login*. Get written confirmation.

### F3 · Home page
- **Sections (top → bottom):** brand header + location chip ("Near Andheri West ▾") · hero · search bar (taps → `/search`) · category shortcuts · Available Today · New Businesses · New Products · (Near you, if location known).
- **AC:** (1) Each section has skeleton, empty ("No businesses yet near you — be the first to explore!") and error states. (2) Location chip opens the location sheet (use my location / pick area). (3) Sections hide themselves if empty after load (except with a friendly empty state for New Businesses).

### F4 · Available Today
- **Behavior:** Shows products and businesses whose seller toggled "Available today". Sorted by distance when location is known.
- **Recommendation to confirm:** toggles reset at midnight IST (cron) so the section never shows yesterday's items. Seller sees "Resets at midnight" hint.
- **AC:** toggle in seller dashboard → item appears on Home within one refresh; after reset job, item disappears.

### F5 · Search page
- **Behavior:** Query input (debounced 300 ms), tabs **Products | Businesses**, filters sheet: category (with subcategories), distance (1/3/5/10/25 km/Anywhere), price range (products), Available today, sort (Nearest/Newest/Top rated/Price). All state in URL params.
- **AC:** (1) Searching "cookie" finds products by name/description and businesses by name. (2) Filters combine correctly. (3) Back button restores the previous query and filters. (4) Infinite scroll loads 20 at a time. (5) Result count and "Clear filters".

### F6 · Location-based discovery
- **Behavior:** On first visit, a non-blocking prompt "See businesses near you" → browser geolocation. If denied or unsupported → pick area from list. Location is stored locally. Distances shown on cards come from the DB (`distance_m`).
- **AC:** (1) With location, results sorted by real distance and show "850 m"/"2.3 km". (2) Without location, app still works (sorted newest, no distance labels). (3) No fake distance strings anywhere.

### F7 · Category browsing & filters
- One `CategoryPage` for every slug. Header with category name/icon, subcategory chips (for parents), same filters as Search.
- **AC:** `/category/handmade` includes crochet, embroidery, resin art, candles products.

### F8 · Business page `/b/:slug`
- **Content:** banner, logo, name, category, locality + distance, rating (★ avg · count), description, delivery/pickup badges, Save, Share (native share sheet → business URL), sticky bar **Call · WhatsApp · Enquire**. Tabs: **Products** (grid), **Videos** (IG embeds), **Reviews** (list + "Write a review").
- **AC:** (1) Unpublished/pending business → 404 for public, visible to owner with a status banner. (2) Share link opens the same business and shows a rich preview in WhatsApp (OG function). (3) Tracks a view for logged-in users.

### F9 · Product page `/p/:id`
- **Content:** image gallery (swipe), name, price, description, product details (key/value from `details`), business card (tap → business), Save, Share, sticky **Call · WhatsApp · Enquire**.
- **AC:** same visibility and tracking rules as F8; WhatsApp message contains product name, price and URL.

### F10 · Basic customer profile
- Name, email (read-only), phone (optional), home area (for digest), avatar, notification preference (digest on/off), logout, links to Saved / Recently viewed / Connected / Enquiries, "Sell on Tibu" CTA.
- **AC:** edits persist after reload; phone validates 10-digit Indian mobile.

### F11 · Previously connected businesses
- List of businesses the customer tapped Call/WhatsApp on, newest first, with last channel and date. Tap → business page.
- **AC:** tapping WhatsApp on any product adds that business at the top.

### F12 · Saved businesses & products
- Heart on cards and detail pages. Saved page with two tabs. Optimistic toggle.
- **AC:** save on one device → visible on another after login; unapproved (unpublished) items disappear from the list automatically (RLS).

### F13 · Recently viewed
- Last 20 products/businesses. Guests: localStorage. On login, the guest list is pushed via `track_view` and then served from DB.
- **AC:** view 3 products as guest → log in → all 3 appear in Recently viewed.

### F14 · Reviews & ratings
- Logged-in customers: 1–5 stars + optional text (≤1000). One review per business (editing replaces it). Sellers cannot review themselves. Reviews tab shows newest first with first name + date.
- **AC:** (1) Posting updates the average and count immediately. (2) Second attempt shows "Edit your review". (3) Seller gets a `review_new` notification.

## WhatsApp & call

### F15 · Contact via WhatsApp / Call
- **Behavior:** see `lib/whatsapp.ts`. WhatsApp opens `wa.me/91XXXXXXXXXX?text=…`. Product message: *"Hi! I discovered your business through Tibu and I'm interested in your {Product} ({₹price}). I'd like to know more."* + product URL. Business message variant for the business page. Call opens `tel:+91…`.
- **AC:** (1) Message is pre-filled exactly, product name/price automatic. (2) Works on Android Chrome and iOS Safari (use `location.href`, not `window.open` after await). (3) Every tap logs a `contact_events` row. (4) The product link shows an image preview in WhatsApp (F16).

### F16 · Product link preview
- Cloudflare Pages Functions `functions/p/[id].ts` and `functions/b/[slug].ts` inject OG tags.
- **AC:** paste a product URL into WhatsApp → preview shows photo, name, price. Test with the Meta Sharing Debugger (or by sending to yourself).

## Seller-facing

### F17 · Seller registration & login
- `/sell` landing → "Create seller account" (signup with `signup_as: 'seller'`). Existing customers: "Start selling" → `become_seller()`.
- **AC:** seller login lands on `/seller`; customer accounts can't open `/seller/*` until they become sellers.

### F18 · Seller onboarding (wizard, autosaved)
Steps (each saves to DB as it goes, so a seller can leave and resume):
1. **Business basics** — name, category, description, delivery/pickup.
2. **Contact & verification** — phone, WhatsApp (checkbox "same as phone"), Instagram handle.
3. **Location** — map pin (LocationPicker), address text, locality.
4. **Branding** — logo (square), banner (16:9), up to 6 gallery images.
5. **Products** — add at least 1 product (name, price, description, details, up to 5 photos).
6. **Videos (optional)** — paste Instagram reel links (validated with `parseInstagramShortcode`).
7. **Review & submit** — checklist from `submit_business_for_review` errors; submit → status `pending`.
- **AC:** (1) Missing fields listed clearly if submit fails. (2) After submit, dashboard shows "Under review". (3) After rejection, the reason is shown and resubmit works.

### F19 · Business profile management
- Edit all onboarding fields later. Toggle Available Today. Status banner (draft/pending/approved/rejected/unpublished).

### F20 · Product listing management
- List with thumbnail, price, active toggle, Available Today toggle. Add/edit/delete with photos (reorder = sort_order). Delete confirms.
- **AC:** deactivated product disappears publicly but stays in the seller's list.

### F21 · Videos (Instagram reels)
- Add/remove/reorder reel links; preview embed in the form.
- **AC:** invalid URLs rejected with a helpful message; private/deleted reels show a fallback link.

### F22 · Seller basic figures
- Cards: contacts (7 d / 30 d), WhatsApp vs calls (30 d), saves, open enquiries, rating. From `my_business_stats()`. (Advanced analytics = Phase 2.)

## Enquiry & notification system

### F23 · In-app enquiry box
- Customer: "Enquire" on Business/Product → sheet → `send_enquiry`. One thread per business; product context shown at top.
- Seller: `/seller/enquiries` list (unread badge) → thread → reply.
- Customer: `/enquiries` list → thread.
- Non-real-time: list refetches on focus + every 60 s; thread refetches every 30 s while open.
- **AC:** (1) New message → the other side's badge increments within 60 s. (2) Opening the thread clears the badge. (3) Rate limit message after 20 messages/hour.

### F24 · Notifications inbox
- Bell icon with unread count. Types per `03_Data_Model_ERD.md`. Tap → `link` route + mark read. "Mark all read".
- Grouped digest: daily, one notification per customer with a home area ("3 new businesses joined Tibu near Andheri West"). Customers can switch it off. No browser permission needed (in-app only).

## Admin

### F25 · Admin panel
- `/admin`: tabs Pending / Approved / Rejected / Unpublished / All. Row: name, category, owner, phone, WhatsApp, Instagram (link opens profile), locality, submitted date, product count.
- Detail `/admin/b/:id`: full business preview (as public would see it) + actions Approve / Reject (reason) / Unpublish (reason) / Republish. History from `admin_actions`.
- **AC:** (1) Non-admin gets 403 page and `forbidden` from RPC. (2) Approve → business visible publicly within one refresh + seller notified. (3) Reject/unpublish without a reason is blocked.
- Making someone admin: SQL only — `update profiles set role='admin' where id = (select id from auth.users where email = 'x@y.com');`

## Platform

### F26 · Image upload & hosting
- Browser compression to WebP (logo ≤512 px, others ≤1600 px), Storage bucket `business-media`, path rules enforced by policy, 3 MB hard cap server-side.
### F27 · Deployment — see `08_Setup_Deployment_Ops.md`.

## Explicitly NOT in Phase 1 (SOW §4) — remove from the UI

Cart/checkout/ordering · payments/UPI/QR · Discover reels feed + saved reels · real-time chat · advanced analytics · desktop redesign · **Offers** and **address book** screens from the prototype (not in SOW). Add a Phase 2 backlog issue for each so they are not lost.
