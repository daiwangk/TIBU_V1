# Week 4 — Seller, admin, enquiry backend (19 – 23 Oct)

**Exit check:** a brand-new account signs up from `/sell` → completes all 7 onboarding steps on a phone with real photos → submits → the admin approves it in `/admin` → a guest sees the business on Home and Search and can open its products. A second seller can't see or edit the first seller's data (A4.5 matrix recorded).

Order for A: A4.1 → A4.2 → A4.3 → A4.4 → A4.5. Order for B: B4.1 → B4.2 → B4.3; B4.4 can start as soon as A4.3 lands (use the seeded pending/rejected businesses).

---

## A4.1 · Seller services
**Owner** A · **Branch** `feat/a4-1-seller-services` · **Tool** Antigravity · **Est** 3 h · **Needs** A3.1
```
TASK A4.1 — Seller-side services (no UI).
Read: AGENTS.md, docs/CONTRACT.md §5, §7 (seller), docs/kit/04_API_and_Data_Access.md (seller rows), docs/kit/06_Feature_Specs.md (seller onboarding, Available Today), supabase/migrations/20260925000002_functions_triggers.sql, 20260925000003_rls_policies.sql, 20260925000004_rpc.sql (become_seller, submit, available-today, stats functions — exact names and params). If a function in the contract has no RPC, implement it with table writes allowed by RLS.
Implement in src/services/supabase/seller.js and export from index.js:
becomeSeller, getMyBusiness (business + contacts + all images/videos + all products incl. inactive), saveMyBusiness (create a draft if none — slug = slugify(name) + '-' + 4 random base36 chars; otherwise update; never write status/owner_id), saveMyContacts (validate 10-digit numbers with normalizeIndianMobile, store the 10-digit form the DB CHECK expects), listMyProducts, saveProduct (price rupees → price_paise), deleteProduct, addVideo (parseInstagramShortcode; invalid URL → AppError('validation', 'That doesn't look like a public Instagram reel link')), removeVideo, getSubmitChecklist (client-side, mirroring submit_business_for_review exactly: keys category, description, logo, location, instagram_handle, contacts, at_least_one_product — plus product_image, which the UI requires per D29 — each with a human label and the onboarding step number, CONTRACT §5), submitForReview (rpc('submit_business_for_review'); on incomplete_application:<keys> throw AppError validation with cause.missing; invalid_status → conflict; then return getMyBusiness()), setAvailableToday (direct update of available_today on the business or product; the nightly cron resets it), getMyStats (rpc('my_business_stats') → SellerStats). becomeSeller → rpc('become_seller') then return getMe().
Upload functions are A4.2 — leave them as stubs for now.
Tests for pure helpers (slug generation, checklist mapping). Plan first.
```
**Commit:** `feat(a4.1): seller services`

## A4.2 · Image pipeline
**Owner** A · **Branch** `feat/a4-2-images` · **Tool** Cursor · **Est** 2 h · **Needs** A4.1
```
TASK A4.2 — Compress → upload → image rows.
Read: supabase/migrations/20260925000005_storage.sql (bucket names, allowed paths per owner, size/type limits), docs/kit/snippets/src/lib/image-upload.ts (reference), src/lib/image.js.
Implement uploadBusinessImage({ kind, file }) and uploadProductImage(productId, file), removeBusinessImage, removeProductImage in src/services/supabase/seller.js:
1. compressImage (WebP, 1200px long edge, 0.8). Reject non-images and files > 10 MB before compressing (AppError validation).
2. Upload to the bucket and path the storage policy allows (typically `<bucket>/<uid>/<uuid>.webp`); get the public URL.
3. logo/banner → update businesses.logo_url / banner_url; gallery → insert business_images; product → insert product_images with sort_order = max + 1.
4. Remove = delete the row and the storage object (ignore "not found" on the object).
5. DECISIONS D18: if the A2.3 WhatsApp test showed WebP previews failing, also upload a 600px JPEG `og-<uuid>.jpg` for product cover images and store its URL where the OG function reads it (discuss the column with me first if one is needed — that's a migration).
Plan first.
```
**Verify:** upload a 5 MB phone photo → stored file is well under 500 KB · appears on the public page · removing deletes the object (Storage browser) · another seller can't upload into your path (try via the console with their session).
**Commit:** `feat(a4.2): image compression and storage upload`

## A4.3 · Admin services
**Owner** A · **Branch** `feat/a4-3-admin` · **Tool** Cursor · **Est** 1.5 h · **Needs** A3.1
```
TASK A4.3 — Admin services.
Read: docs/CONTRACT.md §6, §7 (admin), supabase/migrations (admin_set_business_status or equivalent, admin_actions, is_admin(), admin read policies).
src/services/supabase/admin.js: listApplications({ status }) → rpc('admin_list_businesses', { p_status: status ?? null }) → ApplicationRow[] (includes owner name/email, phone, WhatsApp, Instagram, product count; no pagination); getApplication(businessId) → { business: full select of businesses + business_contacts + images + videos + products with images (admin RLS allows all statuses), row: the matching ApplicationRow (from listApplications({ status: null })), history: admin_actions for the business with the admin's full_name }; decideApplication({ businessId, action, reason }) → rpc('admin_set_business_status', { p_business, p_status, p_reason }) with approve/republish → 'approved', reject → 'rejected', unpublish → 'unpublished'; validate client-side that reason is present for reject/unpublish and that the transition is allowed (CONTRACT §7); map invalid_transition → conflict, reason_required → validation.
Plan first.
```
**Commit:** `feat(a4.3): admin services`

## A4.4 · Enquiry services
**Owner** A · **Branch** `feat/a4-4-enquiries` · **Tool** Cursor · **Est** 2 h · **Needs** A3.1
```
TASK A4.4 — Non-real-time enquiry services (DECISIONS D20).
Read: docs/CONTRACT.md §6, §7 (enquiries), supabase migrations for enquiries, enquiry_messages, their triggers (notifications) and RPCs.
src/services/supabase/enquiries.js (names per CONTRACT §7):
- sendEnquiry({ businessId, productId, body }) → rpc('send_enquiry', { p_business, p_body, p_product }) → threadId (creates or reuses the one thread per customer+business; rate-limited 20/hour; cannot_enquire_own_business → forbidden).
- findMyThread(businessId) → from('enquiries').select('id').eq('business_id', businessId).eq('customer_id', uid).maybeSingle() → id | null.
- listMyThreads({ as }) → rpc('my_enquiries', { p_as: as }) → EnquiryThread[] (lastMessagePreview = last_message truncated to 80 chars).
- getThread(threadId, { as }) → from('enquiries').select('id,status,product_id,businesses(id,slug,name,logo_url),products(id,name)') + from('enquiry_messages').select('*').eq('enquiry_id', id).order('created_at'); customerName comes from the matching my_enquiries row (sellers can't read customer profiles under RLS); fromMe = sender_id === uid; null if not visible.
- sendMessage({ threadId, body }) → from('enquiry_messages').insert({ enquiry_id, sender_id: uid, body: body.trim() }) — used for seller replies; customers use sendEnquiry for every message so the rate limit applies.
- markThreadRead(threadId) → rpc('mark_enquiry_read', { p_enquiry }) (also clears that thread's notifications).
src/queries/enquiries.js: hooks for each; sending invalidates the thread, both lists and qk.unread.
Register an 'enquiry' gate handler: the pending payload carries { businessId, productId, body } so after login the draft is sent with sendEnquiry and the user lands on /enquiries/<threadId>.
Plan first.
```
**Commit:** `feat(a4.4): enquiry services and hooks`

## A4.5 · RLS role matrix
**Owner** A · **Est** 1.5 h · **Needs** A4.1–A4.4 · **Tool** you + Claude.ai (prompt D2 for anything suspicious)
Create test accounts on dev: customer, seller A, seller B, admin. Walk the matrix in `docs/kit/09_Testing_QA_Launch.md` §3 through the app **and** with the curl probes (`06` §5, plus the same calls with each user's access token as `Authorization: Bearer <jwt>` — copy it from the app's session in DevTools). Must-pass rows: seller B can't read A's contacts, drafts, or enquiries; a customer can't approve anything or change their role; guests never see pending businesses or any contacts. Record pass/fail in PROGRESS. Any failure → prompt D1 (new migration) → re-run.

---

## B4.1 · Sell landing, seller signup, seller routing
**Owner** B · **Branch** `feat/b4-1-sell` · **Tool** Cursor · **Est** 1.5 h · **Needs** A4.1
```
TASK B4.1 — Entry into the seller side.
1. src/pages/seller/SellLandingPage.jsx (/sell, public): short pitch (discovered by nearby customers, WhatsApp enquiries, free to list), 3 steps (create account → set up your shop → get approved), CTA:
   guest → /signup?as=seller&next=/seller/onboarding · customer → Button "Start selling" → becomeSeller() → invalidate me → /seller/onboarding · seller → /seller.
2. src/pages/seller/SellerGate.jsx wrapping all /seller routes: RequireAuth + RequireRole(['seller']); if getMyBusiness() is null or status 'draft' and the route isn't /seller/onboarding → redirect to /seller/onboarding.
3. src/queries/seller.js: hooks for every seller service (useMyBusiness, useSaveMyBusiness, useSaveMyContacts, useMyProducts, useSaveProduct, useDeleteProduct, useUploadBusinessImage, useUploadProductImage, useRemove…Image, useAddVideo, useRemoveVideo, useSubmitChecklist, useSubmitForReview, useSetAvailableToday, useMyStats) with invalidation of qk.myBusiness / qk.myProducts.
4. Routes in src/App.jsx for the seller area (pages may be placeholders until B4.2/B4.3). Remove the legacy /seller/* routes that pointed at SellerDashboard/SellerRegister only when B4.2/B4.3 replace them.
Plan first.
```
**Commit:** `feat(b4.1): sell landing, seller signup and route gate`

## B4.2 · Onboarding wizard
**Owner** B · **Branch** `feat/b4-2-onboarding` · **Tool** Antigravity · **Est** 4 h (split with S11 if needed) · **Needs** B4.1, A4.2
```
TASK B4.2 — 7-step onboarding at /seller/onboarding. Replaces src/SellerRegister.jsx (delete it; the fake OTP goes with it).
Read: AGENTS.md, docs/CONTRACT.md §5, docs/kit/06_Feature_Specs.md (seller onboarding), src/queries/seller.js, src/lib/{whatsapp,instagram,geo,image}.js.
src/pages/seller/onboarding/OnboardingPage.jsx + one component per step, ProgressHeader ("Step 3 of 7"), Back/Next footer. Each step validates with zod and SAVES on Next (autosave to the draft), so leaving and returning resumes at the first incomplete step.
1. Basics — business name (2–80), category (leaf categories grouped by parent), description (≤ 2000, counter).
2. Location — "Use my current location" (getBrowserLocation) or pick an area (MUMBAI_AREAS) → lat/lng + locality; address text; city (default Mumbai); delivery / pickup switches.
3. Contact — phone and WhatsApp (10-digit, "same as phone" checkbox), Instagram handle (strip @ and URL; used by admin to verify).
4. Branding — logo (required, square crop preview), banner (optional, 16:9 preview), gallery (up to 6). Show upload progress per file; retry on failure.
5. Products — list + "Add product" opens ProductForm (shared with B4.3: name, price in ₹ integer, description, details label/value rows, category override, images up to 5, available today, active). At least one product with an image to continue.
6. Videos — paste public Instagram reel links (validated), caption, preview via ReelEmbed; optional.
7. Review & submit — useSubmitChecklist: each missing item (CONTRACT §5 keys) links back to its step; Submit enabled only when ok → submitForReview → status screen: "Under review — we'll notify you". If the RPC still returns validation with cause.missing, show those items.
Step 1 must create the draft business (saveMyBusiness) before step 4, because storage uploads are only allowed into the folder of a business you own (CONTRACT §13).
If status is pending: show the status screen instead of the wizard, with "Edit details" (edits allowed per D23 once approved; while pending, allow edits but keep status). If rejected: show the reason prominently with "Fix and resubmit".
Plan first; split into sub-tasks if the plan exceeds ~12 files.
```
**Verify:** complete all steps on a real phone with camera photos · kill the tab at step 4 and return → resumes at step 4 with data kept · checklist blocks submit until complete · pending status screen after submit · `git grep -n "1234\|otp" src` → nothing.
**Commit:** `feat(b4.2): seller onboarding wizard with autosave`

## B4.3 · Seller dashboard
**Owner** B · **Branch** `feat/b4-3-seller-dashboard` · **Tool** Antigravity · **Est** 4 h (split if needed) · **Needs** B4.2
```
TASK B4.3 — Seller area. Replaces src/SellerDashboard.jsx (2,037 lines) and src/SellerProductDetail.jsx — delete both.
1. /seller — SellerHomePage: status banner (approved / pending / rejected with reason / unpublished), "Available today" Switch for the business, stats cards from useMyStats (WhatsApp taps, calls, enquiries in 30 days, rating), quick links: Products, Videos, Edit business, Enquiries (placeholder until B5.1), Reviews (placeholder until B5.2), "View public page" (/b/:slug, only when approved).
2. /seller/products — list with thumbnail, name, price, Available-today switch, Active switch, edit; "Add product". Empty state → add first product.
3. /seller/products/new and /seller/products/:id — ProductForm (shared with onboarding) with image add / remove / reorder (move up/down buttons are fine), delete product (confirm Dialog).
4. /seller/videos — list, add by link, remove (confirm).
5. /seller/business — edit the onboarding fields (reuse the step components in a single scrolling form) incl. branding.
All seller pages hide BottomNav and use PageHeader back to /seller. Remove the legacy seller routes and urlMap keys; update the allowlist.
Plan first.
```
**Commit:** `feat(b4.3): seller dashboard, products, videos, business editing`

## B4.4 · Admin panel
**Owner** B · **Branch** `feat/b4-4-admin` · **Tool** Antigravity · **Est** 3 h · **Needs** A4.3
```
TASK B4.4 — Admin panel (SOW Admin section).
src/queries/admin.js hooks + pages under src/pages/admin/, all wrapped in RequireAuth + RequireRole(['admin']):
1. /admin — Tabs Pending | Approved | Rejected | Unpublished (?status=), counts in tab labels; rows: name, category, locality, owner name, submitted "3 d ago"; tap → detail.
2. /admin/applications/:businessId — everything the admin needs to verify: logo, banner, name, category, description, address + locality (with a Google Maps link built from lat/lng), phone and WhatsApp (tap-to-call / wa.me links), Instagram handle linking to https://instagram.com/<handle>, gallery, products with images and prices, videos, status + rejection reason, history (action, reason, admin, date).
   Actions depending on status (allowed transitions, CONTRACT §7): pending → Approve / Reject; approved → Unpublish; unpublished → Republish; rejected → Approve. Tab counts come from one listApplications({ status: null }) call grouped by status. Reject and Unpublish open a Dialog with a required reason (min 10 chars). After an action: toast, invalidate lists, stay on the page showing the new status.
3. "View public page" when approved.
Plan first.
```
**Verify:** with seeded data: approve the pending business → it appears on Home for a guest · reject the other with a reason → the seller sees the reason on /seller · unpublish an approved one → it disappears for guests, still visible to its owner · a customer account at /admin sees the 403 screen.
**Commit:** `feat(b4.4): admin panel with approve, reject, unpublish`
