# PROGRESS — living log (newest entry on top)

Every AI session starts by reading **Now** and ends by adding a **Log** entry. When a tool runs out of quota mid-task, write the entry anyway (or ask the tool to) so the next tool or person can continue.

## Now
- Week: 3 (12–16 Oct 2026) · Target: Accounts, contact, retention
- Data source on preview: `supabase` · Production URL: `https://tibu-app.pages.dev`
- Last green commit on main: `738344f`
- Merged this week: A3.1 auth and profile services, auth store, route guards (#21)
- In progress: B3.1–B3.5 on stacked branches feat/b3-1-auth-pages … feat/b3-5-saved-recent (not pushed)
- Next task: B3.5 (Saved, Recently viewed, Previously connected)
- Deferred follow-ups: none from Week 2 pages. Saved reel taps are a no-op until Saved is rebuilt (B3.5); legacy Saved “View All →” is 24 px high (B3.5).
- Blocked: —
- Waiting on client: accounts-request message (docs/build/08_CLIENT_COMMS.md §3) — sent 27 Sep for GitHub + Supabase org; Resend and domain access still to be requested · decisions list (docs/build/08_CLIENT_COMMS.md §2) not yet sent
- Hosting: Cloudflare Pages project is `tibu-app` (`https://tibu-app.pages.dev`).
- Unavailable evenings this week: —

## Log

### 2026-10-15 · B3.4 — Profile and Edit profile · dk · Claude Code (Opus 5.5)
- Done: **`/profile`** (`src/pages/profile/ProfilePage.jsx`): guest → lavender card with "Log in" / "Create account" (both `?next=%2Fprofile`), a "Recently viewed" row (works for guests) and the info rows; signed in → avatar, name, email, Edit button, rows Saved · Recently viewed · Previously connected · Notification settings (`/notifications/settings`) · Admin panel (admins only), info rows Help · About · Privacy · Terms, and Log out behind a confirm `Dialog` (cache cleared by AuthBootstrap on `SIGNED_OUT`). Loading skeleton / ErrorState with retry / "couldn't find your profile" empty state. **"Sell on Tibu" and "Seller dashboard" are hidden** until B4.1 (`TODO(B4.1)` in `accountRows`, `profileForm.js`) so nobody reaches the legacy `/seller/register` with its fake OTP. **`/profile/edit`** (`RequireAuth`): react-hook-form + zod; full name; phone optional, validated with `normalizeIndianMobile` only when entered and stored as 10 digits; avatar picker with local preview, uploaded on Save via `uploadAvatar` (which stores its URL); home area Select of `MUMBAI_AREAS` or "Use current location" (browser asked only on that choice; saved as "Current location" with 3-decimal coordinates) → `homeLocality/homeLat/homeLng` via `updateMe` only; "Grouped updates about new businesses near me" Switch → `notifyDigest`. Save → toast "Profile saved" → /profile; validation/conflict errors inline. **Routes:** `/notifications/settings` (temporary) and `/notifications/preferences` both show the legacy NotificationPreferences page until B5.3. **Removed:** `ProfileProvider` from `main.jsx`, `useProfile` + the `profile`/`setProfile`/`profileStats` props from `LegacyPage`; deleted `src/Profile.jsx`, `src/EditProfile.jsx`, `src/contexts/ProfileContext.jsx` and its allowlist entry. `git grep -n useProfile src` → no matches. No remaining legacy page used `useProfile` (NotificationPreferences keeps its own local state already), so no legacy file needed a fix.
- Files: new `src/pages/profile/{ProfilePage,ProfileRows,LogoutButton,EditProfilePage,EditProfileForm,AvatarPicker,HomeAreaField}.jsx`, `profileForm.js` (+test); modified `src/App.jsx`, `src/main.jsx`, `scripts/legacy-allowlist.json`, `docs/PROGRESS.md`; deleted the three legacy files.
- How verified: `npm run check` green (guards OK with 2 allowlist entries and no stale warning, 33 files / 282 tests, build OK). Unit: phone optional/invalid/normalised, name limits, profile ↔ form ↔ patch (never `role`/`avatarUrl`), half-filled home area dropped, rows by role (admin only for admins, no seller rows). Headless Chrome: production preview (guest) at 360/390/430 — card, `next` links, rows, no member rows, nav visible, no overflow, targets ≥ 44 px; guest `/profile/edit` → `/login?next=%2Fprofile%2Fedit`; both notification paths render. Dev server with a seeded profile (React Query cache + auth store set from the test, since mock has no accounts): member header and rows for customer and admin, log-out dialog opens/cancels; edit form prefilled (name, Bandra West, switch on), invalid phone message, area change, label row toggles the switch (switch hit area 44 px via a pseudo-element; the file input's target is its 44 px label), mock save fails inline and stays (70 checks).
- Not done / left out (why): **A3.5 (profile home area → location store default) is not done** and stays out of scope; the home area is only saved on the profile. Real `updateMe` / avatar upload / sign-out against Supabase not run (no keys). Saved / Recently viewed / Previously connected rows point at routes that arrive in B3.5 (404 on this branch alone). `/admin` is a 404 until Week 4 (admins only see it). The shared `Select` has no chevron (primitive unchanged).
- Next step (exact): B3.5; then on `tibu-dev`: edit name/phone/area/avatar and reload; log out → Saved tab asks to log in again.
- Review fix (S9, same branch): the signed-in loading / error / no-profile states of `/profile` had no `<h1>` — they now carry a screen-reader-only "Profile" heading (the data state keeps the visible name heading); the avatar "saved when you tap Save" hint is announced (`role="status"`). Declined from the review: rounding named-area coordinates (CONTRACT §12 / D38 apply to business coordinates; `MUMBAI_AREAS` are public centroids), guarding the temporary `/notifications/settings` route (spec: temporary route to the legacy page, local state only; B5.3 replaces it), the `useWatch` tuple, an `onError` on sign-out (the global mutation handler already toasts network/unknown failures), HEIC messaging (iOS converts to JPEG when `accept` is JPEG/PNG/WebP).
- Gotchas for the next person: Profile phone is the customer's own number on `profiles`, unrelated to `business_contacts` — still never on public shapes.

### 2026-10-15 · B3.3 — Contact buttons live · dk · Claude Code (Opus 5.5)
- Done: ProductPage and BusinessPage call `useContactAction().start(channel, …)` from ContactButtons — the product page passes `{ business, product }` (the hook keeps id, name, price), the business page only `{ business }`. Placeholder "coming soon" toasts removed. `ContactButtons` takes `loadingChannel` (= `pendingChannel`): that button shows a spinner and both are disabled while the number is revealed; its unused `business`/`product` props were dropped. Navigation stays `window.location.href` (A3.2). The WhatsApp text in `src/lib/whatsapp.js` matches CONTRACT §10 character for character (now also asserted end to end in `src/queries/contact.test.js`). **VITE_SITE_URL:** `contact.js` used the raw value, so a trailing `/` would have produced `https://…//p/<id>` in the WhatsApp message; it and the auth adapter now share `src/lib/siteUrl.js` (trims trailing slashes, falls back to the page origin).
- Files: new `src/lib/siteUrl.js` (+test), `src/queries/contact.test.js`; modified `src/components/ContactButtons.jsx`, `src/pages/product/ProductPage.jsx`, `src/pages/business/BusinessPage.jsx`, `src/queries/contact.js` (site URL only), `src/services/supabase/auth.js` (imports the shared helper; behaviour unchanged), `docs/PROGRESS.md`.
- How verified: `npm run check` green (guards OK, 32 files / 271 tests, build OK). Unit: exact product and business messages, `/p/` and `/b/` links with a trailing-slash `VITE_SITE_URL`, `wa.me/91…`, `tel:+91…`, missing-number toast without navigation. Headless Chrome on the production preview (mock), 360/390/430 px: guest WhatsApp on a product → sheet "Log in to contact Aura Candles" with pending `{ type: 'whatsapp', payload.product: { id, name, price }, returnTo: '/p/…' }`; guest Call on a business → sheet with `product: null`; no placeholder toast; no overflow or console errors (22 checks).
- Not done / left out (why): the authenticated path (reveal → WhatsApp/dialler, loading state, rate-limit toast, Previously connected) needs Supabase and **real phones** (Android Chrome + iOS Safari) — not run.
- Next step (exact): on two phones against `tibu-dev`: logged-out WhatsApp tap → sheet → log in → WhatsApp opens the right chat with the §10 text and a working `/p/` link; Call → dialler with +91; 10+ quick taps → rate-limit toast; then B3.5's Previously connected shows the business.
- Review fix (S9, same branch): `start()` ignores taps while auth is still restoring, which left the buttons enabled but dead. `useContactAction` now also returns `ready` and `ContactButtons` takes `disabled`, so both buttons are disabled until the session is known (checked in Chrome by forcing the auth store to `loading`). S9 also asked to split the shared `siteUrl` helper's one-line change in `src/services/supabase/auth.js` into its own commit — declined: it is the shared helper requested for `VITE_SITE_URL`, behaviour is unchanged, and splitting would mean rewriting pushed history.
- Gotchas for the next person: `useContactAction` must be called before the pages' early returns (rules of hooks) — it is, next to `useTrackView`.

### 2026-10-15 · B3.2 — Login sheet · dk · Claude Code (Opus 5.5)
- Done: `src/components/LoginSheet.jsx` — bottom sheet (`ui/Sheet`, native `<dialog>`) driven by `useLoginGateStore`. Title from `pending.type` via `src/lib/gateTitle.js`: "Log in to contact <businessName>" (WhatsApp/Call), "Log in to save", "Log in to send an enquiry", "Log in to write a review". Body is the same `LoginForm` as /login (no second form), loaded lazily the first time the sheet opens so react-hook-form + zod stay out of the main bundle (main chunk 303 kB / 92 kB gzip). Close button, Escape and backdrop → `loginGate.cancel()` (pending action cleared). "Create an account" → `loginGate.close()` (pending kept in localStorage) + `/signup?next=<encoded returnTo>`. Successful login → `close()`; GateResumer replays the action. The sheet never shows to a signed-in user (e.g. logged in from another tab meanwhile). Mounted once in `App.jsx` next to `<GateResumer />` — not `providers.jsx`, which sits outside the router (approved deviation).
- Files: new `src/components/LoginSheet.jsx`, `src/lib/gateTitle.js` (+test); modified `src/App.jsx`, `docs/PROGRESS.md`.
- How verified: `npm run check` green (guards OK, 30 files / 265 tests, build OK). Headless Chrome on the Vite dev server (mock), opening the sheet through the real store module: opens at 360/390/430 px with the right title, no horizontal scroll, all targets ≥ 44 px; save/enquiry/review titles; Close and Escape close it and clear `tibu.pendingAction`; mock login inside the sheet shows the friendly message and keeps the sheet open; "Create an account" lands on `/signup?next=%2Fb%2Fammas-kitchen%3Ftab%3Dreviews` with the sheet closed and the pending action still stored; no console errors (25 checks).
- Not done / left out (why): a real login inside the sheet → action replay needs Supabase keys (tested by hand in B3.3's flow).
- Next step (exact): B3.3 — wire ContactButtons.
- Review fix (S9, same branch): the sheet's `open` state went stale when another tab consumed or cancelled the pending action. `LoginSheet` now listens for `storage` events (`handlePendingStorageEvent` in `src/stores/loginGate.js`) and closes when the persisted action is gone; it does not gate on `peekPending()` at render, so a tab with blocked localStorage still shows the sheet. Mounting stays in `App.jsx` (approved; `providers.jsx` is outside the router) — S9 flagged this, declined.
- Gotchas for the next person: `LoginForm` renders only while the sheet is visible, so its fields reset every time it opens.

### 2026-10-15 · B3.1 — Auth pages · dk · Claude Code (Opus 5.5)
- Done: **Contract (separate commit `023e5d6`, D39):** `resendConfirmation(email)` added to CONTRACT §7 (v1.2.2), `FUNCTION_NAMES`, the Supabase adapter (`auth.resend({ type: 'signup', email, options: { emailRedirectTo: <site>/auth/callback } })`), mock (`unavailable_in_mock`) and the contract test. **Pages** (`src/pages/auth/`, each < 105 lines): `LoginPage` (/login), `SignupPage` (/signup, `?as=seller` changes the copy and sends `signupAs: 'seller'`), `ForgotPasswordPage`, `ResetPasswordPage`, `AuthCallbackPage`, with shared `AuthLayout` (logo + lavender-topped card), `LoginForm` (the only login form; B3.2's sheet reuses it), `SignupForm`, `CheckInbox`, `PasswordField` (show/hide), `TextField` (16 px text so iOS doesn't zoom), `FormAlert`. **Behaviour:** wrong password → "Email or password is incorrect"; unconfirmed → message + "Resend email"; `?next=` honoured after login and sign-up and kept on the Login ↔ Sign-up links (`safeNextPath` rejects `//host`, absolute URLs and auth paths); signed-in visitors to /login or /signup go to `/`; when a gated action is pending the pages don't navigate and leave it to GateResumer (new `peekPending()` in `src/stores/loginGate.js`). Check-inbox screen: "I've confirmed — log in" shows the login form in the same tab (email prefilled, `?next` kept), plus Resend and "Use a different email"; if the account is confirmed in another tab of the same browser the screen moves on by itself. `/auth/callback`: spinner while the session restores → pending action: "Taking you back…" (GateResumer navigates and replays) → none: "Email confirmed. If you started on another tab or app, go back there and log in." with "Continue here"; a link error (`#error_code=otp_expired`) or no session → "Link not valid" + Log in. `/reset-password` without a session → "Link not valid" + "Send a new link". Mock mode: every submit shows "Accounts aren't available in this demo build." **Plumbing:** `src/queries/auth.js` (silent mutations: forms show errors inline), zod schemas in `src/pages/auth/schemas.js`, routes in `App.jsx` (lazy), auth prefixes in `src/layouts/navVisibility.js` (`HIDDEN_PREFIXES` lives there; BottomNav and AppShell both read it). No `flowType` change (default implicit flow).
- Files: new `src/pages/auth/*` (13 components/modules + `schemas.test.js`, `authHelpers.test.js`), `src/queries/auth.js`, `src/layouts/navVisibility.test.js`; modified `src/App.jsx`, `src/layouts/navVisibility.js`, `src/stores/loginGate.js` (+test), `package.json`, `package-lock.json`. Contract commit: `docs/CONTRACT.md`, `docs/DECISIONS.md`, `src/services/{contract,contract.test,index}.js`, `src/services/mock/index.js`, `src/services/supabase/{auth,auth.test,index}.js`.
- Dependencies: `react-hook-form@^7.89.0`, `zod@^4.6.5`, `@hookform/resolvers@^5.9.1` (versions ≥ 2 weeks old). `zodResolver` + zod 4 verified in `schemas.test.js` (values on success; field errors incl. the refine path on failure).
- How verified: `npm run check` green (guards OK, 29 files / 261 tests, build OK). Production build + `vite preview` in headless Chrome (mock data source, no `.env`): all 7 auth URLs at 360/390/430 px — correct heading, bottom nav hidden, no horizontal scroll, every tap target ≥ 44 px, no console errors (118 checks); empty/malformed submits show the field messages; mock submit shows the friendly message; "Create an account" keeps `?next=%2Fsaved`; Forgot-password and callback → Log in links work.
- Not done / left out (why): Nothing ran against Supabase (no keys locally): real sign-up, confirmation e-mail, wrong-password text from the live API, reset round trip, the signed-in redirect and the pending-action hand-off are **untested by hand**. The keyboard-vs-submit check needs a real phone. Only team addresses receive mail until Resend + the domain are live (A3.5).
- Next step (exact): with `tibu-dev` keys: sign up with a team address → confirm in Gmail (Android) and the iOS Gmail + Mail apps → land on /auth/callback; wrong password; reset round trip; `/login?next=/saved`.
- Review fix (S9, same branch): a one-time `peekPending()` could go stale. `AuthCallbackPage` and the Check-inbox redirect now read `useHasPendingAction()` (re-renders on `storage` events from other tabs and on gate-store changes), and the login/signup pages navigate through `useAfterAuth(next)`: with a pending action it waits for GateResumer but a 1.5 s fallback sends the user on if the page is still mounted (action expired mid-request or taken by another tab; GateResumer navigating away unmounts the page and cancels the timer). Verified in Chrome on the dev server (callback page, simulated `storage` events); the fallback timer itself has no automated test (no jsdom).
- Gotchas for the next person: `LoginForm.onSuccess({ hadPending })` — `hadPending` is read *before* sign-in because GateResumer consumes the action as soon as the store flips. Pages that start a login set a `submitted` flag first, otherwise the "signed-in visitor → /" redirect fires on their own success. `contact.js` builds links from raw `VITE_SITE_URL` (a trailing `/` would give `//p/`); fixed with a shared helper in B3.3.

### 2026-10-15 · A3.4 — Recently viewed + previously connected · dk · Antigravity (Gemini Flash)
- Done: **Implemented and Verified** Task A3.4 (Activity tracking services + queries + hooks):
  1. `src/services/supabase/activity.js`: Three functions — `trackView({ kind, id })` (calls `track_view` RPC with `p_business` or `p_product`), `listRecent({ limit })` (queries `recent_views` with embedded businesses & products ordered by `viewed_at` DESC; maps to `RecentItem[]` with `paiseToRupees`, sorts product images by `sort_order`, skips rows with null embeds), and `listConnected({ limit })` (calls `my_connected_businesses` RPC with `p_limit`, maps to `ConnectedItem[]`).
  2. `src/services/supabase/index.js`: Replaced `notImplemented` stubs for `trackView`, `listRecent`, and `listConnected` with real exports from `./activity.js`.
  3. `src/lib/recentLocal.js`: Guest-side recent views stored in localStorage under `tibu.recent` (max 30 items, newest first, deduplication by kind + id, safe checks when `localStorage` is undefined).
  4. `src/queries/activity.js`: `useTrackView(kind, id, { enabled, serverId })` (fires view tracking once per mount when entity is loaded; guest stores to localStorage, authenticated calls `trackView`), `useRecent()` (authenticated calls `listRecent`, guest resolves local slugs/UUIDs via catalog queries), `useConnected()` (authenticated + Supabase calls `listConnected`), and `flushLocalRecent()` (flushes guest local items oldest-first on login, resolves business slugs to UUIDs, then clears local storage).
  5. `src/app/GateResumer.jsx`: Added side-effect import for `../queries/activity.js` and hooked `flushLocalRecent()` to fire when `authStatus` transitions to `authenticated`.
  6. `src/pages/product/ProductPage.jsx` & `src/pages/business/BusinessPage.jsx`: Integrated `useTrackView` unconditionally at the top of components (`enabled: !!product`/`!!business`).
  7. Tests: `src/lib/recentLocal.test.js` (9 unit tests for storage, deduplication, 30-item cap, clear, invalid JSON, and missing localStorage fallback) and `src/services/supabase/activity.test.js` (5 unit tests covering `trackView` RPC args and error resilience, `listRecent` embed mapping and rupee conversion, and `listConnected` RPC mapping).
- Files: created `src/services/supabase/activity.js`, `src/services/supabase/activity.test.js`, `src/lib/recentLocal.js`, `src/lib/recentLocal.test.js`, `src/queries/activity.js`; modified `src/services/supabase/index.js`, `src/app/GateResumer.jsx`, `src/pages/product/ProductPage.jsx`, `src/pages/business/BusinessPage.jsx`, `docs/PROGRESS.md`.
- How verified: `npm run check` green — check-guards OK (192 source files, 3 legacy allowlist entries), ESLint 0 errors, Vitest **48 test files / 429 tests passed** (including all 9 `recentLocal.test.js` tests and 5 `activity.test.js` tests), Vite production build OK (309 modules). Hand-verified by user in DevTools console: confirmed guest view tracking into `localStorage['tibu.recent']`, deduplication on revisits, and dynamic import execution of `flushLocalRecent()` fulfilling and clearing local storage.
- Not done / left out (why): Activity UI screens (Recent views list, Connected businesses list on Profile/Saved) — that is Task B3.5.
- Gotchas for next person: `track_view` RPC expects `uuid` for `p_business`. Guest localStorage stores business `slug` (from `/b/:slug` route); `useTrackView` takes `serverId: business?.id` to send the UUID to the RPC when authenticated, while storing the slug for guests. `flushLocalRecent` resolves business slugs to UUIDs via `getBusinessBySlug` before calling `trackView`.
- Next step: B3.1 (Auth pages) or B3.2 (Login sheet) or B3.5 (Saved, Recently viewed, Previously connected pages).

### 2026-10-14 · A3.3 — Saved businesses and products · dk · Antigravity (Gemini Flash)
- Done: **Implemented and Verified** Task A3.3 (Saved items service + queries + gate handler):
  1. `src/services/supabase/saved.js`: Four functions — `getSavedIds()` (parallel select from both saved tables, returns `SavedIds`), `listSavedBusinesses()` (saved_businesses → businesses!inner with categories, ordered by created_at DESC, approved only), `listSavedProducts()` (saved_products → products!inner → businesses!inner, active + approved only, uses `mapProductSummaryNested` / `mapBusinessSummary`), `setSaved({ kind, id, saved })` (upsert with `ignoreDuplicates: true` on composite PK; delete scoped by RLS). User id obtained from `auth.getSession()` (cached, no network call).
  2. `src/queries/keys.js`: Added `savedBusinesses: ['savedBusinesses']` and `savedProducts: ['savedProducts']` for surgical list-cache invalidation.
  3. `src/queries/saved.js`: Pure helpers `isInSavedIds` and `applyOptimisticToggle` (exported for tests). Gate handler `performSaveAction` registered at module load via `registerGateHandler('save', ...)` — plain function, no hooks, forwards `queryClient` from GateResumer. Hooks: `useSavedIds()` (enabled when authenticated, 30s staleTime), `useIsSaved(kind, id)` (derived, no extra fetch), `useToggleSave()` (useMutation with optimistic update on `qk.saved`, rollback + toast on error, invalidates id-set + list key on settle).
  4. `src/queries/saved.test.js`: 17 unit tests for `isInSavedIds` (8 cases: present/absent/wrong-kind/null/empty/cross-contamination) and `applyOptimisticToggle` (9 cases: add/remove/dedupe/no-op/product/null/undefined/mutation-check).
  5. `src/app/GateResumer.jsx`: Added `import '../queries/saved.js'` side-effect import so the 'save' handler is registered before `resumePending` fires on cold starts.
  6. `src/services/supabase/index.js`: Replaced four `notImplemented` stubs with real exports from `./saved.js`.
- Files: created `src/services/supabase/saved.js`, `src/queries/saved.js`, `src/queries/saved.test.js`; modified `src/services/supabase/index.js`, `src/queries/keys.js`, `src/app/GateResumer.jsx`, `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified: `npm run check` green — check-guards OK (187 source files, 3 legacy allowlist entries), ESLint 0 errors, Vitest **46 test files / 415 tests passed** (including all 17 `saved.test.js` tests), Vite production build OK (306 modules). `contract.test.js` passes (both adapters export all `FUNCTION_NAMES`). Hand-verified by user in DevTools console (gate store request & resume execution) and via `npx vitest run src/queries/saved.test.js` (17/17 passed).
- Not done / left out (why): No UI (save button, Saved page) — that is Task B3.5. `listSavedBusinesses` / `listSavedProducts` hooks not created since no page consumes them yet (B3.5 will add them). `listConnected` query not in scope.
- Gotchas for next person: `setSaved` fetches the session from cache (`auth.getSession()`) — no extra network call. The Supabase upsert uses `ignoreDuplicates: true` on the composite PK (not `returning: 'minimal'`). The `!inner` join means if a saved business is deleted from the DB, the row simply won't appear (no 404). `useIsSaved` calls `useSavedIds` internally — make sure both are under the same `QueryClientProvider`. `applyOptimisticToggle` returns `old` unchanged when `old` is falsy (undefined/null) — this is intentional so the optimistic patch is a no-op if the cache is cold.
- Next step: B3.1 (Auth pages — `/login`, `/register`, `/auth/callback`, `/reset-password`) or B3.2 (Login bottom sheet wired to `useLoginGateStore`).

### 2026-10-13 · A3.2 — Login gate + reveal contact · dk · Antigravity (Gemini Flash)
- Done: **Implemented and Verified** Task A3.2 ("Log in to contact" mechanism and revealContact):
  1. `src/stores/loginGate.js`: Zustand store with `open`, `pending` (`{ type, payload, returnTo, createdAt }`), `request(action)`, `cancel()`, `close()`. Stores pending action in localStorage via `setWithExpiry('tibu.pendingAction', ..., 10 * 60 * 1000)`. Module-level handler registry with `registerGateHandler(type, handler)` and `resumePending()`. `resumePending` removes the item first, then executes the handler; unknown types clear silently without throwing.
  2. `src/stores/loginGate.test.js`: Unit tests covering all 4 task scenarios: request persists to localStorage with expiry, cancel clears store and localStorage, expired pending action is ignored on resume, unknown type is handled silently without error.
  3. `src/services/supabase/contact.js`: `revealContact({ businessId, channel, productId })` calls `reveal_contact` RPC via `getSupabase().rpc`, handles table row result (`phone`, `whatsapp`), maps errors via `mapSupabaseError`. Exported through `src/services/supabase/index.js`.
  4. `src/queries/contact.js`: `useContactAction()` hook returning `{ start, pendingChannel }`. Guest path opens login gate via `loginGateStore.getState().request`. Authenticated path calls `performContactAction` directly. `performContactAction` calls `revealContact`, invalidates `qk.connected` cache if queryClient is available, and opens WhatsApp or `tel:` link using `window.location.href` (iOS-safe). Module registers 'whatsapp' and 'call' gate handlers immediately so `resumePending()` can run without requiring prior component mount.
  5. `src/app/GateResumer.jsx`: Null-rendering component inside `BrowserRouter`. Listens for auth status transition from guest/loading to authenticated, checks non-expired pending action, navigates to `returnTo` if needed, and triggers `resumePending()`.
  6. `src/App.jsx`: Mounted `<GateResumer />` inside `BrowserRouter`.
- Files: created `src/stores/loginGate.js`, `src/stores/loginGate.test.js`, `src/services/supabase/contact.js`, `src/queries/contact.js`, `src/app/GateResumer.jsx`; modified `src/services/supabase/index.js`, `src/App.jsx`, `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified:
  1. `npm run check` green: check-guards OK (179 source files, 3 legacy allowlist entries), ESLint 0 errors, Vitest **43 test files / 375 tests passed** (including all 9 `loginGate.test.js` tests), Vite production build OK (300 modules).
  2. Verified `loginGate` store lifecycle (request -> persist with TTL -> cancel clears -> expiry ignores -> resume executes).
- Not done / left out (why): Login sheet UI is in Task B3.2.
- Gotchas: `GateResumer` must sit inside `BrowserRouter` (mounted in `App.jsx`) to access `useNavigate`/`useLocation`; vitest runs in Node so unit tests require `createMemoryStorage` stubbing; `window.location.href` must be used instead of `window.open` for WhatsApp/tel links because iOS WebKit blocks popups triggered after an asynchronous await.
- Next step: B3.1 (Auth pages) / B3.2 (Login sheet) / A3.3 (Saved items).

### 2026-10-10 · A3.1 — Auth and profile services, auth store, route guards · dk · Claude Code (Sonnet 5.5)
- Done: **Services:** `src/services/supabase/auth.js` (getSession, onAuthChange → unsubscribe, signUp, signIn, signOut, sendPasswordReset → `/reset-password`, updatePassword) and `me.js` (getMe, updateMe with a column whitelist that never sends `role`, uploadAvatar → 400 px webp at `avatars/{userId}/<uuid>.webp`), exported from `src/services/supabase/index.js` (mock still throws `unavailable_in_mock`). `signUp` sends `options.data { full_name, signup_as }` (only the exact value `seller` is passed as seller; anything else is `customer`) and `emailRedirectTo` `${VITE_SITE_URL}/auth/callback`; no `flowType`/pkce. **State:** `src/stores/auth.js` (`loading | guest | authenticated`, not persisted); `src/app/authSync.js` + `AuthBootstrap.jsx` mounted in `providers.jsx` (mock mode → `guest`, Supabase never touched; `SIGNED_OUT` → `queryClient.clear()`; `SIGNED_IN` → refetch `qk.me`). **Hooks/guards:** `src/queries/me.js` (useMe, useUpdateMe, useUploadAvatar), `src/app/guards.jsx` (`RequireAuth`, `RequireRole`; spinner while the session or profile loads, 403 screen only once the role is known; admin passes any role check), pure helpers in `src/lib/authGuard.js`. **Errors:** Supabase Auth errors mapped in `src/services/supabase/errors.js` and five rows added to `docs/CONTRACT.md` §11 (note v1.2.1, additive): invalid credentials / email not confirmed / weak password → `validation`, already registered → `conflict`, rate limit / 429 → `rate_limited`.
- Files: new `src/services/supabase/auth.js`, `me.js` (+ tests), `src/stores/auth.js`, `src/app/authSync.js` (+ test), `AuthBootstrap.jsx`, `guards.jsx`, `src/queries/me.js`, `src/lib/authGuard.js` (+ test); modified `src/services/supabase/index.js`, `errors.js`, `errors.test.js`, `src/app/providers.jsx`, `docs/CONTRACT.md`, `docs/PROGRESS.md`.
- How verified: `npm run check` green (guards OK, 22 test files / 194 tests, build OK) with no env vars. The services are tested against a fake Supabase client; nothing was run against `tibu-dev` and no test user was created.
- Not done / left out (why): No login pages or `/login`, `/auth/callback`, `/reset-password` routes (B3.1). `RequireAuth`/`RequireRole` are not mounted on any route yet. The guard components and `AuthBootstrap` have no render tests (no jsdom or Testing Library in the project); their logic lives in tested plain functions. Not exercised on a real project: sign-up, confirmation e-mail, sign-in, avatar upload against the real `avatars` bucket. Main chunk 382 kB (111 kB gzip); image compression loads lazily as its own 52 kB chunk on avatar upload; the remaining ~16 kB over the pre-A3.1 365 kB is the auth code itself, to be revisited in A5.4. A sign-up for an existing e-mail with confirmation on returns a user with no identities, which `signUp` turns into the `conflict` error.
- Next step (exact): by hand on `tibu-dev`: create a test user, sign in from the browser console with the exported `signIn`, confirm the store flips to `authenticated` and `getMe()` returns the profile; then A3.2 (login gate + reveal contact) and B3.1 (auth pages).
- Gotchas for the next person: `onAuthChange` callbacks receive `(session, event)`; keep them synchronous. Add `/auth/callback` and `/reset-password` routes in B3.1 (the existing `https://tibu-app.pages.dev/**` redirect wildcard already covers both URLs).

### 2026-10-10 · Audit fixes: details mapping, OG robustness, stale URL · dk · Claude Code (Sonnet 5.5)
- Done: **Details:** copied `details.js` + `details.test.js` from the update pack into `src/services/supabase/`; `mappers.js` now uses `detailsFromDb()` instead of the inline `mapDetails` (seed-form `{"shelf_life":"10 days"}` → `[{label:"Shelf life", value:"10 days"}]`; empty-value rows dropped). **OG functions:** `withOgTags` sets `Content-Type: text/html; charset=utf-8`; `functions/p/[id].ts` and `functions/b/[slug].ts` fetch the shell inside the try/catch, and any failure falls back to the shell, then a second `ASSETS.fetch("/")`, then a minimal 200 page (new `fallbackShell` in `og.ts`) — the functions cannot throw a 5xx. **Docs:** live-site URL `tibu-v1.pages.dev` → `tibu-app.pages.dev` in the "Now" section, the handoff (Site URL and `VITE_SITE_URL` lines), `og-testing.md` and the Week 2–5 prompts; "Now" updated (Blocked resolved, hosting, client payment).
- Files: new `src/services/supabase/details.js`, `details.test.js`; modified `src/services/supabase/mappers.js`, `mappers.test.js`, `functions/_lib/og.ts`, `og.test.ts`, `functions/p/[id].ts`, `functions/b/[slug].ts`, `docs/PROGRESS.md`, `docs/build/PARTNER_HANDOFF_2026-10-07.md`, `docs/build/og-testing.md`, `docs/build/prompts/WEEK2…WEEK5_DEEP_DIVE.md`.
- How verified: `npm run check` and `node scripts/check-guards.mjs` (see the session output). The charset header test uses a pass-through fake `HTMLRewriter`, so the real Workers runtime was not exercised.
- Not done / left out (why): `patches/0003` not applied (it would duplicate the catalog adapter). Old-project history lines (log entries, handoff §"Why" and the `tibu-v1` project-name line) and `og.ts`/`og.test.ts` URL fixtures left as they were on purpose. The "Needs you" line still lists recreating the Pages project. `SearchPage.jsx` is still over the 250-line limit (guard warning). Nothing committed or pushed; the new headers have not been checked against the live site.
- Next step (exact): redeploy, then `curl -sI -A "WhatsApp/2.23.20" https://tibu-app.pages.dev/p/<seeded-uuid>` and confirm `content-type: text/html; charset=utf-8`; then paste a product link into WhatsApp on a real phone.
- Gotchas for the next person: `mapDetails` no longer exists; use `detailsFromDb` / `detailsToDb` from `src/services/supabase/details.js`.

### 2026-10-10 · B2.6 — Location chip, area picker & first-visit prompt verification · dk · Antigravity (Gemini Flash)
- Done: **Verified** Task B2.6 (Location chip, area picker and first-visit prompt, using location store A2.2). Verified all requirements against codebase and browser runtime (390×844): `LocationChip.jsx` (MapPin, truncated label, fallback to "Set location", opens `AreaPickerSheet`), `AreaPickerSheet.jsx` (calls `requestGps`, inline GPS error handling with sheet staying open, filterable `MUMBAI_AREAS` list, selection updating location and closing sheet, "Clear location"), `LocationPrompt.jsx` (first-visit card on Home when `asked === false` under hero, "See what's near you", "Use my location", "Choose area", dismiss X, calls `markAsked`, never auto-triggers browser geolocation prompt on load), and header integrations on `HomeHeader`, `SearchPage`, and `CategoryPage`. Added `.wrangler` to `eslint.config.js` `globalIgnores`.
- Files: updated `eslint.config.js`, `docs/PROGRESS.md`.
- How verified:
  1. `npx vitest run src/stores/location.test.js` — **20/20 store tests passed**.
  2. Full test suite: `npx vitest run` — **17 test files / 150 tests passed**.
  3. Full check: `npm run check` — guards OK (165 source files), ESLint 0 errors, Vitest 150/150 passed, Vite build OK (289 modules).
  4. Browser automated flow on `http://localhost:5173` (390×844): first-visit prompt card display, dismiss action, area search and selection ("Bandra West"), distance display update on feeds, sheet clear location, and header chips verified on Home, Search, and Category pages.
- Not done / left out (why): Live GPS permission granted test depends on device hardware; simulated denial error path verified inline.
- Next step: A2.1 / A1.6 — Cloudflare Pages setup & preview/prod environment runtime variables, or F5 hosted DB checks.

### 2026-10-09 · A2.3 — OG functions verification & local runtime test · dk · Antigravity (Claude Sonnet / Gemini Flash)
- Done: **Verified** Task A2.3 (per-item Open Graph tags via Cloudflare Pages Functions, DECISIONS D19) both via test suite and locally with `wrangler pages dev` against live Supabase dev data using public anon key. All three function files (`functions/_lib/og.ts`, `functions/p/[id].ts`, `functions/b/[slug].ts`) and test suites are working as expected.
- Files: updated `docs/PROGRESS.md`.
- How verified:
  1. `npx vitest run functions` — **15/15 OG tests passed**.
  2. Full `npm run check` — guards OK (165 source files), ESLint 0 errors, **17 test files / 150 tests**, build OK (289 modules).
  3. **Local wrangler runtime test (`npx wrangler@4 pages dev dist`)**:
     - Product route (`/p/5d3996cc-bfb5-4251-a6a4-8929da0fdfe4`): Verified `og:title` ("Chocolate Truffle Cake"), `og:description` ("₹550 · Mithai & More, Andheri West"), `og:type` ("product"), `og:image`, `twitter:card` ("summary_large_image"), and `og:url`.
     - Business route (`/b/ammas-kitchen`): Verified `og:title` ("Amma's Kitchen"), `og:description` ("Home Food · Bandra West ..."), `og:type` ("website"), banner `og:image`, `twitter:card`.
     - Negative test (`/p/not-a-valid-uuid`): Returned HTTP 200 with default app shell (clean fallback).
- Not done / left out (why): Live Cloudflare Pages production deployment & real WhatsApp chat paste verification will occur once the Pages project is connected/recreated in Cloudflare dashboard (A1.6) with the 3 runtime variables set (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL`).
- Next step: A1.6 — recreate Cloudflare Pages project via Connect to Git (`daiwangk/TIBU_V1`), set the three Functions runtime variables, then test on live URL.

### 2026-10-09 · A2.1 — Preview audit + contract shape tests + local UI verification · dk · Antigravity (Gemini Flash / Claude Sonnet)
- Done: **Audit** of every rebuilt route against `docs/CONTRACT.md §1–§3` and `docs/build/09_SQL_RECONCILIATION.md §3` using live Supabase seed data (anon key + service key). Checked: paise conversion (35 000 paise → ₹350 ✓), picsum images load / no emoji placeholders ✓, ratings and review counts non-zero on all 10 approved businesses ✓, distances `null` before area selection and ordered correctly after ✓, pending (`Sugar & Spice`) and rejected (`Roti Republic`) businesses absent from all public feeds and `getBusinessBySlug` ✓, no phone/whatsapp in any public response ✓, `available_today=true` filter returns only the 9 flagged products ✓. **No shape mismatches found** — `mappers.js` and `catalog.js` are already correct. **Contract shape unit tests added** to `src/services/supabase/mappers.test.js` (6 new tests, `CONTRACT.md §2–§3 exact shape coverage`): exact key-set assertions (via `Object.keys().sort()`) for `Category`, `BusinessSummary`, `ProductSummary` (both `mapProductSummaryFromSearch` and `mapProductSummaryNested`), `BusinessDetail`, `ProductDetail`, and `Review`. Verified local UI preview on `http://localhost:5173/` at 390×844 viewport for header, tabs, hero, cards, badges, and layout styling.
- Files: modified `src/services/supabase/mappers.test.js` (added `mapBusinessSummary`, `mapCategory`, `mapProductSummaryNested`, `mapReview` imports + 6 shape tests), modified `docs/PROGRESS.md`.
- How verified: `npm run check` green — guards OK (165 source files, 3 legacy allowlist entries), ESLint 0 errors, **17 test files / 150 tests passed** (mappers.test.js 13 → 19), build OK (289 modules, 712 ms). Local dev server preview verified visually on `http://localhost:5173/`.
- Not done / left out (why): Preview URL `https://0475253c.tibu-app.pages.dev` is protected by Cloudflare Access (302 → login) — UI not verified in a browser; all assertions were made against the API directly. The one pre-existing WARN (`SearchPage.jsx` 321 lines) is unchanged — tracked separately (B2.3 cleanup).
- Next step: R1 part 1 (push migrations 0008/0009 + 0010 to `tibu-dev`), then recreate the Cloudflare Pages project (A1.6/A2.1), set the three Functions runtime variables, real-phone rehearsal.

### 2026-10-07 · Home hero picture + lazy routes (A5.4 early) · dk · Claude Code (Sonnet 5.5)
- Done: **Client change:** the big purple “Discover homegrown businesses near you” heading in the Home hero is replaced by a picture — the Tibu logo for now. The hero is still a lavender card: a white rounded picture tile (16:9, `object-contain`), the one-line subtitle, then the search field. The heading text stays as a screen-reader-only `<h1>` (accessibility and search engines). No landing page was added: Home already opens on this hero, guests browse freely (SOW), and a splash would only add a tap. **To swap in the client's photo:** overwrite `src/assets/home-hero.png` and change `object-contain` to `object-cover` in `src/pages/home/HomeHero.jsx` (comment there says so). **Lazy routes (A5.4, pulled forward):** every page except Home is now a `React.lazy` chunk, with one `Suspense` spinner inside `AppShell` (the bottom nav stays visible); a `vite:preloadError` handler in `main.jsx` reloads once if a tab open across a deploy asks for a chunk that no longer exists (sessionStorage guard against loops; `ErrorBoundary` is the second safety net). Main bundle 554 kB → 366 kB (gzip 154 → 106 kB); the >500 kB build warning is gone.
- Files: modified `src/App.jsx`, `src/layouts/AppShell.jsx`, `src/main.jsx`, `src/pages/home/HomeHero.jsx`; new `src/assets/home-hero.png` (copy of the logo; the unused template `src/assets/hero.png` is untouched).
- How verified: `npm run check` green (guards OK, 144 tests, build OK, no size warning). Headless Chrome (mock): B2.6 flow 27/27, R2 48/48, review fixes 25/25, QA sweep 0 blockers/majors with the same single legacy minor, 62 internal links and the bottom-nav/Profile routes still resolve; 360 px screenshot of Home checked.
- Not done / left out (why): The final hero photo comes from the client. The 16:9 tile is a first guess; a portrait photo may want a different aspect. The chunk-reload path was reasoned about, not exercised against a real redeploy — watch for it on the first deploy after this one. The header also shows the small logo, so the logo appears twice on Home until the photo replaces the hero picture.
- Next step (exact): Push; after the Pages project exists, open Home on a phone and look at the first load (should be faster) and one lazy page (brief spinner).
- Gotchas for the next person: New pages should be added as `lazy(() => import(...))` in `App.jsx`, not imported at the top. A page that must never flash a spinner (Home) is the only static import.

### 2026-10-06 · Review fixes · dk · Claude Code (Sonnet 5.5)
- Done: Three read-only reviews (data layer, UI, infrastructure/docs), each finding checked against the code, then fixed. **Bugs fixed:** `normalizeIndianMobile` rejected every valid 10-digit mobile starting with 91 (Call/WhatsApp links would have been `null` for those sellers); a slow GPS answer could overwrite an area the user picked afterwards (version counter in the location store); Search “Newest” returned nearest-first once a location was set (now an explicit `newest`, with “Recommended” as the default); typing race on Search could drop the last keystroke; `?price=abc-def` put NaN into the query; Category accepted any `?sub=`, any sort for the wrong tab, and `sort=distance` with no location (select stuck disabled); infinite-search and one-shot-search caches could collide (key now ends in `'infinite'`); raw Postgres text (constraint/column names) could reach the user via validation/conflict messages; any `TypeError` was reported as “You're offline”; expired JWT mapped to `unknown`; rate-limited/forbidden/validation errors were retried; `formatDistance` returned “1000 m” and “0 m”; the mock sorted distance without a location while SQL falls back to newest; blank `q`/empty category behaved differently in the two adapters; sticky filter/tab bars overlapped the page header (header is now a fixed 56 px); the Help form claimed it had received a message it never sent; Business page never showed a distance (now uses the stored location). **Hardening:** persisted location is validated on load (`merge` + `version`) and GPS fixes are rounded to 3 decimals; the Supabase client refuses a privileged key in `VITE_SUPABASE_ANON_KEY`, and `check-guards` rejects one in any `VITE_*` build variable; guards now also catch `@supabase/supabase-js`/dynamic adapter imports (and in `queries`, `stores`, `lib`, `layouts`), any file-level `eslint-disable`, and warn on components over 250 lines; `layouts/` converted from inline styles to Tailwind and its stale route prefixes dropped, with the 76 px bottom padding only where the nav shows; sheets/dialogs have an accessible name and focus the panel instead of the first button; one `<h1>` per page, labelled search input, 44 px “Read more”, focus rings, `sr-only` review stars, alt/aspect prop fix on `BusinessCard`; idle Search makes no requests; recent searches are saved on Enter or when a result is opened (not every typed prefix); OG slug check matches the database, single 5-minute cache, no stale ETag; seed script compares the exact host; `npm audit fix` (0 vulnerabilities); `.node-version` 22 + `engines`; CI gets `permissions: contents: read` and an advisory audit step; keep-alive skips cleanly until its secrets exist; `public/_headers` with nosniff, frame and referrer policies; stale `01_DECISIONS.md` / `04_SERVICE_CONTRACT.md` marked superseded; CONTRACT/typedef gain the `system` notification type.
- Files: `src/lib/{whatsapp,format}.js`, `src/stores/location.js`, `src/queries/catalog.js`, `src/services/{mock/index,supabase/{client,errors,catalog}}.js`, `src/app/providers.jsx`, `src/layouts/*`, `src/components/{ui/{Sheet,Dialog,Chip,PageHeader},AreaPickerSheet,ProductCard,BusinessCard,ImageGallery}.jsx`, `src/pages/{search,category,business,product,static}/*`, `functions/_lib/og.ts`, `scripts/{check-guards,seed-dev}.mjs`, `.github/workflows/*`, `.node-version`, `package.json`/lock, `public/_headers`, docs; new `supabase/migrations/20261006000010_search_stable_order.sql`, tests for each fix.
- How verified: `npm run check` green (guards OK, 165 source files; ESLint 0 errors; 17 test files / 144 tests; build OK; `npm audit --omit=dev` 0). Headless Chrome (mock data): the earlier suites still pass (B2.6 flow 27/27, R2 48/48, QA sweep 0 blockers/majors, same single legacy minor) plus 25 new checks on the fixes above.
- Not done / left out (why): **SQL not run** — `20261006000010_search_stable_order.sql` only appends `b.id` / `p.id` to the ORDER BY of the two search functions (same signatures; `CREATE OR REPLACE`); apply it to `tibu-dev` with `db push` after 0008/0009. **Review findings parked for you to decide (database/security, need the SQL test suite, not changed):** enquiry rate limit can be bypassed by inserting `enquiry_messages` directly; D38 location rounding is client-side only (anon can read exact `lat/lng/address_text` of approved businesses); `send_enquiry` / `reveal_contact` don't check that `p_product` belongs to `p_business` and `my_enquiries` can leak an unapproved product's name; `products.details` has no CHECK (≤12 rows, label ≤40, value ≤200); `submit_business_for_review` accepts empty strings; search `ILIKE` is unindexed on description / category and `%`/`_` aren't escaped; `supabase/config.toml` (local only) has confirmations off, port 3000 and a missing `seed.sql`. **Other parked items:** `onAuthChange` is `async` in both adapters and the query cache isn't cleared on sign-out (do both in A3.1); Back button doesn't close a sheet; focus is lost after the first-visit card disappears; Category and Search price bands are defined twice with different encodings; `CategoryChips` only used by the gallery; `SearchPage.jsx` is 321 lines (guard warns); no CSP, `robots.txt`, manifest or default OG tags; hosted-DB SQL tests aren't in CI.
- Next step (exact): Push, then R1 part 1 + migration 0010 on `tibu-dev`, recreate the Cloudflare project (A1.6/A2.1), set the three Functions variables, real-phone rehearsal.
- Gotchas for the next person: Any new query whose view renders its own error UI sets `meta: { silent: true }`. Sort `''` means “recommended” (nearest when a location is set, otherwise newest); `newest` is explicit. `PageHeader` is a fixed `h-14`: sticky bars below it use `top-14`.

### 2026-10-06 · A2.3 · dk · Claude Code (Sonnet 5.5)
- Done: Per-item Open Graph tags for WhatsApp link previews (DECISIONS D19) as Cloudflare Pages Functions. `functions/p/[id].ts` and `functions/b/[slug].ts` validate the id (uuid) / slug (kebab, 2–80), read the item over PostgREST with the anon key (products: `is_active` and `businesses.status=approved`; businesses: `status=approved`; no `business_contacts`), then rewrite the app shell with HTMLRewriter: `<title>`, `description`, `og:type/site_name/title/description/url/image`, `twitter:card=summary_large_image` (+ title/description/image), replacing any static tags. Product card: title = name, description = `₹1,250 · Seller, Locality`, image = first photo (seller logo as fallback). Business card: name, `Category · Locality — about`, banner (logo fallback). `og:url` = `SITE_URL` + path (query dropped). Enriched responses carry `Cache-Control: public, max-age=300`. Any bad id, unknown/unapproved item, Supabase error or 4 s timeout returns the untouched `index.html` with a 200 — never a 5xx. Shared helpers in `functions/_lib/og.ts`. `docs/build/og-testing.md` covers unit tests, local run, preview/production curls and WhatsApp.
- Files: new `functions/_lib/og.ts`, `functions/_lib/og.test.ts`, `functions/p/[id].ts`, `functions/b/[slug].ts`, `docs/build/og-testing.md`; modified `.gitignore` (`.wrangler`), `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified: 15 new unit tests pass (`npx vitest run functions`); `npm run check` green. Ran the real functions with `wrangler pages dev dist` against a stand-in PostgREST server: product and business returned the expected tags, `<`, `&` and quotes in a product name were escaped, `₹1,250` formatted, `og:url` from `SITE_URL`, `Cache-Control: public, max-age=300` set; `/p/not-a-uuid`, `/b/BAD_slug` made no database call; unknown product, unknown business and a database 500 all returned the plain shell with 200; the stand-in log showed the anon key and the expected filters.
- Not done / left out (why): **No real Cloudflare deployment and no WhatsApp test** — they need the Pages project recreated via Connect to Git (A1.6/A2.1) plus `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SITE_URL` as runtime variables, then a check on an Android phone and an iPhone (`og-testing.md` §3–4). No default share image: items with no photo and no logo get text-only cards. `functions/` has no type-check step (no Cloudflare types dependency without your OK); wrangler bundles the TypeScript.
- Next step (exact): After the Cloudflare project exists: set the three variables (Production and Preview), deploy, run the two curls in `og-testing.md` §3, then paste a product link into WhatsApp on both phones (use `?v=2` to bypass the cache).
- Gotchas for the next person: `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SITE_URL` are runtime variables, separate from the `VITE_*` build variables. The anon key must stay the anon/publishable key. WhatsApp caches per URL — append `?v=N` when re-testing.

### 2026-10-06 · R2 · dk · Claude Code (Sonnet 5.5)
- Done: Rev2 fields on the public pages (UI only; data was already in contract v1.2). New `src/components/FulfilmentInfo.jsx`: Delivery and/or Pick-up pills (only what is available) plus “Delivers in <time>” when delivery is on and a time is set; neither → “Ask the seller about delivery”. Product page: FulfilmentInfo with the effective product values under the price; rating line (stars + “(320 reviews)” / “(no reviews yet)”) linking to `/b/<slug>?tab=reviews`; seller block now shows name, locality and distance only; Details section rebuilt as a two-column `<dl>` (wraps instead of truncating; hidden when empty). Business page: “Est. <year>” badge next to the category when set, FulfilmentInfo with the business values (replaces the old Delivery/Pickup badges). FulfilmentInfo added to `/dev/ui` in three states. Mock: the aura-candles vanilla candle carries three D36 detail rows (candles template); every other product keeps no details so the empty case is exercised.
- Files: new `src/components/FulfilmentInfo.jsx`; modified `src/pages/product/{ProductPage,ProductDetailsList}.jsx`, `src/pages/business/BusinessHeader.jsx`, `src/pages/dev/UiGalleryPage.jsx`, `src/services/mock/{fixtures,mock.test}.js`, `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified: `npm run check` green (guards OK, 163 source files; ESLint 0 errors; 15 test files / 116 tests; build OK). Browser run (headless Chrome, mock data) at 360, 390 and 430 px, 48 checks, all passed: the product with an override (delivery off, “Within a week”) shows Pick-up only and no “Delivers in”; a product without an override shows its shop's Delivery + Pick-up; “Est. 2019” on sweet-crumbs and nothing on businesses without a year; “Delivers in Same day” / “1–2 days” on the right businesses and nothing where no time is stated; three detail rows as a `<dl>` and no “Details” heading when empty; rating line links to the reviews tab; no horizontal overflow; gallery shows the three states. Screenshots at 360 px checked.
- Not done / left out (why): Not checked against the Supabase data source — the hosted database still needs R1 part 1 (`db push`). The product page header still says “Tibu” (as built in B1.7).
- Next step (exact): A2.3 OG link previews, then R1 part 1 by you, then A2.1.
- Gotchas for the next person: `FulfilmentInfo` takes the effective values; the product/business fallback (`??`) happens in the adapters, never in the page.

### 2026-10-06 · B2.5 · dk · Claude Code (Sonnet 5.5)
- Done: QA sweep with no code edited during it (headless Chrome over CDP, mobile emulation) on 20 pages × 360×800 / 390×844 / 430×932, then fixes, then a re-run. Report: `docs/build/qa/2026-10-06-b2-5-qa.md`. Result: 0 blockers, 0 majors, 0 horizontal overflow, 0 console errors, 0 broken links (47 internal links opened), BottomNav and the Profile rows for Privacy, Help, Terms and About all navigate. 16 minors (15 touch targets under 44 px, 1 duplicate `<h1>`): 15 fixed — `Chip` (`min-h-11 min-w-11 whitespace-nowrap flex-shrink-0`), `Select` (`min-h-11`), Home logo link (`min-w-11`), first-visit card buttons and “Write a review” (default button size), `PageHeader` `titleAs` so Product and Business pages have one `<h1>`; 1 left (legacy Saved “View All →”, B3.5). Audit bug closure table in `docs/build/07_QA_AND_SIGNOFF.md` §3 filled with evidence — and corrected where the old text overclaimed (see below). Demo script dry-run recorded in the QA report.
- Files: new `docs/build/qa/2026-10-06-b2-5-qa.md`; modified `docs/build/07_QA_AND_SIGNOFF.md`, `src/components/ui/{Chip,Select,PageHeader}.jsx`, `src/pages/home/{HomeHeader,LocationPrompt}.jsx`, `src/pages/business/{BusinessPage,ReviewsTab}.jsx`, `src/pages/product/ProductPage.jsx`, `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified: `npm run check` green (guards OK, 162 source files; ESLint 0 errors; 15 test files / 115 tests; build OK); QA sweep re-run after the fixes shows only the legacy Saved button. Screenshots at 360 px of Home, Category, Business and Product eyeballed.
- Not done / left out (why): **No real-phone rehearsal** (needs the Cloudflare preview over HTTPS) and no WhatsApp preview test (A2.3). Error states and Slow-4G loading were not re-triggered in this sweep. Keyboard-only walkthrough not done. The demo invite (`08` §4) and the client message (`11` §6.1) were not sent — they are yours to send.
- Next step (exact): R1 part 1 (database), then A2.1 / A2.3 / R2, then a real-phone rehearsal of the 15-minute script. Demo gaps today: no real reel in the Videos tab (needs reel links + `REELS=` seed + preview on Supabase), no link-preview card (A2.3), no delivery/Est. year on the pages (R2).
- Gotchas for the next person: Honest corrections to the audit table — console.log (4 left in legacy Saved/ProductCard/Notification), hard-coded Arial (3 legacy files), `minWidth: 260px` (legacy ProductCard), `selectedSellerProduct` (guarded in the legacy page, not eliminated), one mock business id contains a space (`cocoa corner`). Each is tied to the task that removes it.

### 2026-10-06 · R1 (part 2, code + docs) · dk · Claude Code (Sonnet 5.5)
- Done: Contract v1.2 for SOW Rev2, no UI. `docs/CONTRACT.md` is v1.2 (BusinessDetail `deliveryTime` / `establishedYear`; ProductDetail effective `deliveryAvailable` / `pickupAvailable` / `deliveryTime`; DeliveryOverride on MyProduct / ProductInput; BusinessInput fields; push functions; new validation rows). `docs/DECISIONS.md` has D32–D38 verbatim. `AGENTS.md` now points at `docs/Tibu_SoW_Phase1_Rev2.md`, allows TypeScript in `supabase/functions/`, lists `VITE_VAPID_PUBLIC_KEY`, and keeps in-app chat (D34) and push-only-via-the-settings-switch (D33); `.env.example` has `VITE_VAPID_PUBLIC_KEY`. `FUNCTION_NAMES` and `src/services/index.js` gained `savePushSubscription` and `deletePushSubscription`. Mock: fixtures carry Rev2 values (sweet-crumbs, whisk-wonders, aura-candles, crochet-by-sarah) and one product override (`aura-candles-vanilla-soy-candle`: delivery off, “Within a week”); the rest stay null for empty states; push functions throw `unavailable_in_mock`. Supabase adapter: the two selects include the new columns; `mapBusinessDetail` / `mapProductDetail` map them with `??` (false stays false); `src/services/supabase/push.js` implements the two RPCs. Migrations 0008 and 0009 are copied into `supabase/migrations/` unchanged; `docs/kit/rpc-signatures.txt` has the two new functions.
- Files: new `supabase/migrations/20261002000008_rev2_delivery_fields.sql`, `…000009_push_subscriptions.sql`, `src/services/supabase/push.js`, `push.test.js`; modified `docs/CONTRACT.md`, `docs/DECISIONS.md`, `docs/kit/rpc-signatures.txt`, `AGENTS.md`, `.env.example`, `src/services/{contract,index}.js`, `src/services/mock/{fixtures,index,mock.test}.js`, `src/services/supabase/{catalog,catalog.test,index,mappers,mappers.test}.js`.
- How verified: `npm run check` green — guards OK (162 source files), ESLint 0 errors, 15 test files / 115 tests passed (new: SQL tests copied to supabase/tests (not run); mock override vs business values, mapper `??` semantics incl. false, select strings contain the new columns and no `business_contacts`, both push RPCs and their error mapping), build OK. `git grep "Final.pdf" AGENTS.md` is empty; CONTRACT line 1 says v1.2.
- Not done / left out (why): **Part 1 (hosted database) is NOT done** — it needs your Supabase login and the `tibu-dev` link, which I do not have. Until it is done, running the app with `VITE_DATA_SOURCE=supabase` against `tibu-dev` fails on Business and Product pages (the new columns do not exist there yet). Mock (the default, and what Cloudflare preview uses today) is unaffected. The SQL was not re-run here (Docker is not running); it is the kit's tested version. `rpc-signatures.txt` rows for the two new functions were added by hand from the migration — regenerate it from the hosted DB after the push. `details.js` from the kit's reference folder was not adopted: the existing `mapDetails` already reads both array and object forms.
- Next step (exact): Part 1, in this order, from the repo root: `npx supabase projects list` (the LINKED row must be tibu-dev, never tibu-prod) → `npx supabase migration list` (remote shows 0001–0007) → `npx supabase db push` (applies 0008 and 0009 only). Then in the SQL editor run the three checks in `docs/build/prompts/REV2_TASKS.md` R1 (5 rows · 18 tables · 0 rows without RLS), re-run the function-list query (runbook `06` §4) and overwrite `docs/kit/rpc-signatures.txt`. Optionally run `supabase/tests/rev2_0008_test.sql` and `rev2_0009_test.sql`. If `db push` errors on 0009, paste the error to Claude.
- Gotchas for the next person: Do not point a preview or production build at `tibu-dev` with the Supabase source before the push. Product `deliveryOverride` fields are internal to the mock fixtures; the seller shape is `MyProduct.deliveryOverride` (R3).

### 2026-10-06 · B2.6 · dk · Claude Code (Sonnet 5.5)
- Done: Location UX on top of the A2.2 store. `LocationChip` (MapPin + store label or “Set location”, `aria-label` “Change location: <label>”) opens `AreaPickerSheet`: “Use my current location” (spinner; on failure the reason shows inline and the area list keeps working), a filterable list of `MUMBAI_AREAS` (current area marked) and “Clear location” when one is set. Chip added to Home header (replaces the B2.1 slot), to the Search header (row under the input) and to the Category header (`PageHeader` actions). First visit on Home: `LocationPrompt` card under the hero (“See what's near you” · Use my location · Choose area · dismiss) shown only while `asked === false` and no location; it never triggers the browser prompt on load, calls `markAsked()` on dismiss or use, and if GPS fails it opens the picker with the reason. Home follow-up: new conditional `NearYouSection` (businesses, nearest first, default 15 km, hidden when empty), and “Available today” sorts by distance once a location is set. `filterAreas()` added to `lib/geo.js`.
- Files: new `src/components/LocationChip.jsx`, `src/components/AreaPickerSheet.jsx`, `src/pages/home/LocationPrompt.jsx`, `src/pages/home/NearYouSection.jsx`; modified `src/lib/geo.js`, `src/lib/geo.test.js`, `src/pages/home/{HomeHeader,HomePage,AvailableTodaySection,NewBusinessesSection,NewProductsSection}.jsx`, `src/pages/search/SearchPage.jsx`, `src/pages/category/CategoryPage.jsx`, `docs/PROGRESS.md`, `docs/TRACKER.md`.
- How verified: `npm run check` green — guards OK (160 source files, 3 legacy allowlist entries), ESLint 0 errors, 14 test files / 100 tests passed, build OK. Browser run in headless Chrome at 390×844 (mock data, scripted over CDP): fresh visit shows “Set location” + card, no distances; GPS denied → picker opens with “Location permission was denied. You can pick your area below instead.”; typing “andh” narrows the list to Andheri West; picking it updates the chip, shows the Near you row and km distances on cards, and hides the card; reload keeps the area (`tibu.location`, `asked: true`); Search and Category headers show the chip; Category businesses sorted nearest-first (3.8 → 12.8 km) with the Nearest option enabled; Clear location removes label, coordinates and distances; granted GPS (emulated Bandra) sets “Current location” / source `gps`; Dismiss hides the card and stays hidden after reload; chip and dismiss are ≥44 px; no horizontal overflow on Home.
- Not done / left out (why): Not run on a real phone over HTTPS (needs the Cloudflare preview; A1.6). No component tests (no testing-library in the repo, adding it needs an OK) — only `filterAreas` is unit-tested; the UI flow was checked in the browser run above. The Search header chip sits on its own row, which adds about 44 px above the tabs. No profile-location default yet (A3.5 `setFromProfile`).
- Next step (exact): B2.5 — QA pass on the three viewports, fix blockers/majors, fill the audit closure table (`docs/build/07_QA_AND_SIGNOFF.md` §3), rehearse the M1 demo on a real phone.
- Gotchas for the next person: `AreaPickerSheet` content mounts only while open, so its search text and error reset on every open. `LocationPrompt` keeps its own picker instance mounted so the sheet survives the card disappearing after `markAsked()`. Home rows with `radiusKm: null` still get distances because `near` defaults to the stored origin.

### 2026-10-06 · A2.4 · dk · Claude Code (Sonnet 5.5)
- Done: Global error toasts. `QueryCache` and `MutationCache` `onError` in `src/app/providers.jsx` toast via the new `src/lib/errors.js`: `userMessage(error)` (fixed text per CONTRACT §11; `validation`/`conflict` pass their user-safe message through; everything else “Something went wrong”) and `shouldToast(error, meta)`. Toasts for `network`, `rate_limited`, `forbidden`, `business_not_available`, `unknown` and non-AppErrors; none for `auth_required` (login gate) or `not_found`/`validation`/`conflict`/`config`/`unavailable_in_mock`. Toast id = message, so repeated failures don't stack. All catalog hooks set `meta: { silent: true }` because every view that uses them renders `ErrorState`. `ErrorState` takes an optional `error` and shows `message ?? userMessage(error)`; Product, Business and Reviews pass it.
- Files: new `src/lib/errors.js`, `src/lib/errors.test.js`; modified `src/app/providers.jsx`, `src/queries/catalog.js`, `src/components/ui/ErrorState.jsx`, `src/pages/product/ProductPage.jsx`, `src/pages/business/BusinessPage.jsx`, `src/pages/business/ReviewsTab.jsx`, `docs/PROGRESS.md`.
- How verified: `npm run check` green — guards OK, ESLint 0 errors / 1 pre-existing legacy warning, 14 test files / 96 tests passed (22 new for `userMessage` / `shouldToast`), build OK. Not exercised in a browser; toast wiring is straight TanStack `onError`.
- Not done / left out (why): Category, Home and Search keep their own “We couldn't load …” messages (not switched to `userMessage`). No retry-after text for `rate_limited` (contract wording used: “Too many requests — try again in a bit”, not the “in a minute” wording in the task prompt). No mutations exist yet; future mutations that handle their own errors should set `meta: { silent: true }`.
- Next step (exact): Open the PR for `feat/a2-4-errors`; then B2.6 (location chip, area picker, first-visit prompt).
- Gotchas for the next person: A new query whose view renders its own error UI must set `meta: { silent: true }` or users get both. This entry and the B2.4 entry both insert at the top of the Log — expect a trivial conflict on whichever PR merges second.
### 2026-10-06 · B2.4 · dk · Claude Code (Sonnet 5.5)
- Done: Static pages ported to `src/pages/static/` (About, Privacy, Terms, Help on a shared `StaticPage` layout with `PageHeader`; Privacy, Terms and Help carry a visible “Draft — final text from Tibu” note). Help form uses `Textarea` + sonner toast instead of `alert`. New `src/pages/NotFoundPage.jsx` (Home + Search buttons) on route `*`. Deleted the 4 legacy static pages, `legacy/pages/NotFound.jsx`, `ProductsViewAll`, `BusinessViewAll`, `ReelsViewAll`, `Reel`, and the unused services `productService`, `reelService`, `searchService`, `reviewService`, `enquiryService`, `categoryService`, `types`. Also deleted unused `hooks/useSetPage.js`, `legacy/components/SearchBar.jsx` and `legacy/components/Banner.jsx`. Removed `/viewall/*` and `/reel/*` routes, their urlMap keys and the dead `LegacyPage` props. `CategoryShortcuts` moved to `src/components/`; Search now has a search-shaped loading skeleton (`SearchResultsSkeleton`). Mock adapter distance now uses `haversineMeters` from `lib/geo.js`.
- Files: new `src/pages/static/*` (5), `src/pages/NotFoundPage.jsx`, `src/pages/search/SearchResultsSkeleton.jsx`; modified `src/App.jsx`, `src/pages/search/SearchPage.jsx`, `src/pages/search/RecentSearches.jsx`, `src/pages/home/HomePage.jsx`, `src/services/mock/index.js`, `scripts/legacy-allowlist.json`; moved `CategoryShortcuts.jsx`; 19 files deleted.
- How verified: `npm run check` green — guards OK (154 source files, 3 legacy allowlist entries, no stale-allowlist warnings); ESLint clean; 13 test files / 74 tests passed; production build OK. Pages rendered in headless Chrome (`/about`, `/privacy`, `/terms`, `/help`, `/nope`); no true 390 px emulation (headless window min width), so do the phone check in B2.5.
- Not done / left out (why): Still used by legacy `Notification.jsx` and kept: `businessService.js`, `mock/normalize.js`, `hooks/useAsync.js` (go with B5.3). `utils/distance.js` kept (`MOCK_USER_LOCATION` used by normalize, fixtures, mock tests). Legacy `ProductCard`/`BusinessCard`/`ReelCard` kept (Saved, SellerDashboard). Privacy text: dropped the “Addresses you choose to save” and “reels” items (address book and reels were removed in D16); all other text is as before. `BottomNav` still lists `/reel/` and `/viewall/` hidden prefixes (harmless; legacy file).
- Next step (exact): Open the PR for `chore/b2-4-cleanup`; then A2.4 (error toasts) and B2.6 (location chip).
- Gotchas for the next person: Tapping a saved reel in `Saved.jsx` now only logs a `[setPage shim] Unknown page key` warning because the Reel page is gone (Saved is rebuilt in B3.5). Old `/viewall/*` and `/reel/*` links show the 404 page. `Button variant="outline"` (used in SearchPage “Load more”) is not a defined variant and falls back to primary — pre-existing.

### 2026-10-06 · A2.2 · dk · Cursor Grok 4.6
- Done: Gap-close on the persisted location store. `toOrigin` / `selectSearchOrigin` now cache `{ lat, lng }` so object identity only changes when coordinates change (`useSearchOrigin` is a zustand selector, no `useMemo`). Tests stub `localStorage` with `vi.stubGlobal`, assert persist includes `asked`, and assert `clear()` resets coords/label/source while keeping `asked`.
- Files: `src/stores/location.js`, `src/stores/location.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (166 source files, 4 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 13 test files / 74 tests passed; production build OK.
- Not done / left out (why): Pages and catalog hooks untouched (already default `near` only when the caller passes `undefined`). No LocationChip / first-visit sheet (B2.6). No Home “Near you” row (Home follow-up).
- Next step (exact): Merge `feat/a2-2-location-store`; then continue to B2.4 cleanup.
- Gotchas for the next person: `useSearchOrigin()` returns the cached origin object — do not wrap it in a new `{ lat, lng }` in callers. Omit `near` to use the store; pass `near: null` to disable origin. Persist key is `tibu.location` and includes `asked`.

### 2026-10-04 - B2.3 - Antigravity (Gemini 3.1 Pro (High))
- Done: SearchPage at /search with URL-synced q, tab, cat, today, sort, price; 300 ms debounce with replace:true; SearchFiltersSheet; RecentSearches (max 8); infinite "Load more" by offset in pages of 20; Reset filters keeps q; src/Search.jsx deleted.
- Files: created src/pages/search/{SearchPage,SearchFiltersSheet,RecentSearches}.jsx; modified src/App.jsx and docs/PROGRESS.md; deleted src/Search.jsx.
- How verified: npm run check green (70 tests), plus hand checks by me: debounce, Back-button sync, Reset filters keeping q, the three Home deep links, crochet search, distance sort, 390px.
- Not done / left out (why): src/legacy/components/SearchBar.jsx kept because legacy category pages still import it (B2.2/B2.4 remove it).
- Next step (exact): B2.4 cleanup after B2.2 merges; Home follow-up: add NearYouSection and sort Available today by distance when a location is set.
- Gotchas for the next person: omit the `near` key so the stored origin applies; explicit `null` means no origin.

### 2026-10-04 · B2.2 · dk · Antigravity (Claude Sonnet 4.6)
- Done:
  - Built `CategoryPage` at `/category/:slug` replacing 11 legacy category pages.
  - `CategoryPage.jsx`: reads `useParams().slug` → `useCategory(slug)`; unknown slug → `EmptyState` with "Go Home". Drives all filters through URL params (`?sub=`, `?tab=`, `?sort=`, `?today=`, `?price=`) with `replace: true`.
  - `CategoryFilters.jsx`: tab toggle (Products/Businesses), sub-category chips row (All + children, hidden when no children), sort `<Select>` with `distance` disabled + hint when no location origin (`useSearchOrigin()` from A2.2), "Today" `Chip`, price range `<Select>` for products only.
  - On tab change: drops `?sort=` if invalid for new tab; drops `?price=` when switching to Businesses.
  - `ProductGrid.jsx`: `useInfiniteProductSearch` → 2-column grid of `ProductCard variant="grid"`. All 4 states (skeleton/empty/error/data). Load More button hidden when last page < 20 rows.
  - `BusinessList.jsx`: `useInfiniteBusinessSearch` → `BusinessCard` list. Same 4 states + Load More.
  - `CategorySkeleton.jsx`: chips + tab + filters row + 6-card grid skeleton.
  - `src/App.jsx`: replaced 11 legacy `<Route>` elements + 11 imports with single `/category/:slug → <CategoryPage />`. Fixed 3 slug typos in `urlMap` (`resin→resin-art`, `womenfashion→womens-fashion`, `menfashion→mens-fashion`).
  - `src/hooks/useSetPage.js`: same 3 slug fixes in `PAGE_URL_MAP`.
  - `scripts/legacy-allowlist.json`: removed `Desserts.jsx`, `Fashion.jsx`, `Handmade.jsx`.
  - Deleted 11 legacy files: `Candles`, `Crochet`, `Desserts`, `Embroidery`, `Fashion`, `Gifts`, `Handmade`, `Jewellery`, `MenFashion`, `Resin`, `WomenFashion`.
- Files created (5): `src/pages/category/CategoryPage.jsx`, `src/pages/category/CategoryFilters.jsx`, `src/pages/category/ProductGrid.jsx`, `src/pages/category/BusinessList.jsx`, `src/pages/category/CategorySkeleton.jsx`.
- Files modified (3): `src/App.jsx`, `src/hooks/useSetPage.js`, `scripts/legacy-allowlist.json`, `docs/PROGRESS.md`.
- Files deleted (11): `src/Candles.jsx`, `src/Crochet.jsx`, `src/Desserts.jsx`, `src/Embroidery.jsx`, `src/Fashion.jsx`, `src/Gifts.jsx`, `src/Handmade.jsx`, `src/Jewellery.jsx`, `src/MenFashion.jsx`, `src/Resin.jsx`, `src/WomenFashion.jsx`.
- How verified:
  - `npm run check` green: guards OK (164 source files, 4 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 13 test files / 70 tests passed; production build OK (549 kB, smaller than before due to 11 deleted files).
- Not done / left out (why):
  - BottomNav is NOT hidden on `/category/` — it is a hub/discovery page, not a detail page; BottomNav stays visible by design.
  - No browser-level UI check run (localhost dev server running on port 5174).
- Next step (exact): B2.3 (Search page `/search`).
- Gotchas for the next person:
  - `?sort=` is omitted from search params when absent; the hooks default to `distance` if origin is set, else `newest`.
  - Old bookmarks to `/category/resin`, `/category/women-fashion`, `/category/men-fashion` will show the NotFound EmptyState since those aren't valid DB slugs. No redirect added (MVP scope).
  - `availableToday: false` is always passed explicitly (not omitted) per CONTRACT §3 note that SQL treats `null` as "only available today".

### 2026-10-04 · A2.2 · Antigravity (Gemini 3.1 Pro (High))
- Done:
  - Created `src/stores/location.js` using zustand and persist middleware for `tibu.location`.
  - Added store actions `requestGps()`, `setArea()`, `setFromProfile()`, `clear()`, and `markAsked()`.
  - Implemented `useSearchOrigin()` to return memoized `{ lat, lng }` coordinates.
  - Implemented a `guardedStorage` mechanism to prevent errors when `localStorage` is unavailable in the Node environment (vitest).
  - Modified `src/queries/catalog.js` search hooks (`useBusinessSearch`, `useProductSearch`, `useInfiniteBusinessSearch`, `useInfiniteProductSearch`) and detail hooks (`useBusiness`, `useProduct`) to use `useSearchOrigin()` as the default `near` argument when not explicitly provided.
  - Added test suite `src/stores/location.test.js` validating pure function `toOrigin` and store actions without browser dependencies.
- Files created (2): `src/stores/location.js`, `src/stores/location.test.js`.
- Files modified (2): `src/queries/catalog.js`, `docs/PROGRESS.md`.
- How verified:
  - `npm run check` green: guards OK (170 source files, 7 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 70/70 tests pass; production build OK.
- Not done / left out (why):
  - "Near you" section in Home and LocationChip not modified as per constraints ("Nothing in pages or legacy").
- Next step (exact): B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - `useBusiness` and `useProduct` pass `near: undefined` intentionally when the caller leaves it blank, which allows the query hook to substitute `useSearchOrigin()`. An explicit `null` overrides the origin.

### 2026-10-04 · A2.1 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Verified the Supabase adapter locally (`VITE_DATA_SOURCE=supabase`, `localhost:5174`) against tibu-dev.
  - Checked `/p/:id` (₹350, image, no phone) and `/b/:slug` (products, reviews, `?tab=reviews`), plus pending, rejected, and nonexistent slugs → not-found.
  - No mapper changes needed. `npm run check` green.
- Files created: —
- Files modified (1): `docs/PROGRESS.md`.
- Files deleted: —
- How verified:
  - `npm run check` green (guards OK, lint 0 errors, 12 test files / 61 tests passed, build OK).
  - Verified local dev server connected to tibu-dev database.
- Not done / left out (why):
  - Home, Search, and Category (still legacy until B2.1–B2.3).
  - Distance check waits for A2.2 (no location store yet).
  - Preview on Cloudflare: A1.6 is open; the Pages project was created via "source repo import" (`Thipak3/tibu-v1`, `tibu-v12`), so it never builds `daiwangk/TIBU_V1`.
- Next step (exact): Recreate the Pages project through Connect to Git on `daiwangk/TIBU_V1` (Daiwang may need to approve the Cloudflare GitHub app), then set Preview env vars and re-check `/p/<uuid>` on a phone. Next feature task is B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Vite bakes env vars in at build time, so redeploy after changing them.
  - The two Supabase variable names must match the code exactly (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

### 2026-10-03 · B2.1 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Rebuilt Home screen (`src/pages/home/HomePage.jsx`) per AGENTS.md, CONTRACT §2–§3, Feature Spec F3, and design system.
  - Implemented `HomeHeader`: brand `Logo` on the left, empty location slot reserved for B2.6 (`<LocationChip />`), and notifications bell icon linking to `/notifications` with 44px touch target.
  - Implemented `HomeHero`: lavender card (`bg-lavender rounded-card-lg`) with brand line in `font-heading font-extrabold text-ink`, subtitle in `text-body`, and search field. Empty-field tap/click navigates to `/search`; form submission navigates to `/search?q=<text>`. Keyboard focus does not trigger navigation (WCAG 3.2.1).
  - Implemented `CategoryShortcuts`: loads top-level categories via `useCategories()`, renders 4-color cycling pastel round tiles (`bg-lavender`, `bg-blush`, `bg-lime`, `bg-mint`) with `getCategoryIcon()` Lucide icons, pulsing circular skeletons when loading, and error retry state.
  - Implemented 3 discovery sections with `SectionHeader` + `HorizontalScroller`:
    - "New businesses" via `useBusinessSearch({ sort: 'newest', limit: 8, radiusKm: null })` with `BusinessRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "New products" via `useProductSearch({ sort: 'newest', limit: 8, radiusKm: null })` with `ProductRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "Available today" via `useProductSearch({ availableToday: true, sort: 'newest', limit: 8, radiusKm: null })` with `ProductRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "Near you" deferred with TODO comment until location store (`useSearchOrigin`) is added in A2.2.
  - Added `min-w-0 w-full` to `HorizontalScroller` and constrained `HomePage` with `overflow-x-hidden` to guarantee zero page-level horizontal overflow at 360, 390, and 430 px viewports.
  - Updated `src/components/SectionHeader.jsx` to satisfy the ≥44px touch-target rule with `min-h-11 px-2 -mr-2`.
  - Updated `src/App.jsx`: route `/` now renders `<HomePage />` directly without `LegacyPage`.
  - Deleted legacy `src/Home.jsx` and removed it from `scripts/legacy-allowlist.json`.
- Files created (9): `src/pages/home/HomePage.jsx`, `src/pages/home/HomeHeader.jsx`, `src/pages/home/HomeHero.jsx`, `src/pages/home/CategoryShortcuts.jsx`, `src/pages/home/HomeSection.jsx`, `src/pages/home/ProductRowSkeleton.jsx`, `src/pages/home/BusinessRowSkeleton.jsx`, `src/pages/home/NewBusinessesSection.jsx`, `src/pages/home/NewProductsSection.jsx`, `src/pages/home/AvailableTodaySection.jsx`.
- Files modified (4): `src/App.jsx`, `scripts/legacy-allowlist.json`, `src/components/HorizontalScroller.jsx`, `src/components/SectionHeader.jsx`, `docs/PROGRESS.md`.
- Files deleted (1): `src/Home.jsx`.
- How verified:
  - `npm run check` green: guards OK (168 source files, 7 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 61/61 Vitest tests pass; production build OK.
  - Headless Chrome CDP device emulation test verified at 360px, 390px, and 430px: `hasHorizontalScroll: false` and `scrollWidth === innerWidth` across all widths.
- Not done / left out (why):
  - "Near you" section skipped until location store is built in A2.2.
  - `<LocationChip />` in header omitted until B2.6.
- Next step (exact): B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Skeletons and cards in horizontal scrollers require `min-w-0 w-full` on flex parent containers to prevent expanding the 480px AppShell column on narrow viewports.

### 2026-10-03 · B1.8 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Built new Business page loaded from URL (`/b/:slug`) per CONTRACT §3, Feature Spec F8, and design system.
  - Implemented 4 states: `BusinessSkeleton` matching layout, `EmptyState` when not found with Home redirect, `ErrorState` with retry, and full data view.
  - Header: banner image (16:9 with gradient) falling back to `ImagePlaceholder`, overlapping 64px `Avatar` logo, name, category, locality + distance, rating, delivery/pickup badges, description with 4-line clamp toggle.
  - Sticky tabs (Products | Videos | Reviews) synced with URL query param `?tab=`, replacing history entry on change.
  - Products tab: 2-column grid of `ProductCard variant="grid"`, `EmptyState` when no products.
  - Videos tab: Instagram reel embeds via new `ReelEmbed` component using `reelEmbedUrl()` fallback, `EmptyState` when empty.
  - Reviews tab: aggregate rating summary, "Write a review" action with toast, review list with star ratings and relative dates via `formatRelativeTime`, `EmptyState` when empty.
  - Added sticky bottom bar with `ContactButtons` (WhatsApp/Call toasts) and header `SaveButton` + `Share` action.
  - Updated `App.jsx`: route `/b/:slug` -> `BusinessPage`, removed `/business/view` and `/business/:businessId`, updated `LegacyPage` shim for `setSelectedBusiness` and `setPage('business')`.
  - Deleted legacy `src/Business.jsx`.
- Files created (7): `src/components/ReelEmbed.jsx`, `src/pages/business/BusinessPage.jsx`, `src/pages/business/BusinessHeader.jsx`, `src/pages/business/BusinessSkeleton.jsx`, `src/pages/business/ProductsTab.jsx`, `src/pages/business/VideosTab.jsx`, `src/pages/business/ReviewsTab.jsx`.
- Files modified (2): `src/App.jsx`, `docs/PROGRESS.md`.
- Files deleted (1): `src/Business.jsx`.
- How verified:
  - `npm run check` green (guards OK with 159 files, 8 legacy allowlist entries; lint 0 errors / 1 pre-existing legacy warning; 61/61 tests pass; production build OK).
  - Verified `/b/:slug` route and legacy shim redirect normalisation for `whisk-wonders` and `cocoa corner`.
- Not done / left out (why):
  - Real contact reveal / enquiry flow deferred to B3.3.
  - Real saving persistence deferred to B3.5.
  - Real review submission deferred to B5.2.
  - `near` location in `useBusiness` omitted until location store is built in A2.2.
- Next step (exact): B2.1 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Tabs are synced with `?tab=` and replace history on change.
  - Legacy business IDs from mock data equal the URL slugs after lowercasing and URL-encoding (e.g. `cocoa%20corner`).

### 2026-10-02 · B1.7 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Built new Product page loaded from URL (`/p/:productId`) per DECISIONS D7, CONTRACT §3, and mockup.
  - Implemented 4 states: `ProductSkeleton` matching layout, `EmptyState` when not found with Home redirect, `ErrorState` with retry, and full data view.
  - Added `ImageGallery` with horizontal scroll-snap and dot indicators, falling back to `ImagePlaceholder`.
  - Added `ContactButtons` with WhatsApp (primary) and Call (secondary) wired to sonner toast until B3.3.
  - Added `SaveButton` with heart icon wired to sonner toast until B3.5.
  - Integrated with query & provider infrastructure: `src/queries/keys.js` (CONTRACT §8), `src/queries/catalog.js` (`useProduct`), and `src/app/providers.jsx` (`QueryClientProvider` + `Toaster`).
  - Updated `App.jsx`: added route `/p/:productId`, removed `/product/view` and `/product/:productId`, updated `LegacyPage` shim so `setSelectedProduct` ref + `setPage('product')` redirect to `/p/${ref.current.id}`.
  - Added `'/p/'` and `'/b/'` to `HIDDEN_PREFIXES` in `src/layouts/BottomNav.jsx`.
  - Deleted legacy `src/Product.jsx` per the strangler rule.
- Files created (9): `src/queries/keys.js`, `src/queries/catalog.js`, `src/app/providers.jsx`, `src/components/ImageGallery.jsx`, `src/components/ContactButtons.jsx`, `src/components/SaveButton.jsx`, `src/pages/product/ProductPage.jsx`, `src/pages/product/ProductDetailsList.jsx`, `src/pages/product/ProductSkeleton.jsx`.
- Files modified (5): `package.json`, `package-lock.json`, `src/main.jsx`, `src/App.jsx`, `src/layouts/BottomNav.jsx`.
- Files deleted (1): `src/Product.jsx`.
- How verified:
  - `npm run check` exits 0 (guards OK with 133 source files, 8 legacy allowlist entries; lint 0 errors / 1 pre-existing legacy warning; 15/15 tests pass; build OK).
  - Browser verification at 390×844: validated loading & data view on `/p/crochet-by-sarah-crochet-flowers`, Save toast ("Saving arrives with accounts"), WhatsApp/Call toasts ("Contact opens after login — coming soon"), business card link to `/b/crochet-by-sarah`, EmptyState on `/p/nonexistent-item-999` with "Back to Home" navigation, and confirmed BottomNav is hidden.
- Not done / left out (why):
  - Real contact reveal / enquiry flow deferred to B3.3.
  - Real saving persistence deferred to B3.5.
  - `near` location store in `useProduct` omitted per task step 8 (location store scheduled for A2.2).
- Next step (exact): B1.8 (Business page `/b/:slug`).
- Gotchas for the next person:
  - `useProduct(id)` does not pass `near` yet; will receive `near` once the location store is built in A2.2.

### 2026-10-02 · A1.5 · Codex
- Done:
  - Supabase client, error mapping, mappers, and catalog adapter: `searchBusinesses`, `searchProducts`, `getBusinessBySlug`, `getProductById`, `listReviews`, `listCategories`, and `getCategory`.
  - Fixed invalid IDs so `getProductById` returns `null` and `listReviews` returns `[]` for non-UUID IDs without making a network call.
- Files: `src/services/supabase/*` (client, errors, mappers, catalog, index, and tests); `docs/PROGRESS.md` for this log only. No other files.
- How verified: hand-tested on `tibu-dev` with `VITE_DATA_SOURCE=supabase` from the browser console: prices are rupees; pending/rejected businesses and their products return `null`; `handmade` returns only crochet/embroidery/resin-art/candles; limits cap correctly; a privacy regex on `BusinessDetail` finds no `phone`/`whatsapp`/`userId`/`contacts` keys; reviews return `isMine: false`. `npm run check` is green (60/60 tests) with no env vars.
- Not done / left out (why): Cloudflare/OG work, auth and other adapter functions (still `AppError('config')` stubs), and any missing PROGRESS entries from earlier sessions are outside A1.5.
- Next step (exact): Codex S9 review on `git diff main` (including the A1.5 SQL-trap checks), squash into one commit, push, open the PR, partner review, merge, then tick A1.5.
- Gotchas for the next person:
  - `.env.local` holds the anon key and must stay git-ignored; `VITE_*` variables are read only when the dev server starts.
  - Temporary `main.jsx` lines were removed.
  - `searchBusinesses` returned 11 approved businesses on dev (the seed prompt predicted 10); confirm the count in SQL if it matters.

### 2026-10-02 · A1.5 review fixes · Codex
- Done:
  - Public detail reads now query only approved businesses and active products, including an inner approved-business filter for product detail.
  - Product searches reject the unsupported `businessId` filter with a validation error; RPC support remains deferred to a later migration.
  - Mapper distance precedence is RPC `distance_m`, then haversine fallback, then `null`; incomplete-application errors retain the original Supabase error as `cause` with `cause.missing`.
  - Added catalog query-builder, validation, mapper-distance, and error-cause tests.
- Files: `src/services/supabase/catalog.js`, `catalog.test.js`, `mappers.js`, `mappers.test.js`, `errors.js`, `errors.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (148 files), lint 0 errors / 1 pre-existing legacy warning, 57/57 tests pass, production build OK.
- Not done / left out (why): `SearchParams.businessId` needs a `p_business_id` parameter in a later RPC migration, which is outside A1.5 and this review-fix scope.

### 2026-10-02 · A1.5 · Cursor (Composer)
- Done:
  - Supabase read adapter: lazy `getSupabase()` client, `mapSupabaseError` (§11), mappers (rupees, distanceM, sort_order, details, no contacts), catalog RPCs + nested getBusinessBySlug / getProductById / listReviews.
  - `buildSearchArgs` pure helper (always-boolean `p_available_today`, radius omit/null, limit cap 50, price×100, near → lat/lng, CONTRACT default sort).
  - Unit tests: errors, mappers, buildSearchArgs; contract export test still green.
- Files: `src/services/supabase/client.js`, `errors.js`, `errors.test.js`, `mappers.js`, `mappers.test.js`, `catalog.js`, `catalog.test.js`, `index.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (148 files), lint 0 errors / 1 pre-existing legacy warning, 52/52 tests pass, production build OK.
- Not done / left out (why): `SearchParams.businessId` not supported yet (no consumer in `src/queries` / `src/pages` / `src/components`; Business page products come from `getBusinessBySlug` nested select). Write/auth/seller/admin still stubs.
- Next step (exact): merge A1.5 PR; smoke against `tibu-dev` with `VITE_DATA_SOURCE=supabase` when ready.
- Gotchas for the next person:
  - `getSupabase()` throws `config` without Vite anon env — mock builds stay fine.
  - `incomplete_application:<keys>` → `AppError('validation')` with `cause.missing`.

### 2026-10-01 · A1.3 review fixes · Cursor (Composer)
- Done:
  - `reelEmbedUrl` returns null when the shortcode fails CONTRACT §12; tests for valid + invalid shortcodes (incl. length 4/5/40/41 boundaries).
  - JSDoc on `normalizeIndianMobile`: returns `'91'+10` digits for wa.me; DB writes must use the 10-digit form.
  - Geo timeout (`code === 3`) → validation AppError covered in tests; `MUMBAI_AREAS` sync comment vs `scripts/seed-dev.mjs`.
  - `categoryIcons.test.js` asserts every CONTRACT §2 slug maps to an explicit icon (not Tag).
- Files: `src/lib/instagram.js`, `src/lib/instagram.test.js`, `src/lib/whatsapp.js`, `src/lib/geo.js`, `src/lib/geo.test.js`, `src/lib/categoryIcons.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (140 files), lint 0 errors / 1 pre-existing legacy warning, 38/38 tests pass, production build OK.
- Not done / left out (why): A1.3 review nice-to-haves deferred: revokeObjectUrl, maxSizeMB, NaN guard in haversine, getWithExpiry null ambiguity, 00/0091 tests.
- Next step (exact): open/merge A1.3 PR.
- Gotchas for the next person:
  - `normalizeIndianMobile` is for links; strip leading `91` before writing contacts to the DB.

### 2026-10-01 · A1.3 · Codex
- Done:
  - Added contract-aligned WhatsApp/call links, Instagram shortcode parsing and reel embed URLs, browser location helpers, a seed-aligned `MUMBAI_AREAS` list, browser image compression, safe localStorage helpers, and category-icon mapping.
  - Added `browser-image-compression` as the only dependency; WhatsApp messages use straight ASCII apostrophes consistently.
  - Added focused Vitest coverage for all runtime utilities except the static category-icon map.
- Files: `src/lib/whatsapp.js`, `src/lib/whatsapp.test.js`, `src/lib/instagram.js`, `src/lib/instagram.test.js`, `src/lib/geo.js`, `src/lib/geo.test.js`, `src/lib/image.js`, `src/lib/image.test.js`, `src/lib/storage.js`, `src/lib/storage.test.js`, `src/lib/categoryIcons.js`, `package.json`, `package-lock.json`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (140 files), lint 0 errors / 1 pre-existing legacy warning, 34/34 tests pass, production build OK.
- Not done / left out (why): A1.4 keeps its local seed area array; moving it to the browser utility is optional and would couple the Node-only seed to application source.
- Next step (exact): commit and open the A1.3 PR; A1.5 can import `haversineMeters` from `src/lib/geo.js` for detail distances.
- Gotchas for the next person:
  - `MUMBAI_AREAS` is an array of `{ name, lat, lng }` records, deliberately aligned with the current seed data; do not create a second UI areas list.
  - `getBrowserLocation` rejects with `AppError('validation', ...)`, including denied, timeout, and unsupported cases.


### 2026-09-30 · B1.5 follow-up · dk · Cursor (Composer)
- Done:
  - Fixed catalog hooks so caller `options` cannot override `queryKey` / `queryFn`: `...options` first in every options-aware hook
  - `enabled` gates now `!!id|slug|businessId && (options.enabled ?? true)` on useCategory / useBusiness / useProduct / useReviews
- Files: `src/queries/catalog.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green; `grep` shows six `...options` spreads, all first in their objects; `git diff --stat` was catalog-only before this PROGRESS update
- Not done / left out (why): —
- Next step (exact): push fix; open/merge B1.5 PR; then B1.7 or A1.5
- Gotchas for the next person:
  - Always put hook-owned `queryKey`/`queryFn`/`enabled` after `...options` so callers can only tighten `enabled`, never replace the service seam

### 2026-09-30 · B1.5 · dk · Cursor (Composer)
- Done:
  - Installed `@tanstack/react-query`, `zustand` (unused until A2.2), `sonner`
  - `src/app/providers.jsx` — QueryClientProvider (staleTime 60_000, retry 1, refetchOnWindowFocus true) + sonner Toaster top-center richColors
  - `src/app/ErrorBoundary.jsx` — class boundary; full-screen recovery; Reload + Home (`<a href="/">`); `console.error` only in DEV
  - `src/main.jsx` — ErrorBoundary → Providers → legacy ProfileProvider/SavedProvider → App
  - `src/queries/keys.js` — exactly CONTRACT §8
  - `src/queries/catalog.js` — catalog hooks via `src/services/index.js`; infinite search pages of 20 via offset (limit never grows); `useCategory` key `[...qk.categories, slug]`
- Files created: `src/app/providers.jsx`, `src/app/ErrorBoundary.jsx`, `src/queries/keys.js`, `src/queries/catalog.js`
- Files modified: `src/main.jsx`, `package.json`, `package-lock.json`, `docs/PROGRESS.md`
- How verified:
  - `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK)
  - Smoke: temporary `useProductSearch({ limit: 3 })` on `/dev/ui` → console `B1.5 smoke useProductSearch 3` + three product objects; probe removed after
- Not done / left out (why):
  - No zustand stores yet (A2.2)
  - No page consumers yet (B1.7+)
- Next step (exact): open/merge B1.5 PR; then B1.7 or A1.5
- Gotchas for the next person:
  - Infinite hooks strip `offset` from the key and force `limit: 20`; `pageParam` is the offset
  - ErrorBoundary sits outside BrowserRouter — Home must stay an `<a href="/">`, not `<Link>`
  - `useCategory` intentionally does not add a factory to `qk` (CONTRACT §8 exact)

### 2026-09-30 · B1.6 · dk · Antigravity (Claude Sonnet 4.6 / Gemini 3.8 Flash)
- Done:
  - Built full in-house UI kit per DECISIONS D14, D15. All Tailwind tokens; no `style={{}}` in new folders; lucide-react only; JSDoc on all props.
  - `src/components/ui/`: Button, IconButton, Card, Badge, Chip, Input, Textarea, Select, Switch, Tabs, Sheet, Dialog, Skeleton, Spinner, EmptyState, ErrorState, PageHeader, Avatar, ImagePlaceholder (19 components).
  - `src/components/brand/Logo.jsx` (new, no inline styles; same fallback wordmark). Legacy `src/legacy/components/brand/Logo.jsx` left untouched (not imported by any file — confirmed by grep).
  - `src/components/`: Price, Rating, Distance, ProductCard (row + grid variants), BusinessCard, SectionHeader, HorizontalScroller, CategoryChips.
  - `src/pages/dev/UiGalleryPage.jsx` — all components in all states with inline fake data; no mock adapter imports.
  - `src/index.css` — added `@utility no-scrollbar` and `@utility line-clamp-2`.
  - `src/App.jsx` — lazy-loaded UiGalleryPage behind `import.meta.env.DEV` guard; `/dev/ui` route (Suspense-wrapped).
  - `src/layouts/BottomNav.jsx` — added `'/dev/'` to `HIDDEN_PREFIXES`.
- Files created (36): all files listed above.
- Files modified (3): `src/App.jsx`, `src/layouts/BottomNav.jsx`, `src/index.css`.
- How verified: `npm run check` exits 0 — guards OK (125 files, 8 allowlist), lint 0 errors / 1 pre-existing legacy warning, 15/15 tests pass, build OK. Production bundle does NOT include UiGalleryPage (lazy + DEV guard → tree-shaken out).
- Not done / left out (why):
  - `brand/Logo` audit: `git grep "brand/Logo" src/` → 0 results; legacy Logo is orphaned, safe to create new one. Deletion deferred to its strangler task.
  - `BottomNav.jsx` still has `style={{}}` (pre-existing legacy code) — only added the `'/dev/'` string, did not restyle.
- Next step (exact): merge PR #7; then B1.5 (AppProviders + TanStack Query hooks).
- Gotchas for the next person:
  - `Avatar.size` accepts one of 32 | 36 | 40 | 48 | 56 | 64 (Tailwind static class map). Custom sizes → use `className` with `w-/h-` utilities.
  - `ImagePlaceholder.aspect` accepts `'1/1' | '4/3' | '3/4' | '16/9'` (mapped to Tailwind aspect-* classes). The old `aspectRatio` string prop is gone.
  - `Skeleton.variant='rect'` no longer takes `width`/`height` props — control those via `className` (e.g. `className="h-20 w-full"`).

### 2026-09-30 · A1.4 · dk · Cursor
- Done:
  - Idempotent `scripts/seed-dev.mjs` for `tibu-dev`: `SEED_ALLOWED_REF` guard before any DB work; 12 sellers + 2 customers; 12 businesses (10 approved / 1 pending / 1 rejected); contacts; 45 products + 81 images; 17 reviews; optional `REELS` → videos
  - Deletes of reviews / videos / products scoped with `.in('business_id', businessIds)` from this run’s upserted seed slugs only
  - Added `@supabase/supabase-js` (OK’d for A1.5; used here by the Node seed)
  - Optional `REELS=` documented in `.env.seed.example`
- Files: `scripts/seed-dev.mjs`, `package.json`, `package-lock.json`, `.env.seed.example`, `docs/PROGRESS.md`
- How verified:
  - Seed run ×2 → identical summary counts (14 users, 12 businesses, 12 contacts, 45 products, 81 images, 0 videos, 17 reviews)
  - Service-role check: all 12 seed businesses have `location`; all 10 approved have `rating_avg > 0`
  - Anon RLS probe: `businesses?status=neq.approved` → `[]`; `business_contacts` → `[]`; approved rows still visible
  - `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK)
- Not done / left out (why):
  - `REELS` not set locally → `business_videos` skipped (by design)
  - `src/lib/geo.js` / `MUMBAI_AREAS` still A1.3; seed inlines `AREAS`
  - A1.5 adapter not started
- Next step (exact): merge PR #6 after conflict resolution; then A1.5 or parallel B1.5 / B1.6 / A1.3
- Gotchas for the next person:
  - Never commit `.env.seed` (service-role). Example only is tracked
  - Anon may see more than 10 approved businesses if non-seed approved rows already exist on `tibu-dev`
  - Password for seed users remains `Test@12345` (dev only)

### 2026-09-30 · A1.4 (WIP, stopped mid-task) · dk · Cursor
- Done: draft seed script + supabase-js + REELS note in example; session stopped before verify
- Files: same as A1.4 completion entry (was uncommitted WIP)
- How verified: not yet (superseded by completion entry above)
- Not done / left out (why): verify + commit deferred to same-day follow-up
- Next step (exact): run seed twice + check — done in completion entry
- Gotchas for the next person: superseded

### 2026-09-30 · A1.6 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Connected repo to Cloudflare Pages (`tibu-v1.pages.dev`)
  - Configured build settings: build command `npm run build`, output directory `dist`, root `/`
  - Added environment variables for Production & Preview: `NODE_VERSION=22`, `VITE_DATA_SOURCE=mock`, `VITE_SITE_URL=https://tibu-v1.pages.dev`
  - Verified SPA deep links (`/p/anything`, `/b/anything`) return HTTP 200 and serve `index.html` (not Cloudflare 404)
  - Verified app boots with production Vite bundle from `dist/`
- URLs:
  - Production URL: `https://tibu-v1.pages.dev`
  - Deployment URL: `https://be9f1995.tibu-v1.pages.dev`
- Files: `docs/PROGRESS.md`
- How verified:
  - Terminal `curl` on `https://tibu-v1.pages.dev/p/anything` and `/b/anything` returned HTTP 200 with index.html root and compiled asset scripts
  - Local `npm run check` (guards, lint, test, build) all green
- Not done / left out (why):
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` skipped per runbook (will set in A2.3 after A1.2 finishes)
- Next step (exact): A1.2 leftovers or A1.5 / B1.5 (B1.4 already on main)
- Gotchas for the next person:
  - In Cloudflare Pages project settings, the build output directory must remain `dist` (default `/` serves raw unbundled source files)

### 2026-09-29 · B1.4 · daiwang · Cursor
- Done:
  - Service contract seam: `AppError`, `FUNCTION_NAMES` + JSDoc typedefs, adapter switch on `VITE_DATA_SOURCE`
  - Deterministic mock adapter (taxonomy, fixtures from legacy raw data, catalog search/get/listReviews); other functions throw `unavailable_in_mock`
  - Supabase adapter stubs throw `config` (for A1.5)
  - `formatPrice` / `formatDistance` / `formatRating` / `formatRelativeTime` + vitest coverage
- Files: `src/services/errors.js`, `src/services/contract.js`, `src/services/contract.test.js`, `src/services/index.js`, `src/services/mock/taxonomy.js`, `src/services/mock/fixtures.js`, `src/services/mock/index.js`, `src/services/mock/mock.test.js`, `src/services/supabase/index.js`, `src/lib/format.js`, `src/lib/format.test.js`
- How verified: `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK). Legacy `*Service.js` / pages untouched.
- Not done / left out (why):
  - No PR yet; not on `main`
  - `src/queries/` and app providers (B1.5) not started
  - Supabase adapter still stubs only (A1.5)
  - Legacy pages still on old `*Service.js` path by design until later strangler tasks
- Next step (exact): push `feat/b1-4-contract` and open PR for contract review (S9); then start B1.5 on a new branch from main (or from this PR once merged)
- Gotchas for the next person:
  - Working tree was already committed as `87ffc51` -- do not re-add the same files as a `wip:` commit
  - PROGRESS.md "Now"/log update in this session is uncommitted until you decide to amend or add a docs commit
  - Legacy Home still uses old services; empty fashion row can still happen until taxonomy is wired through queries/pages

### 2026-09-29 · B1.3 follow-up · daiwang · Cursor
- Done:
  - Compared local Cursor B1.3 tree vs merged PR #3 (`ba93136`); kept merged main as source of truth
  - Removed leftover Notification offer branch that merged B1.3 had only redirected: deleted mock `offers` array, type `"offer"` notifications, `handleOffer`, offer tap/label branch, and `setSelectedOffer` prop
  - Removed dead `selectedOffer` from `App.jsx` LegacyPage props
- Files: `src/legacy/pages/Notification.jsx`, `src/App.jsx`
- How verified: greps clean for offer/`selectedOffer` in those files; commit `f234296` on `main`
- Not done / left out (why): —
- Next step (exact): finish A1.2 or proceed to B1.4
- Gotchas for the next person:
  - `Notification.jsx` still has no real branch for enquiry/review/digest types (only business remains). Needs proper handling when rebuilt against Supabase notifications.

### 2026-09-28 · B1.3 · dk · Antigravity (Gemini 3.7 Flash)
- Done:
  - Removed Phase-2 screens (Offers, OfferDetails, Discover, Addresses, AddAddress, offerService.js) per DECISIONS D16
  - Cleaned up routing, imports, and URL map keys in `App.jsx` and `useSetPage.js`
  - Removed `normalizedOffers` from `normalize.js`
  - Removed `addresses` state, defaultAddresses, and addresses count from `ProfileContext.jsx`
  - Removed Addresses stat and Manage Addresses / Tibu Offers quick actions from `Profile.jsx`
  - Updated `Home.jsx` location line to static "Mumbai" and removed addresses props
  - Redirected remaining `setPage('offers' | 'discover')` in `Reel.jsx` and `Notification.jsx` to `setPage('home')`
  - Removed `src/Discover.jsx` from `scripts/legacy-allowlist.json`
- Files: `src/Offers.jsx` (del), `src/OfferDetails.jsx` (del), `src/Discover.jsx` (del), `src/Addresses.jsx` (del), `src/AddAddress.jsx` (del), `src/services/offerService.js` (del), `src/App.jsx`, `src/hooks/useSetPage.js`, `src/services/mock/normalize.js`, `src/contexts/ProfileContext.jsx`, `src/Profile.jsx`, `src/Home.jsx`, `src/Reel.jsx`, `src/legacy/pages/Notification.jsx`, `scripts/legacy-allowlist.json`
- How verified: `npm run check` (guards + lint + tests + build) all green
- Not done / left out (why):
  - `Reel.jsx` and `ReelsViewAll.jsx` kept for now (scheduled for deletion in B2.4)
  - Notification offer mock/handler left as redirect-only — cleaned up next day by daiwang (`f234296`)
- Next step (exact): finish A1.2 or proceed to B1.4 (Build mock/supabase seam & queries folder)
- Gotchas for the next person: none

### 2026-09-27 · B1.1 / B1.2 / A1.2 · dk · Cursor
- Done:
  - Solo session: dk covered both A and B tracks (no partner session)
  - B1.1: done, merged to main (`f27d73b`) — boot patch + Desserts category filtering
  - B1.2: done, merged to main (`a7a66a0`) — hygiene (AGENTS.md, rules, guards, CI, legacy folders)
  - A1.2 (partial): `tibu-dev` Supabase project created; migrations pushed; cron scheduled and verified
  - `tibu-prod` project also created today (ahead of Week 5 / A5.2) — left untouched (no migrations, no seed)
- Files: `src/Desserts.jsx`, `src/Home.jsx`, `src/App.jsx`, ViewAll defaults, `AGENTS.md`, `.agents/`, `.cursor/`, `.github/`, `scripts/` (B1.2)
- How verified: `npm run build` green; B1.1/B1.2 on `main` (`f27d73b`, `a7a66a0`); A1.2 cron verified on `tibu-dev`
- Not done / left out (why):
  - A1.2 still open: `supabase/` folder (migrations, cron.sql, tests) not yet copied into this repo
  - `docs/kit/rpc-signatures.txt` not yet saved
- Next step (exact): finish A1.2 (copy `supabase/` into repo + save rpc-signatures), then proceed to B1.3
- Gotchas for the next person:
  - Cursor does **not** auto-load `AGENTS.md` from `.cursor/rules/tibu.mdc` — attach `@AGENTS.md` explicitly each new chat, or paste Session Opener (`docs/build/prompts/00_SESSION_AND_RESCUE.md` S1) first

### YYYY-MM-DD · <task id> · <who> · <tool + model>
- Done:
- Files:
- How verified:
- Not done / left out (why):
- Next step (exact):
- Gotchas for the next person:
