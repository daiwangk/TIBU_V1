# 04 · Service contract v1.1 (copy to the repo as docs/CONTRACT.md)

> v1.1 (27 Sep 2026): reconciled against the dev kit's real migrations and tested on Postgres + PostGIS — see `09_SQL_RECONCILIATION.md`. Changes from v1.0: sort values, `approvedAt`, radius/limit/availableToday rules, enquiry functions, unread counts, stats, admin rows, and new §11–§13.

This is the seam between the frontend and the backend. Pages are built against it on mock data first; the Supabase adapter implements the same functions later. **If the SQL can't support a field, change this file in a PR first — never invent fields in code.**

## 1. Global rules

1. Every function is `async` and returns plain JS objects with **camelCase** keys. No raw DB rows leave an adapter.
2. `get*` functions return `null` when the thing doesn't exist or isn't visible (e.g. not approved). They don't throw for "not found".
3. Errors are thrown as `AppError` (`src/services/errors.js`) with one of these `code`s: `auth_required`, `forbidden`, `not_found`, `rate_limited`, `validation`, `conflict`, `business_not_available`, `unavailable_in_mock`, `config`, `network`, `unknown`. The mapping from SQL errors is §11. `message` is safe to show to a user; `cause` holds the original error.
4. **Money:** `price` is an integer number of rupees (`350` = ₹350). The Supabase adapter converts `price_paise / 100` on read and `price * 100` on write.
5. **Distance:** `distanceM` is metres (number) or `null` when no search origin is set.
6. **Images:** URLs or `null`. Never emoji. Lists of images are sorted; index 0 is the cover.
7. **Phones never appear** in any shape except `ContactInfo` (from `revealContact`) and the owner/admin shapes in §5 and §6.
8. **IDs:** `id` is an opaque string (uuid in Supabase, readable string in mock). Businesses also have `slug` (URL). Products are addressed by `id`.
9. Lists take `{ limit = 20, offset = 0 }` and return arrays. **The search RPCs cap `limit` at 50.** "Load more" = the next page with `offset + limit` (TanStack `useInfiniteQuery`); never grow `limit`.
10. Dates are ISO strings.

## 2. Categories (slugs = DB seed; verify against `supabase/migrations/*_seed_categories.sql`)

| slug | name | parent |
|---|---|---|
| `desserts` | Desserts | — |
| `food` | Home Food | — |
| `handmade` | Handmade | — |
| `crochet` | Crochet | handmade |
| `embroidery` | Embroidery | handmade |
| `resin-art` | Resin Art | handmade |
| `candles` | Candles | handmade |
| `fashion` | Fashion | — |
| `womens-fashion` | Women's Fashion | fashion |
| `mens-fashion` | Men's Fashion | fashion |
| `jewellery` | Jewellery | — |
| `gifts` | Gifts | — |

Filtering by a parent slug includes its children.

```js
/** @typedef {{ slug: string, name: string, parentSlug: string|null, sortOrder: number }} Category */
```

## 3. Public catalog shapes

```js
/** @typedef {{ id: string, url: string }} Image */
/** @typedef {{ id: string, instagramUrl: string, shortcode: string, caption: string }} Video */

/**
 * @typedef {Object} BusinessSummary
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} categorySlug
 * @property {string} categoryName
 * @property {string|null} logoUrl
 * @property {string|null} bannerUrl
 * @property {string} locality          e.g. "Bandra West"
 * @property {string} city              e.g. "Mumbai"
 * @property {number|null} distanceM
 * @property {number} rating            0–5, one decimal (0 when no reviews)
 * @property {number} reviewCount
 * @property {boolean} availableToday
 * @property {boolean} deliveryAvailable
 * @property {boolean} pickupAvailable
 * @property {string|null} approvedAt   when it went live (search RPC returns approved_at, not created_at)
 */

/** @typedef {{ id: string, slug: string, name: string, logoUrl: string|null, locality: string }} BusinessRef */

/**
 * @typedef {BusinessSummary & {
 *   description: string,
 *   addressText: string,
 *   images: Image[],          // gallery, excluding logo/banner
 *   videos: Video[],
 *   products: ProductSummary[] // active products only — mapper filters is_active (owners would otherwise see inactive ones)
 * }} BusinessDetail
 * distanceM on detail shapes is computed in the adapter with haversine from the business lat/lng when `near` is given (table selects don't return a distance).
 */

/**
 * @typedef {Object} ProductSummary
 * @property {string} id
 * @property {string} name
 * @property {number} price             integer rupees
 * @property {string|null} imageUrl     cover image
 * @property {string} categorySlug      product override or the business's category
 * @property {boolean} availableToday
 * @property {string} businessId
 * @property {string} businessSlug
 * @property {string} businessName
 * @property {string|null} businessLogoUrl
 * @property {number} businessRating    the business's rating_avg
 * @property {string} locality
 * @property {number|null} distanceM
 * @property {string} createdAt
 */

/**
 * @typedef {ProductSummary & {
 *   description: string,
 *   images: Image[],
 *   details: Array<{ label: string, value: string }>,  // from products.details jsonb
 *   business: BusinessSummary
 * }} ProductDetail
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} businessId
 * @property {string} reviewerName      first-name snapshot
 * @property {number} rating            1–5 integer
 * @property {string} body
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {boolean} isMine
 */

/**
 * @typedef {Object} SearchParams
 * @property {string} [q]
 * @property {string} [category]        slug; parent includes children
 * @property {boolean} [availableToday]  adapter ALWAYS sends true/false — SQL treats null as "only available today"
 * @property {'distance'|'newest'|'rating'|'price_asc'|'price_desc'} [sort]
 *   SQL values, passed through unchanged (unknown values are silently ignored by SQL).
 *   Businesses: distance | newest | rating. Products: distance | newest | price_asc | price_desc.
 *   Default: 'distance' when near is set, else 'newest'.
 * @property {{lat:number,lng:number}|null} [near]
 * @property {number|null} [radiusKm]    undefined → SQL default 15 km (only applies when near is set);
 *                                       null → no distance limit (distanceM still returned)
 * @property {number} [minPrice]        products only, rupees
 * @property {number} [maxPrice]        products only, rupees
 * @property {string} [businessId]      products only
 * @property {number} [limit]
 * @property {number} [offset]
 */
```

## 4. Account, contact, retention shapes

```js
/** @typedef {{ userId: string, email: string } | null} Session */
/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {'customer'|'seller'|'admin'} role
 * @property {string} fullName
 * @property {string|null} phone
 * @property {string|null} avatarUrl
 * @property {string|null} homeLocality
 * @property {number|null} homeLat
 * @property {number|null} homeLng
 * @property {boolean} notifyDigest
 */
/** @typedef {{ phone: string|null, whatsapp: string|null }} ContactInfo   10-digit Indian mobiles */
/** @typedef {{ businessIds: string[], productIds: string[] }} SavedIds */
/** @typedef {{ id: string, name: string, price: number, imageUrl: string|null }} ProductRef */
/** @typedef {{ kind: 'business'|'product', viewedAt: string, business?: BusinessRef, product?: ProductRef }} RecentItem */
/** @typedef {{ channel: 'whatsapp'|'call', contactedAt: string, business: BusinessRef }} ConnectedItem   // from my_connected_businesses(); no product */
```

## 5. Seller shapes

```js
/**
 * @typedef {BusinessDetail & {
 *   status: 'draft'|'pending'|'approved'|'rejected'|'unpublished',
 *   rejectionReason: string|null,
 *   submittedAt: string|null,
 *   approvedAt: string|null,
 *   instagramHandle: string|null,
 *   lat: number|null, lng: number|null,
 *   contacts: ContactInfo|null,
 *   products: MyProduct[]          // includes inactive
 * }} MyBusiness
 */
/**
 * @typedef {Object} BusinessInput
 * @property {string} name  @property {string} description  @property {string} categorySlug
 * @property {string} addressText  @property {string} locality  @property {string} city
 * @property {number|null} lat  @property {number|null} lng  @property {string} instagramHandle
 * @property {boolean} deliveryAvailable  @property {boolean} pickupAvailable
 */
/** @typedef {ProductDetail & { isActive: boolean, sortOrder: number }} MyProduct */
/**
 * @typedef {Object} ProductInput
 * @property {string} [id]  omit to create
 * @property {string} name  @property {number} price  (integer rupees)
 * @property {string} description  @property {string|null} categorySlug
 * @property {Array<{label:string,value:string}>} details
 * @property {boolean} availableToday  @property {boolean} isActive
 */
/**
 * @typedef {{ ok: boolean, missing: Array<{ key: string, label: string, step: number }> }} SubmitChecklist
 * Keys are exactly what submit_business_for_review() checks: category, description, logo, location,
 * instagram_handle, contacts, at_least_one_product. The UI additionally requires one product image (D29):
 * key product_image.
 */
/** @typedef {{ contacts7d: number, contacts30d: number, whatsapp30d: number, calls30d: number, saves: number, openEnquiries: number, rating: number, reviewCount: number }} SellerStats   // my_business_stats() */
```

## 6. Admin, enquiry, notification shapes

```js
/**
 * @typedef {Object} ApplicationRow   // admin_list_businesses() columns
 * @property {string} businessId  @property {string} name  @property {string} slug
 * @property {MyBusiness['status']} status  @property {string|null} categoryName
 * @property {string|null} ownerName  @property {string} ownerEmail
 * @property {string|null} phone  @property {string|null} whatsapp  @property {string|null} instagramHandle
 * @property {string|null} locality  @property {string|null} submittedAt  @property {number} productCount
 */
/**
 * @typedef {Object} ApplicationDetail
 * @property {MyBusiness} business          // admin can read any business, its contacts, images, videos, products
 * @property {ApplicationRow} row           // owner name/email and contacts come from admin_list_businesses()
 * @property {Array<{ action: 'approve'|'reject'|'unpublish'|'republish', reason: string|null, adminName: string|null, createdAt: string }>} history
 */
/**
 * @typedef {Object} EnquiryThread   // my_enquiries(p_as) columns
 * @property {string} id  @property {string} businessId  @property {string} businessName
 * @property {string} customerName   // sellers can't read customer profiles directly (RLS); this is the only source
 * @property {string|null} productId  @property {string|null} productName
 * @property {'open'|'closed'} status  @property {string} lastMessageAt
 * @property {string} lastMessagePreview  @property {number} unreadCount   // unread for the viewer
 */
/** @typedef {{ thread: EnquiryThread & { businessSlug: string, businessLogoUrl: string|null }, messages: EnquiryMessage[] }} ThreadDetail */
/** @typedef {{ id: string, threadId: string, fromMe: boolean, body: string, createdAt: string, readAt: string|null }} EnquiryMessage */
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'enquiry_new'|'enquiry_reply'|'business_approved'|'business_rejected'|'business_unpublished'|'review_new'|'digest_new_businesses'} type
 * @property {string} title  @property {string} body  @property {string|null} link   // in-app route
 * @property {string} createdAt  @property {string|null} readAt
 */
```

## 7. Functions (all exported from `src/services/index.js`)

| Module | Function | Returns | Auth | In mock? |
|---|---|---|---|---|
| categories | `listCategories()` | `Category[]` | — | ✅ |
| | `getCategory(slug)` | `Category\|null` | — | ✅ |
| catalog | `searchBusinesses(params: SearchParams)` | `BusinessSummary[]` | — | ✅ |
| | `searchProducts(params: SearchParams)` | `ProductSummary[]` | — | ✅ |
| | `getBusinessBySlug(slug, { near })` | `BusinessDetail\|null` | — | ✅ |
| | `getProductById(id, { near })` | `ProductDetail\|null` | — | ✅ |
| reviews | `listReviews(businessId, { limit, offset })` | `Review[]` | — | ✅ |
| | `getMyReview(businessId)` | `Review\|null` | user | ❌ |
| | `saveMyReview({ businessId, rating, body })` | `Review` | user | ❌ |
| | `deleteMyReview(businessId)` | `void` | user | ❌ |
| auth | `getSession()` | `Session` | — | ❌ |
| | `onAuthChange(callback(session))` | `unsubscribe()` | — | ❌ |
| | `signUp({ email, password, fullName, signupAs })` | `{ needsEmailConfirmation: boolean }` | — | ❌ |
| | `signIn({ email, password })` | `Session` | — | ❌ |
| | `signOut()` · `sendPasswordReset(email)` · `updatePassword(newPassword)` | `void` | — / user | ❌ |
| me | `getMe()` | `Profile\|null` | user | ❌ |
| | `updateMe(patch)` (fullName, phone, avatarUrl, homeLocality, homeLat, homeLng, notifyDigest — never role) | `Profile` | user | ❌ |
| | `uploadAvatar(file)` | `string` (url) | user | ❌ |
| contact | `revealContact({ businessId, channel, productId })` | `ContactInfo` | user | ❌ |
| saved | `getSavedIds()` | `SavedIds` | user | ❌ |
| | `listSavedBusinesses()` · `listSavedProducts()` | `BusinessSummary[]` · `ProductSummary[]` | user | ❌ |
| | `setSaved({ kind, id, saved })` | `void` | user | ❌ |
| activity | `trackView({ kind, id })` | `void` | user | ❌ |
| | `listRecent({ limit })` · `listConnected({ limit })` | `RecentItem[]` · `ConnectedItem[]` | user | ❌ |
| seller | `becomeSeller()` | `Profile` | user | ❌ |
| | `getMyBusiness()` | `MyBusiness\|null` | seller | ❌ |
| | `saveMyBusiness(input: BusinessInput)` | `MyBusiness` (creates draft with generated slug if none) | seller | ❌ |
| | `saveMyContacts({ phone, whatsapp })` | `ContactInfo` | seller | ❌ |
| | `uploadBusinessImage({ kind: 'logo'\|'banner'\|'gallery', file })` | `Image` | seller | ❌ |
| | `removeBusinessImage(imageId)` | `void` | seller | ❌ |
| | `listMyProducts()` | `MyProduct[]` | seller | ❌ |
| | `saveProduct(input: ProductInput)` · `deleteProduct(id)` | `MyProduct` · `void` | seller | ❌ |
| | `uploadProductImage(productId, file)` · `removeProductImage(imageId)` | `Image` · `void` | seller | ❌ |
| | `addVideo({ instagramUrl, caption })` · `removeVideo(id)` | `Video` · `void` | seller | ❌ |
| | `getSubmitChecklist()` · `submitForReview()` | `SubmitChecklist` · `MyBusiness` (errors: `validation` with `missing`, `conflict` for invalid status) | seller | ❌ |
| | `setAvailableToday({ kind: 'business'\|'product', id, value })` | `void` | seller | ❌ |
| | `getMyStats()` | `SellerStats` | seller | ❌ |
| admin | `listApplications({ status })` (`null` = all; no pagination) | `ApplicationRow[]` | admin | ❌ |
| | `getApplication(businessId)` | `ApplicationDetail\|null` | admin | ❌ |
| | `decideApplication({ businessId, action: 'approve'\|'reject'\|'unpublish'\|'republish', reason })` → `admin_set_business_status` with approve/republish → `approved`, reject → `rejected`, unpublish → `unpublished`. Allowed: pending→approved/rejected, approved→unpublished, unpublished→approved, rejected→approved. Reason required for reject/unpublish | `void` | admin | ❌ |
| enquiries | `sendEnquiry({ businessId, productId, body })` — customer's first message and follow-ups (`send_enquiry`: creates or reuses the one thread per customer+business, rate-limited) | `string` (threadId) | customer | ❌ |
| | `findMyThread(businessId)` | `string\|null` (threadId) | customer | ❌ |
| | `listMyThreads({ as: 'customer'\|'seller' })` | `EnquiryThread[]` | user | ❌ |
| | `getThread(threadId, { as })` | `ThreadDetail\|null` | participant | ❌ |
| | `sendMessage({ threadId, body })` — seller replies (direct insert under RLS) | `EnquiryMessage` | participant | ❌ |
| | `markThreadRead(threadId)` (`mark_enquiry_read`; also clears that thread's notifications) | `void` | participant | ❌ |
| notifications | `listNotifications({ limit, offset })` | `Notification[]` | user | ❌ |
| | `markNotificationsRead(ids \| 'all')` (only `read_at` is writable) | `void` | user | ❌ |
| | `getUnreadCounts()` (`unread_counts`) | `{ notifications: number, enquiries: number }` — enquiries counts both roles | user | ❌ |

Mock functions marked ❌ throw `AppError('unavailable_in_mock')`. The contract test (`src/services/contract.test.js`) checks that both adapters export every name in `FUNCTION_NAMES`.

## 8. Code skeletons (copy these; don't redesign them)

```js
// src/services/errors.js
export class AppError extends Error {
  /** @param {string} code @param {string} message @param {unknown} [cause] */
  constructor(code, message, cause) { super(message); this.name = 'AppError'; this.code = code; this.cause = cause; }
}
export const isAppError = (e) => e instanceof AppError;
```

```js
// src/services/index.js — the only module queries import
import * as mock from './mock/index.js';
import * as supabase from './supabase/index.js';
const impl = import.meta.env.VITE_DATA_SOURCE === 'supabase' ? supabase : mock;
export const dataSource = impl === supabase ? 'supabase' : 'mock';
export const { listCategories, getCategory, searchBusinesses, searchProducts, getBusinessBySlug,
  getProductById, listReviews /* …every name in FUNCTION_NAMES… */ } = impl;
```

```js
// src/queries/keys.js — params always inside the key so changes refetch
export const qk = {
  categories: ['categories'],
  businesses: (params) => ['businesses', params],
  products: (params) => ['products', params],
  business: (slug, near) => ['business', slug, near ?? null],
  product: (id, near) => ['product', id, near ?? null],
  reviews: (businessId, page) => ['reviews', businessId, page],
  me: ['me'], saved: ['saved'], recent: ['recent'], connected: ['connected'],
  myBusiness: ['myBusiness'], myProducts: ['myProducts'],
  applications: (status) => ['applications', status], application: (id) => ['application', id],
  threads: (as) => ['threads', as], thread: (id) => ['thread', id], myThread: (businessId) => ['myThread', businessId],
  notifications: ['notifications'], unread: ['unread'], myStats: ['myStats'],
};
```

## 9. Formatting helpers (`src/lib/format.js`)

| Function | Example |
|---|---|
| `formatPrice(350)` | `₹350` · `formatPrice(1250)` → `₹1,250` (`Intl.NumberFormat('en-IN')`, no decimals) |
| `formatDistance(m)` | `< 1000` → `"800 m"` (rounded to 100 m); else `"2.4 km"`; `null` → `""` |
| `formatRating(4.25)` | `"4.3"`; 0 reviews → `"New"` |
| `formatRelativeTime(iso)` | `"just now"`, `"5 min ago"`, `"3 h ago"`, `"2 d ago"`, then `"12 Oct"` |

## 10. WhatsApp message (`src/lib/whatsapp.js`, SOW §3)

- `normalizeIndianMobile('98765 43210')` → `'919876543210'`; invalid → `null`.
- `productMessage({ name, price }, url)` →
  `Hi! I discovered your business through Tibu and I'm interested in your Chocolate Chunk Cookies (₹350). I'd like to know more.` + newline + `https://<site>/p/<id>`
- `businessMessage({ name }, url)` → `Hi! I discovered <name> through Tibu and I'd like to know more.` + newline + `https://<site>/b/<slug>`
- `whatsappLink(number, text)` → `https://wa.me/91XXXXXXXXXX?text=<encodeURIComponent(text)>`
- `callLink(number)` → `tel:+91XXXXXXXXXX`

## 11. Error mapping (SQL → `AppError.code`) — implement in `src/services/supabase/errors.js`

Match on the **message prefix first** (several share an errcode), then the code.

| SQL raises (message / errcode) | Raised by | `code` | User message |
|---|---|---|---|
| `login_required` / 28000 | reveal_contact, send_enquiry, become_seller | `auth_required` | (open the login sheet, no toast) |
| `business_not_available` / P0002 | reveal_contact, send_enquiry | `business_not_available` | "This business isn't available right now" |
| `rate_limited` / 53400 | reveal_contact (60/h), send_enquiry (20/h) | `rate_limited` | "Too many requests — try again in a bit" |
| `forbidden` / 42501, `role_change_not_allowed`, RLS "new row violates row-level security" | admin RPCs, profile guard, writes | `forbidden` | "You don't have access to that" |
| `cannot_enquire_own_business` | send_enquiry | `forbidden` | "You can't send an enquiry to your own business" |
| `not_found`, `no_business`; PostgREST `PGRST116` on `.single()` | mark_enquiry_read, admin, submit | `not_found` (get* functions return `null` instead) | — |
| `incomplete_application:<keys>` | submit_business_for_review | `validation`, with `cause.missing = keys.split(',')` | show the checklist |
| `reason_required` | admin_set_business_status | `validation` | "Add a reason" |
| `invalid_status:<s>`, `invalid_transition:<a>-><b>` | submit, admin | `conflict` | "That action isn't possible in the current status" |
| 23505 unique violation | slug, video shortcode, saved/review duplicates | `conflict` | e.g. "This reel is already added" |
| 23514 check violation, 22P02 bad input | phone/IG/slug/length checks | `validation` | field-level message from §12 |
| fetch/network failure | any | `network` | "You're offline — check your connection" |
| anything else | — | `unknown` | "Something went wrong" |

## 12. Validation limits (mirror the CHECK constraints in the UI)

| Field | Rule |
|---|---|
| Phone, WhatsApp (contacts), profile phone | 10 digits, `^[6-9][0-9]{9}$` (store without +91) |
| Instagram handle | `^[A-Za-z0-9._]{1,30}$` — strip a leading `@` and any `instagram.com/` URL first |
| Slug | `^[a-z0-9-]+$`, unique (generated: slugified name + `-` + 4 base36 chars) |
| Business name / description / address | 2–80 / ≤ 2000 / ≤ 300 chars |
| Product name / description / price | 2–100 / ≤ 2000 / 0 – ₹10,00,000 (`price_paise ≤ 100000000`) |
| Video | shortcode `^[A-Za-z0-9_-]{5,40}$`, unique per business; caption ≤ 200 |
| Review | rating 1–5 integer; body ≤ 1000; one per customer per business; not on your own business |
| Enquiry message | 1–2000 chars after trim |
| Full name | ≤ 80 chars |
| Creating a business | profile role must be `seller` (call `becomeSeller()` first) |

## 13. Storage (from 0005)

| Bucket | Limit | Types | Path (first folder is enforced by policy) |
|---|---|---|---|
| `business-media` (public read) | 3 MB | webp, jpeg, png | `{businessId}/logo-<ts>.webp`, `{businessId}/banner-<ts>.webp`, `{businessId}/gallery/<uuid>.webp`, `{businessId}/products/{productId}/<uuid>.webp` |
| `avatars` (public read) | 1 MB | webp, jpeg, png | `{userId}/<uuid>.webp` |

The business row must exist (draft is fine) before any upload — the policy checks `owns_business(first folder)`. The onboarding wizard therefore saves step 1 before the branding step.

## 14. In-app routes the database writes into notifications (must exist exactly)

`/seller` (approval/rejection/unpublish) · `/seller/reviews` (new review) · `/seller/enquiries/<id>` (new enquiry) · `/enquiries/<id>` (seller replied) · `/search?tab=businesses&sort=newest` (digest).
