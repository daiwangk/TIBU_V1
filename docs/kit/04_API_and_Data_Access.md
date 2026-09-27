# 04 · API & Data Access Contract

There is no custom REST server. The frontend talks to Supabase in two ways:

1. **Table queries** via `supabase.from('table')` — simple reads/writes, protected by RLS.
2. **RPC calls** via `supabase.rpc('fn', args)` — search, and anything with cross-table rules.

**Rule:** components never call `supabase` directly. All calls live in `src/api/*.ts` and are wrapped in TanStack Query hooks in `src/api/hooks/*.ts`. That keeps the backend swappable and gives one place to fix bugs.

## 1. Query keys (TanStack Query)

```ts
export const qk = {
  categories: ['categories'] as const,
  businesses: (f: BizFilters) => ['businesses', f] as const,
  products:   (f: ProdFilters) => ['products', f] as const,
  business:   (slug: string) => ['business', slug] as const,
  product:    (id: string) => ['product', id] as const,
  reviews:    (bizId: string) => ['reviews', bizId] as const,
  me:         ['me'] as const,
  saved:      ['saved'] as const,
  recent:     ['recent'] as const,
  connected:  ['connected'] as const,
  enquiries:  (as: 'customer'|'seller') => ['enquiries', as] as const,
  thread:     (id: string) => ['thread', id] as const,
  unread:     ['unread'] as const,
  notifications: ['notifications'] as const,
  myBusiness: ['myBusiness'] as const,
  myStats:    ['myStats'] as const,
  admin:      (status: string) => ['admin', status] as const,
};
```

Defaults: `staleTime: 60_000` for discovery, `0` for inbox/unread, `refetchOnWindowFocus: true`, `unread` polls every 60 s while logged in.

## 2. Screen → data map

| Screen / section | Call | Notes |
|---|---|---|
| Category chips | `from('categories').select('id,slug,name,icon,parent_id').order('sort_order')` | cache 1 h |
| Home · New Businesses | `rpc('search_businesses', { p_lat, p_lng, p_sort:'newest', p_limit:10 })` | lat/lng optional |
| Home · New Products | `rpc('search_products', { p_lat, p_lng, p_sort:'newest', p_limit:10 })` | |
| Home · Available Today | `rpc('search_products', { p_available_today:true, p_sort:'distance', p_limit:10 })` (+ businesses variant) | |
| Home · Near you | `rpc('search_businesses', { p_lat, p_lng, p_sort:'distance' })` | only if location known |
| Search page | both RPCs with `p_query`, `p_category`, price range, `p_radius_km` | tabs: Products / Businesses; infinite scroll via `p_offset` |
| Category page `/category/:slug` | same RPCs with `p_category: slug` | children included automatically |
| Business page `/b/:slug` | `from('businesses').select('*, categories(slug,name), business_images(url,sort_order), business_videos(*), products(id,name,price_paise,available_today,product_images(url,sort_order))').eq('slug', slug).single()` | then `rpc('track_view', { p_business: id })` if logged in |
| Reviews tab | `from('reviews').select('id,reviewer_name,rating,body,created_at').eq('business_id', id).order('created_at', {ascending:false}).range(0,19)` | |
| Product page `/p/:id` | `from('products').select('*, product_images(url,sort_order), businesses(id,slug,name,logo_url,locality,rating_avg,rating_count)').eq('id', id).single()` | then `track_view` |
| Call / WhatsApp buttons | `rpc('reveal_contact', { p_business, p_channel, p_product })` | `login_required` → open login sheet |
| Enquiry box (customer) | `rpc('send_enquiry', { p_business, p_body, p_product })` → returns enquiry id | |
| Profile | `from('profiles').select('*').eq('id', uid).single()`; update: `.update({ full_name, phone, home_* })` | |
| Saved | `from('saved_businesses').select('created_at, businesses(id,slug,name,logo_url,locality,rating_avg)')` and products equivalent | toggle = insert / delete |
| Recently viewed | `from('recent_views').select('viewed_at, businesses(id,slug,name,logo_url), products(id,name,price_paise,product_images(url))').order('viewed_at',{ascending:false}).limit(20)` | guests: localStorage |
| Previously connected | `rpc('my_connected_businesses')` | |
| My enquiries | `rpc('my_enquiries', { p_as:'customer' \| 'seller' })` | |
| Thread | `from('enquiry_messages').select('*').eq('enquiry_id', id).order('created_at')`; on open `rpc('mark_enquiry_read', { p_enquiry: id })` | |
| Reply | `from('enquiry_messages').insert({ enquiry_id, sender_id: uid, body })` | |
| Badges | `rpc('unread_counts')` → `{ notifications, enquiries }` | poll 60 s |
| Notifications | `from('notifications').select('*').order('created_at',{ascending:false}).limit(50)`; mark read: `.update({ read_at: new Date().toISOString() }).eq('id', n.id)` | |
| Seller: my business | `from('businesses').select('*, business_contacts(*), business_images(*), business_videos(*)').eq('owner_id', uid).maybeSingle()` | null → onboarding |
| Seller: create business | `from('businesses').insert({ owner_id: uid, slug, name, category_id, lat, lng, … })` | status forced `draft` |
| Seller: contacts | `from('business_contacts').upsert({ business_id, phone, whatsapp })` | |
| Seller: products CRUD | `from('products').insert/update/delete` + `product_images` | |
| Seller: submit | `rpc('submit_business_for_review')` | error `incomplete_application:logo,location` → show checklist |
| Seller: toggle Available Today | `from('businesses').update({ available_today: true })` / products | |
| Seller: stats | `rpc('my_business_stats')` | |
| Admin: list | `rpc('admin_list_businesses', { p_status: 'pending' })` | includes phone, WhatsApp, IG, email |
| Admin: decide | `rpc('admin_set_business_status', { p_business, p_status, p_reason })` | reason required for reject/unpublish |
| Become seller (existing customer) | `rpc('become_seller')` then refetch `me` | |

## 3. RPC reference

| RPC | Auth | Args | Returns | Errors |
|---|---|---|---|---|
| `search_businesses` | public | `p_lat, p_lng, p_radius_km=15, p_category, p_query, p_available_today=false, p_sort='distance'\|'newest'\|'rating', p_limit≤50, p_offset` | rows incl. `distance_m` | — |
| `search_products` | public | as above + `p_min_price_paise, p_max_price_paise`, sort `'price_asc'\|'price_desc'` | rows incl. `image_url`, `business_*`, `distance_m` | — |
| `reveal_contact` | login | `p_business, p_channel, p_product?` | `{phone, whatsapp}` | `login_required`, `business_not_available`, `rate_limited` |
| `track_view` | login (no-op for guests) | `p_business` xor `p_product` | void | — |
| `my_connected_businesses` | login | `p_limit=20` | rows | — |
| `send_enquiry` | login | `p_business, p_body, p_product?` | enquiry uuid | `login_required`, `rate_limited`, `cannot_enquire_own_business` |
| `mark_enquiry_read` | participant | `p_enquiry` | void | `not_found` |
| `my_enquiries` | login | `p_as` | rows with `unread` | — |
| `unread_counts` | login | — | `{notifications, enquiries}` | — |
| `become_seller` | login | — | void | — |
| `submit_business_for_review` | seller | — | `'pending'` | `incomplete_application:<fields>`, `invalid_status:<s>` |
| `my_business_stats` | seller | — | counts | — |
| `admin_list_businesses` | admin | `p_status?` (null = all) | rows | `forbidden` |
| `admin_set_business_status` | admin | `p_business, p_status, p_reason?` | void | `forbidden`, `invalid_transition`, `reason_required` |

Error handling: use `rpcErrorCode(error)` from `src/lib/supabase.ts` to map to UI messages.

## 4. Writing locations

The app always writes **`lat` and `lng`** columns (numbers). Never write `location` directly — a trigger builds it. Watch the order: PostGIS points are **(lng, lat)**, but you never need to deal with that outside SQL.

## 5. Types

```bash
npx supabase gen types typescript --project-id <dev-ref> > src/types/database.ts
```

Add as `npm run gen:types`. Run after every migration and commit the result. RPC arg/return types are generated too.

## 6. Auth calls

```ts
// Customer signup
await supabase.auth.signUp({ email, password, options: {
  data: { full_name, signup_as: 'customer' },
  emailRedirectTo: `${SITE}/auth/callback`,
}});
// Seller signup: signup_as: 'seller'
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${SITE}/auth/reset` });
await supabase.auth.updateUser({ password: newPassword });   // on /auth/reset
await supabase.auth.signOut();
supabase.auth.onAuthStateChange((_e, session) => { /* update auth store, invalidate qk.me */ });
```
