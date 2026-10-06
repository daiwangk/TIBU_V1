# Link previews (Open Graph) — how to test

Task A2.3, decision D19. When someone pastes `https://<site>/p/<product-uuid>` or `https://<site>/b/<business-slug>` into WhatsApp, WhatsApp fetches the page and builds the preview card from its Open Graph tags. The SPA serves one `index.html` for every URL, so two Cloudflare Pages Functions add per-item tags before the app boots:

- `functions/p/[id].ts` — product: title = name, description = `₹350 · Seller, Locality`, image = first product photo (falls back to the seller logo)
- `functions/b/[slug].ts` — business: title = name, description = `Category · Locality — about text`, image = banner (falls back to the logo)
- `functions/_lib/og.ts` — shared helpers (validation, formatting, escaping, the HTMLRewriter step)

Both read the item with the **public anon key** over the REST API (RLS decides what anon can see: approved businesses, active products). They never touch `business_contacts`. A bad id, an unapproved or missing item, a Supabase error or a timeout all return the untouched `index.html` with a 200 — the app then shows its own not-found state. The functions never return a 5xx of their own.

## Cloudflare settings (Pages → Settings → Variables and Secrets)

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | runtime variable (not `VITE_`) — set for Production and Preview |
| `SUPABASE_ANON_KEY` | the anon / publishable key | public by design; still never the service-role key |
| `SITE_URL` | `https://tibu-v1.pages.dev` (later her domain) | used for `og:url`; if empty the request's own origin is used |

These are separate from the `VITE_*` build variables. Pages Functions read runtime variables, so no rebuild is needed after changing them (a new deployment is).

## 1. Automated checks (no network)

```bash
npx vitest run functions
```
Covers id/slug validation, rupee formatting, escaping, fallbacks for missing image/locality/seller, absolute image URLs and `SITE_URL` handling.

## 2. Run the real functions locally against a stand-in database

`wrangler` runs the same runtime Cloudflare uses. Point it at any server that answers the two REST calls (a real dev project, or a tiny stub):

```bash
npm run build
npx wrangler@4 pages dev dist --port 8788 \
  --binding SUPABASE_URL=https://<dev-ref>.supabase.co \
  --binding SUPABASE_ANON_KEY=<anon key> \
  --binding SITE_URL=http://127.0.0.1:8788
```
Then, in another terminal (use a real approved product id and business slug from the seed):

```bash
curl -s -A "WhatsApp/2.23.20" http://127.0.0.1:8788/p/<seeded-uuid> | grep -oE '<(title|meta)[^>]*(og:|twitter:|description)[^>]*>|<title>[^<]*'
curl -s -A "WhatsApp/2.23.20" http://127.0.0.1:8788/b/<seeded-slug> | grep -oE '<meta[^>]*og:[^>]*>'
```
Expected for a product: `og:type=product`, `og:title` (name), `og:description` (`₹350 · Seller, Locality`), `og:image` (absolute), `og:url`, `twitter:card=summary_large_image`, and the response header `Cache-Control: public, max-age=300`.

Negative cases — each must return the normal app shell (`<div id="root">`, title "tibu — local homegrown businesses"), HTTP 200, and must **not** call the database when the id is malformed:

```bash
curl -si http://127.0.0.1:8788/p/not-a-uuid | head -1                 # 200, plain shell
curl -si http://127.0.0.1:8788/p/22222222-2222-4222-8222-222222222222 | head -1   # unknown product → plain shell
curl -si http://127.0.0.1:8788/b/BAD_slug | head -1                    # invalid slug → plain shell
```
(`.wrangler/` is the local cache; it is git-ignored.)

## 3. On the Cloudflare preview / production

```bash
curl -s -A "WhatsApp/2.23.20" https://<preview-host>/p/<seeded-uuid> | grep -E "og:(title|image|description)"
curl -s -A "WhatsApp/2.23.20" https://<preview-host>/b/<seeded-slug>  | grep -E "og:(title|image|description)"
```
The page must still boot in a normal browser (open the same URL in Chrome).

## 4. WhatsApp itself (needs two real phones)

1. Open the product on the preview, tap Share / copy the link.
2. Paste it into a chat with yourself on **Android and iPhone**. A card with the image, name and price should appear.
3. WhatsApp caches previews per URL. After any change, test with `?v=2`, `?v=3`… appended. (`og:url` ignores the query on purpose, so the canonical link stays clean.)
4. Sellers share the same links, so also test one **real uploaded** product photo once Week 4 uploads exist. If seeded picsum JPEGs preview but uploaded WebP images do not, apply D18 (store a JPEG cover) in A4.2.

Tips: WhatsApp needs the image to be `https`, reachable without cookies and reasonably small (under about 300 KB is safest; larger often still works but can be skipped on slow connections). The Facebook Sharing Debugger (`developers.facebook.com/tools/debug`) shows exactly what a scraper sees and can force a re-scrape.

## What was verified (6 Oct 2026)

Run locally with `wrangler pages dev` against a stand-in PostgREST server: product and business pages returned the expected tags (HTML-special characters in the product name were escaped, the Indian rupee format showed `₹1,250`, `og:url` came from `SITE_URL` with the query string dropped), `Cache-Control: public, max-age=300` was set on enriched responses, and malformed ids / unknown items / a 500 from the database all produced the plain shell with a 200. The request log showed the anon key being sent and the product query filtering `is_active` and `businesses.status=approved`. **Not yet verified:** a real Cloudflare deployment and WhatsApp on a phone (needs the Pages project from A1.6 and the SUPABASE_*/SITE_URL variables).
