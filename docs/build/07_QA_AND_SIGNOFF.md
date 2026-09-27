# 07 · QA, definition of done, and sign-off

## 1. Definition of done (every task)
- `npm run check` green locally and in CI; `git diff --stat` shows only planned files.
- Matches `docs/CONTRACT.md`; no invented fields; price in rupees; no phones on public shapes.
- UI tasks: checked at **360, 390 and 430 px** wide; loading, empty, error and data states all seen (throttle to "Slow 4G" in DevTools to see loading; use a nonsense search or empty category for empty; set `VITE_DATA_SOURCE=supabase` with a wrong URL, or go offline, for error).
- Keyboard: Tab reaches every button; focus ring visible; icon buttons have labels.
- Legacy files it replaces are deleted and removed from the allowlist.
- PROGRESS entry written; PR reviewed by the other person or a different tool.

## 2. SOW §3 checklist → tasks → how to test

| # | SOW item | Task(s) | Test |
|---|---|---|---|
| 1 | Guest browsing without login | B2.1–B2.3, B1.7–B1.8 | Incognito: Home, Search, Category, Business, Product all load |
| 2 | Registration/login required before contact reveal | A3.1, A3.2, B3.1–B3.3 | Incognito → WhatsApp → login sheet; after signup the action resumes |
| 3 | Home: branding, hero, search bar, category shortcuts, New Businesses, New Products, Available Today | B2.1 | All seven present, each with data from Supabase |
| 4 | Available Today = manual seller toggle | B4.3, A4.1, cron | Seller toggles → Home section updates; next day after midnight IST it's reset |
| 5 | Search businesses and products, filter by category, both result types | B2.3 | "cake" + category Desserts → both tabs show matches |
| 6 | Location-based discovery sorted by real distance | A2.2, B2.6 | Pick "Andheri West" → nearest sort shows increasing distances |
| 7 | Category browsing and filters | B2.2 | `/category/handmade` includes crochet, candles, resin art, embroidery |
| 8 | Business page: name, cover, location, description, Call, WhatsApp, Products/Videos/Reviews tabs | B1.8, B3.3 | All present; tabs deep-link via `?tab=` |
| 9 | Product page: image, name, price, description, business name, details, Call, WhatsApp | B1.7, B3.3 | All present; price formatted ₹1,250 |
| 10 | Basic customer profile | B3.4 | Edit name/phone/avatar; persists after reload |
| 11 | Previously connected | A3.4, B3.5 | After a WhatsApp tap the business appears at the top |
| 12 | Saved businesses and products | A3.3, B3.5 | Save on Business and Product; both tabs in Saved |
| 13 | Recently viewed | A3.4, B3.5 | View 3 products → list order newest first; guest views merge after login |
| 14 | Reviews & ratings view and submit | B5.2 | Submit 4★ → appears, business rating updates; seller can't review own business |
| 15 | WhatsApp + Call from Business and Product pages | B3.3 | Real Android + iPhone: WhatsApp opens the right chat; Call opens the dialer |
| 16 | Pre-filled message with product name and price | A1.3, B3.3 | Text matches CONTRACT §10 exactly |
| 17 | Product link in the message; seller sees the image | A2.3 | Paste link into WhatsApp → preview card with image, name, price |
| 18 | Seller registration and login | B4.1 | New seller account created from `/sell` |
| 19 | Seller onboarding: details, logo, banner, phone, WhatsApp, Instagram ID, images, products with images, videos | B4.2, A4.2 | Complete all 7 steps on a phone with real photos |
| 20 | Seller profile management | B4.3 | Edit description after approval; stays approved (D23) |
| 21 | Product management add/edit/remove with photos | B4.3 | Add, edit price, remove image, delete product |
| 22 | Videos via public Instagram reel link | B4.3, B1.8 | Paste reel URL → plays in Videos tab |
| 23 | In-app enquiry box | B5.1, A4.4 | Customer sends from Product page |
| 24 | Seller notified of new enquiry | A4.4, B5.3 | Seller bell badge + notification links to the thread |
| 25 | Seller reply; customer notified | B5.1 | Reply → customer badge + notification |
| 26 | Non-real-time behaviour | D20 | Messages appear on refresh / within 60 s poll |
| 27 | Admin: applications, statuses, phone/WhatsApp/Instagram/business info | B4.4, A4.3 | Pending list shows all fields |
| 28 | Admin approve / reject / unpublish | B4.4 | Each action changes public visibility and notifies the seller |
| 29 | Backend API and database replacing static data | A1.5, A2.1 | Preview uses `VITE_DATA_SOURCE=supabase`; `src/services/mock/data` unused in prod build (optional: tree-shaken) |
| 30 | Image upload and hosting | A4.2 | Uploaded images load from Supabase Storage URLs |
| 31 | Email/password login, no OTP | A3.1 | No OTP code anywhere (`grep -ri otp src` → nothing) |
| 32 | Deployment | A5.2 | Live on the client's domain over HTTPS |
| 33 | Optional grouped notifications; app works without permission | A5.1, B5.3 | Digest appears in-app; no browser permission prompt anywhere |

## 3. Audit bug closure table (show this at Milestone 1)

| Audit bug (CODEBASE_AUDIT §5) | Status at M1 | How |
|---|---|---|
| Undefined `selectedSellerProduct` | Eliminated | Router rewrite; seller pages rebuilt in Week 4 read the URL |
| Missing seller sub-routes | Fixed (routes exist) | Real seller pages in B4.3 |
| Catalog WhatsApp/Call unusable (no phone) | Resolved by design | Phones come from `revealContact` after login (live in Week 3; buttons present at M1) |
| Fashion price/distance filters broken | Eliminated | One CategoryPage with numeric filters (B2.2) |
| Handmade price filter broken (`priceValue`) | Eliminated | Same |
| Splash screen broken | Removed | File no longer in the codebase |
| Seller registration not connected | Scheduled | Real onboarding in B4.2 |
| Crochet missing from Search | Eliminated | Search queries all categories through one service (B2.3) |
| Discover heart no-op | Removed | Discover is Phase 2 (B1.3) |
| Reel actions no-op | Removed | Reel page removed; Videos tab embeds Instagram (B1.8, B2.4) |
| OfferDetails buttons | Removed | Offers are Phase 2 (B1.3) |
| Notification vs Offers data mismatch | Removed | Offers removed; notifications rebuilt in Week 5 |
| `profileStats.addresses` always 0 | Removed | Address book is out of scope (B1.3) |
| Leftover `console.log` | Fixed | Rewritten screens; lint rule |
| Bottom nav on all screens | Fixed | Per-route hiding (AppShell/BottomNav) |
| `sellerMode` unused | Removed | Dead prop gone with LegacyPage |
| ID casing inconsistency | Fixed | Lowercase kebab slugs; uuids in the DB |
| Export name ≠ filename | Moot | Raw data only used by the mock adapter |
| Horizontal overflow (`minWidth: 260px`) | Fixed | New responsive cards (B1.6) |
| Arial hardcoded | Fixed | Nunito / Nunito Sans via tokens in all rebuilt screens |
| **Found in re-check:** Linux build failure, white screen, hidden lint errors, state-only entity pages, service signature mismatch, four category taxonomies, random distances | Fixed | `00_STATUS_VERIFIED.md`, patches, B1.x |

## 4. Milestone 1 demo script (15 minutes, on a phone)
1. Open the preview link on your phone in front of her (or screen-share a phone). Home: hero, search, categories, three sections with real seeded data.
2. Set location to her area → distances appear, "nearest" sorting works.
3. Category → Handmade → subcategory chips → filter "Available today".
4. Search "cake" → switch Products/Businesses tabs.
5. Open a business → Products, Videos (one real public reel), Reviews tabs.
6. Open a product → price, details, WhatsApp/Call buttons (explain: live after login in Week 3).
7. Copy the product link, paste it into WhatsApp → preview card with the image.
8. Show the audit table (§3) and the Week 3–6 plan.
9. Ask for written confirmation of the M1 wording (D27) and the open decisions; send the invoice (`08` §4).

## 5. Devices and browsers
Android Chrome (a mid-range phone), iOS Safari (any iPhone from the last 5 years), desktop Chrome at 1280px (centred column only). WhatsApp tests on both phones.

## 6. RLS matrix
Use the dev kit's `docs/kit/09_Testing_QA_Launch.md` §3 matrix. Test as guest, customer, seller A, seller B (must not touch A's data), and admin, through the app and the curl probes in `06` §5. Record pass/fail per row in PROGRESS (A4.5).

## 7. Launch checklist (Week 6)
- [ ] Prod RLS probes pass · [ ] SMTP from the client's domain lands in inbox, not spam (Gmail + one other)
- [ ] Privacy policy and terms contain the client's real text (not placeholders) · [ ] Contact/support details correct
- [ ] No seed or test data in prod · [ ] First admin promoted · [ ] 3–5 real sellers approved
- [ ] OG preview works on the prod domain · [ ] Keep-alive enabled · [ ] First backup taken
- [ ] `npm audit --omit=dev` clean · [ ] Lighthouse mobile run on Home and Product (note scores)
- [ ] Handover pack sent (`08` §7)
