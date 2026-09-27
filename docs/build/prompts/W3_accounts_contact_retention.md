# Week 3 — Accounts, contact, retention (12 – 16 Oct)

**Exit check:** in incognito: browse → open a product → tap WhatsApp → login sheet → sign up → confirm email → WhatsApp opens the seller's chat with the exact pre-filled message and the `/p/` link → the business shows under "Previously connected". Saving works from Product and Business pages; Recently viewed lists what you opened, including views from before you logged in. SMTP (Resend) is live on dev.

Order for A: A3.1 → (A3.2 ∥ A3.3 ∥ A3.4) → A3.5. Order for B: B3.1 → B3.2 → B3.3 → B3.4 → B3.5. Before B3.1 merges, have the client's answer on email confirmation (D12).

---

## A3.1 · Auth, profile services, auth store, guards
**Owner** A · **Branch** `feat/a3-1-auth` · **Tool** Antigravity · **Est** 2.5 h · **Needs** A1.5
```
TASK A3.1 — Authentication plumbing (no UI pages).
Read: AGENTS.md, docs/CONTRACT.md §4 and §7 (auth, me), docs/kit/04_API_and_Data_Access.md §6 (auth calls), supabase/migrations/20260925000002_functions_triggers.sql (handle_new_user, signup_as, role guards) and 20260925000005_storage.sql (avatar bucket and path rule).
1. src/services/supabase/auth.js: getSession, onAuthChange(callback) → returns an unsubscribe function, signUp({ email, password, fullName, signupAs }) passing options.data { full_name, signup_as } and emailRedirectTo `${import.meta.env.VITE_SITE_URL}/auth/callback` → { needsEmailConfirmation: !data.session }, signIn, signOut, sendPasswordReset(email) (redirect `/reset-password`), updatePassword.
2. src/services/supabase/me.js: getMe() (profiles row + session email → Profile), updateMe(patch) (whitelist the CONTRACT fields; never role), uploadAvatar(file) (compress with src/lib/image.js to 400px, upload to the avatar bucket/path from the storage migration, return the public URL, then updateMe({ avatarUrl })).
3. Export them from src/services/supabase/index.js (mock keeps throwing unavailable_in_mock).
4. src/stores/auth.js (zustand, not persisted): { status: 'loading'|'guest'|'authenticated', session }. src/app/AuthBootstrap.jsx: on mount getSession() then onAuthChange; sets the store; on SIGNED_OUT calls queryClient.clear(). Mount it once in src/app/providers.jsx. In mock mode set status 'guest' and skip Supabase entirely.
5. src/queries/me.js: useMe() (enabled only when authenticated), useUpdateMe(), useUploadAvatar() — invalidate qk.me on success.
6. src/app/guards.jsx: <RequireAuth> (loading → centred Spinner; guest → <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />) and <RequireRole roles={['seller']}> (wrong role → friendly 403 screen with a Home link; 'admin' passes any role check).
Plan first.
```
**Verify:** in a scratch route, RequireAuth redirects a guest to `/login?next=…` · signing in from the browser console via the service updates the store · sign out clears cached queries (React Query devtools or a log) · `npm run check` green without env vars.
**Commit:** `feat(a3.1): auth and profile services, auth store, route guards`

## A3.2 · Login gate + reveal contact
**Owner** A · **Branch** `feat/a3-2-login-gate` · **Tool** Antigravity · **Est** 2.5 h · **Needs** A3.1, A1.3
```
TASK A3.2 — "Log in to contact" mechanism (DECISIONS D10, D11).
Read: AGENTS.md, docs/CONTRACT.md §4, §7 (contact), §10, docs/kit/02_Architecture.md §3.1, supabase/migrations/20260925000004_rpc.sql (reveal_contact: exact params, rate-limit behaviour, error codes).
1. src/stores/loginGate.js (zustand): { open, pending } where pending = { type: 'whatsapp'|'call'|'save'|'enquiry'|'review', payload, returnTo, createdAt }. Actions: request(action) (opens the sheet, persists pending with setWithExpiry('tibu.pendingAction', …, 30 min)), cancel(), close(). registerGateHandler(type, fn) keeps a module-level map of handlers. resumePending(): reads the non-expired pending action, clears it, and runs its handler.
2. src/app/GateResumer.jsx (mounted in providers): when auth status becomes 'authenticated' and a pending action exists: if location.pathname !== returnTo navigate(returnTo) first, then resumePending().
3. src/services/supabase/contact.js: revealContact({ businessId, channel, productId }) → rpc('reveal_contact', { p_business, p_channel, p_product }) → the RPC returns a one-row array: take [0]; an empty array → { phone: null, whatsapp: null }. Errors via mapSupabaseError (login_required → auth_required, rate_limited is 60 reveals/hour).
4. src/queries/contact.js: useContactAction() returns { start(channel, { business, product }), pendingChannel }:
   - guest → loginGate.request({ type: channel, payload: { businessId, businessSlug, businessName, product: product && { id, name, price } }, returnTo: current path })
   - authenticated → revealContact → WhatsApp: whatsappLink(contact.whatsapp, product ? productMessage(product, `${SITE_URL}/p/${product.id}`) : businessMessage(business, `${SITE_URL}/b/${business.slug}`)); Call: callLink(contact.phone) → window.location.href = link (NOT window.open — iOS blocks pop-ups after an await). Missing number → toast "This seller hasn't added a <WhatsApp|phone> number".
   - after success invalidate qk.connected.
   Register the 'whatsapp' and 'call' gate handlers here so the action replays after login.
Plan first.
```
**Commit:** `feat(a3.2): login gate with resume and reveal-contact action`

## A3.3 · Saved items
**Owner** A · **Branch** `feat/a3-3-saved` · **Tool** Cursor · **Est** 2 h · **Needs** A3.1
```
TASK A3.3 — Saved businesses and products.
Read: docs/CONTRACT.md §4, §7 (saved), supabase migrations for saved_businesses / saved_products (+ their RLS).
1. src/services/supabase/saved.js: getSavedIds, listSavedBusinesses, listSavedProducts (newest saved first, only items still public), setSaved({ kind, id, saved }) (insert on conflict do nothing / delete).
2. src/queries/saved.js: useSavedIds() (enabled when authenticated), useIsSaved(kind, id), useToggleSave() with optimistic update of qk.saved and rollback on error; invalidates the list queries.
3. Register a 'save' gate handler: after login, perform the pending save.
Plan first.
```
**Commit:** `feat(a3.3): saved items service and optimistic hooks`

## A3.4 · Recently viewed + previously connected
**Owner** A · **Branch** `feat/a3-4-activity` · **Tool** Cursor · **Est** 2 h · **Needs** A3.1
```
TASK A3.4 — Activity tracking.
Read: docs/CONTRACT.md §4, §7 (activity), supabase migrations for recent_views, contact_events, track_view().
1. src/services/supabase/activity.js: trackView({ kind, id }) → rpc('track_view', kind === 'business' ? { p_business: id } : { p_product: id }); listRecent({ limit = 30 }) → from('recent_views').select('viewed_at, businesses(id,slug,name,logo_url,locality), products(id,name,price_paise,product_images(url,sort_order))') ordered by viewed_at desc, skip rows whose embedded item is null (no longer public), map to RecentItem with BusinessRef / ProductRef; listConnected({ limit = 30 }) → rpc('my_connected_businesses', { p_limit }) → ConnectedItem (business: BusinessRef, channel, contactedAt). This needs migration 0007 (newest-first fix) — check it's applied.
2. src/lib/recentLocal.js: guest recent views in localStorage 'tibu.recent' (max 30, newest first, dedupe).
3. src/queries/activity.js: useTrackView(kind, id) — call once per mount when data is loaded: authenticated → service; guest → recentLocal. useRecent() — authenticated → service; guest → resolve local items via getProductById / getBusinessBySlug (skip ones that return null). useConnected().
4. On login (auth status → authenticated): push local items through trackView (oldest first), then clear the local list. Put this in AuthBootstrap or a small effect in src/app/.
5. Call useTrackView in ProductPage and BusinessPage.
Plan first.
```
**Commit:** `feat(a3.4): recently viewed with guest merge, previously connected`

## A3.5 · Profile location default + SMTP live
**Owner** A · **Est** 1 h · **Needs** A3.1, A2.2
- Small prompt: "When the user is authenticated and the location store has no location, call `setFromProfile` with the profile's home_lat/home_lng/home_locality. Put this in AuthBootstrap. Plan first."
- Manual: Resend SMTP live on dev (`06` §7); send a real signup to Gmail and one other provider → lands in inbox.

---

## B3.1 · Auth pages
**Owner** B · **Branch** `feat/b3-1-auth-pages` · **Tool** Antigravity · **Est** 3 h · **Needs** A3.1
```
TASK B3.1 — Auth screens. Email + password only (no OTP, no social login).
Add dependencies: react-hook-form, zod, @hookform/resolvers (OK'd).
Read: AGENTS.md, docs/CONTRACT.md §7 (auth), src/stores/auth.js, src/queries/me.js, src/stores/loginGate.js, .agents/rules/design-system.md, design/mockups/welcome-modal.png.
Pages in src/pages/auth/ (each < 150 lines, shared AuthLayout.jsx with Logo and a pastel card):
1. LoginPage /login — email, password (show/hide), submit; errors mapped: invalid credentials → "Email or password is incorrect"; email not confirmed → message + "Resend email" (Supabase resend). On success navigate to `next` param or '/'. Links: "Forgot password?", "Create an account" (keeps ?next).
2. SignupPage /signup — full name, email, password (min 8, one number) + confirm; `?as=seller` changes the heading/copy and passes signupAs 'seller' (default 'customer'). On success: if needsEmailConfirmation show "Check your inbox" screen with the email and a resend button; else navigate to next.
3. ForgotPasswordPage /forgot-password — email → sendPasswordReset → confirmation message (same message whether or not the email exists).
4. ResetPasswordPage /reset-password — new password + confirm → updatePassword → toast → '/'.
5. AuthCallbackPage /auth/callback — shows a Spinner while supabase-js processes the URL; when the auth store becomes authenticated navigate to `next` (from the URL, if present) or '/'; the GateResumer replays any pending action. On error show a message + link to /login.
6. Routes in src/App.jsx; add these paths to BottomNav HIDDEN_PREFIXES. Logged-in users visiting /login or /signup are redirected to '/'.
zod schemas in src/pages/auth/schemas.js. Plan first.
```
**Verify:** full signup → email → click link (opens a new tab) → lands logged in · wrong password message · reset password round trip · `?next=/saved` honoured · 390px layout, keyboard doesn't cover the submit button on a real phone.
**Commit:** `feat(b3.1): login, signup, reset and callback pages`

## B3.2 · Login sheet
**Owner** B · **Branch** `feat/b3-2-login-sheet` · **Tool** Cursor · **Est** 2 h · **Needs** A3.2, B3.1
```
TASK B3.2 — LoginSheet driven by src/stores/loginGate.js.
1. src/components/LoginSheet.jsx, mounted once in src/app/providers.jsx: open when loginGate.open. Title depends on pending.type ("Log in to contact <businessName>", "Log in to save", "Log in to send an enquiry", "Log in to write a review"). Contains the same login form as LoginPage (extract src/pages/auth/LoginForm.jsx and reuse it) and a "Create an account" button → navigate(`/signup?next=${returnTo}`) (the pending action stays in localStorage). Close → loginGate.cancel().
2. After a successful login inside the sheet: close it; GateResumer runs the action.
Plan first.
```
**Commit:** `feat(b3.2): login sheet for gated actions`

## B3.3 · Contact buttons live
**Owner** B · **Branch** `feat/b3-3-contact-live` · **Tool** Cursor · **Est** 1.5 h · **Needs** A3.2, B3.2
```
TASK B3.3 — Wire ContactButtons to useContactAction on ProductPage and BusinessPage.
Replace the placeholder toasts. While a channel is revealing, that button shows loading and both are disabled. Pass the product (id, name, price) on ProductPage; only the business on BusinessPage. No other changes.
```
**Verify on real phones (Android Chrome + iOS Safari):** logged-out tap → sheet → login → WhatsApp opens the right number with the exact CONTRACT §10 text and a working `/p/` link · Call opens the dialer with +91 · tapping 10+ times quickly → rate-limit toast (if the RPC rate-limits) · the business appears in Previously connected.
**Commit:** `feat(b3.3): live WhatsApp and Call with pre-filled message`

## B3.4 · Profile and Edit profile
**Owner** B · **Branch** `feat/b3-4-profile` · **Tool** Antigravity · **Est** 2 h · **Needs** A3.1, A3.5
```
TASK B3.4 — Rebuild Profile. Replaces src/Profile.jsx, src/EditProfile.jsx, src/contexts/ProfileContext.jsx.
1. src/pages/profile/ProfilePage.jsx (/profile): guest → a card with "Log in" and "Create account" (links keep ?next=/profile) plus the info rows below. Authenticated → Avatar, name, email; rows: Saved, Recently viewed, Previously connected, Notification settings (/notifications/settings — legacy page until B5.3), Sell on Tibu (/sell; hidden for sellers, who see "Seller dashboard" → /seller), Admin panel (/admin, admins only), Help, About, Privacy, Terms, Log out (confirm Dialog).
2. src/pages/profile/EditProfilePage.jsx (/profile/edit, RequireAuth): full name, phone (optional, 10-digit Indian mobile, validated with normalizeIndianMobile), avatar (uploadAvatar with preview), home area (Select of MUMBAI_AREAS or "Use current location") → homeLocality/homeLat/homeLng, "Grouped updates about new businesses near me" Switch → notifyDigest. react-hook-form + zod. Save → toast.
3. Remove ProfileProvider from main.jsx and delete ProfileContext.jsx — first check with git grep that no remaining legacy file uses useProfile; if one does (e.g. NotificationPreferences.jsx), replace its usage with local state and mention it.
4. Delete src/Profile.jsx and src/EditProfile.jsx; update routes and the allowlist.
Plan first.
```
**Commit:** `feat(b3.4): profile and edit profile on real accounts`

## B3.5 · Saved, Recently viewed, Previously connected
**Owner** B · **Branch** `feat/b3-5-saved-recent` · **Tool** Antigravity · **Est** 3 h · **Needs** A3.3, A3.4
```
TASK B3.5 — Retention screens and a live SaveButton. Replaces src/Saved.jsx and src/contexts/SavedContext.jsx.
1. src/components/SaveButton.jsx: useIsSaved + useToggleSave; guest → loginGate.request({ type: 'save', payload: { kind, id }, returnTo }). Filled heart when saved; aria-pressed; aria-label "Save"/"Remove from saved".
2. src/pages/saved/SavedPage.jsx (/saved, RequireAuth): Tabs Products | Businesses (?tab=), grids of cards with SaveButton; EmptyState with a link to Home.
3. src/pages/saved/RecentPage.jsx (/recent — works for guests too, from local storage) and ConnectedPage.jsx (/connected, RequireAuth): lists with relative time ("Viewed 2 h ago", "WhatsApp · 3 d ago"), tap → the item.
4. Put SaveButton on ProductPage, BusinessPage and in card `action` slots on Search/Category/Home.
5. Remove SavedProvider and delete SavedContext.jsx, src/Saved.jsx, and src/legacy/components/{ProductCard,BusinessCard,ReelCard,Banner}.jsx if nothing imports them (check with git grep). Update routes, the allowlist and LegacyPage props.
Plan first.
```
**Verify:** save as guest → login → item saved · unsave from Saved list updates immediately · recent order newest-first; guest views appear after login · connected shows the WhatsApp tap from B3.3.
**Commit:** `feat(b3.5): saved, recently viewed, previously connected`
