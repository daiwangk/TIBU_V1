# 09 · Testing, QA & Acceptance

## 1. Test layers (keep it proportionate to an MVP)

| Layer | Tool | What |
|---|---|---|
| Database | `supabase/tests/rls_smoke_test.sql` (psql) | RLS, guards, RPCs, triggers — run after every migration on dev/local |
| Unit | Vitest | `lib/format.ts`, `lib/whatsapp.ts`, `lib/instagram.ts`, zod schemas |
| Component/flow | Manual on real phones + Antigravity browser agent | Golden paths below |
| Build gates | CI | lint, typecheck, build |

Suggested Vitest cases: `formatPrice(35000) === '₹350'`, `toPaise('₹1,299') === 129900`, `formatDistance(2340) === '2.3 km'`, `toIntl('098765 43210') === '919876543210'`, `parseInstagramShortcode('https://www.instagram.com/reel/C9abcDEF12/?igsh=x') === 'C9abcDEF12'`, product message contains name, formatted price and URL.

## 2. SOW acceptance checklist (use as the client sign-off sheet)

| # | SOW item | How to verify | ✅ |
|---|---|---|---|
| 1 | Guest browsing | Incognito: open Home, Search, Category, Business, Product | |
| 2 | Registration/login gates contact | Guest taps WhatsApp → login sheet → after login WhatsApp opens | |
| 3 | Home page sections | Branding, hero, search, categories, New Businesses, New Products, Available Today visible with data | |
| 4 | Available Today | Seller toggles → appears on Home | |
| 5 | Search businesses & products + category filter | "cookie" returns results in both tabs; filter by Desserts | |
| 6 | Location-based discovery, real distance | Allow location → nearest first with correct km | |
| 7 | Category browsing & filters | `/category/handmade` shows subcategories' items | |
| 8 | Business page (name, cover, location, description, Call, WhatsApp, Products/Videos/Reviews tabs) | Open an approved business | |
| 9 | Product page (image, name, price, description, seller, details, Call, WhatsApp) | Open a product | |
| 10 | Basic customer profile | Edit name/phone, reload | |
| 11 | Previously connected | Tap WhatsApp → business listed | |
| 12 | Saved businesses & products | Save both, see in profile | |
| 13 | Recently viewed | View items → listed | |
| 14 | Reviews & ratings | Submit review → average updates | |
| 15 | WhatsApp pre-filled message with product name, price, link | Inspect opened chat | |
| 16 | Product link shows image | Link preview in WhatsApp | |
| 17 | Call button | Opens dialer with seller number | |
| 18 | Seller registration/login | New seller account | |
| 19 | Seller onboarding (details, logo, banner, phone, WhatsApp, Instagram, images, products, videos) | Complete wizard | |
| 20 | Business profile management | Edit after approval | |
| 21 | Product management with photos | Add/edit/remove | |
| 22 | Videos via Instagram reel link | Reel plays on Business page | |
| 23 | In-app enquiry | Customer sends | |
| 24 | Seller notified | Badge + notification | |
| 25 | Seller reply + customer notified | Reply → customer badge | |
| 26 | Admin panel (list, statuses, contacts/IG, approve/reject, unpublish) | Full cycle | |
| 27 | Backend API + DB replaces static data | No `src/Data` imports remain | |
| 28 | Image upload & hosting | Uploaded images load from Storage | |
| 29 | Email/password login (no OTP) | Signup/login/reset | |
| 30 | Deployment | Live on client domain | |
| 31 | Grouped notifications (optional) | Digest notification appears next morning | |

## 3. RLS test matrix (run manually once per week 3–5)

| Action | Guest | Customer | Seller (own) | Seller (other's) | Admin |
|---|---|---|---|---|---|
| Read approved business | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read pending business | ❌ | ❌ | ✅ | ❌ | ✅ |
| Read `business_contacts` directly | ❌ | ❌ | ✅ | ❌ | ✅ |
| `reveal_contact` | ❌ login_required | ✅ | ✅ | ✅ | ✅ |
| Edit business/products | ❌ | ❌ | ✅ | ❌ | ✅ (status via RPC) |
| Change own status to approved | — | — | ❌ (silently frozen) | — | ✅ via RPC |
| Change own role | — | ❌ | ❌ | — | SQL only |
| Upload to `business-media/<biz>/` | ❌ | ❌ | ✅ | ❌ | ❌ (delete ✅) |
| Review a business | ❌ | ✅ once | ❌ own | ✅ | ✅ |
| Read an enquiry thread | ❌ | own only | own business only | ❌ | ✅ |
| Read notifications | ❌ | own | own | ❌ | own |

## 4. Device matrix

Android Chrome (mid-range phone), iOS Safari (iPhone), desktop Chrome (layout shouldn't break at 1280 px). Check: geolocation prompt, WhatsApp deep link, `tel:` link, image upload from camera/gallery, bottom sheet keyboard behavior, safe areas.

## 5. Performance budget (mobile, 4G)

- First load JS ≤ 250 KB gzipped (lazy-load seller/admin routes and Leaflet).
- Largest Contentful Paint ≤ 2.5 s on Home.
- Images ≤ 200 KB each after compression; `loading="lazy"`.
- Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility.

## 6. Bug triage labels

`blocker` (flow unusable) · `major` (wrong data / security) · `minor` (UI) · `phase-2` (new feature request — logged, not built; SOW §12).
