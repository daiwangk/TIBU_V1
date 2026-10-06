# OG Tag Testing — `/p/:id` and `/b/:slug`

This guide covers how to verify that Cloudflare Pages Functions are injecting
Open Graph tags correctly, both locally and after a preview/production deploy.

---

## 1. Local testing with `wrangler pages dev`

### Prerequisites

```bash
npm install -g wrangler   # one-time; or use npx wrangler
npm run build             # produces dist/ — wrangler serves this
```

Create a `.dev.vars` file at the repo root (git-ignored — never commit it):

```ini
# .dev.vars  — local Pages Functions env vars
SUPABASE_URL=https://YOUR_DEV_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhb...YOUR_DEV_ANON_KEY
SITE_URL=http://localhost:8788
```

### Start the local Pages dev server

```bash
npx wrangler pages dev ./dist --compatibility-date=2024-09-23
# Server starts at http://localhost:8788
```

### curl — check OG tags in the HTML response

**Product page** (replace the UUID with one from your dev seed):

```bash
curl -s http://localhost:8788/p/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  | grep -oP '(?<=<)(meta[^>]+og:[^>]+|title[^>]*>[^<]+)'
```

**Business page** (replace slug with one from your dev seed):

```bash
curl -s http://localhost:8788/b/sweet-crumbs \
  | grep -oP '(?<=<)(meta[^>]+og:[^>]+|title[^>]*>[^<]+)'
```

Expected output should contain lines like:

```
meta property="og:type" content="product">
meta property="og:site_name" content="Tibu">
meta property="og:title" content="Chocolate Truffle Cake · ₹350 — Sweet Crumbs">
meta property="og:description" content="₹350 · Sweet Crumbs, Bandra West">
meta property="og:url" content="http://localhost:8788/p/xxxxxxxx-...">
meta property="og:image" content="https://...supabase.co/storage/v1/...">
meta name="twitter:card" content="summary_large_image">
title>Chocolate Truffle Cake · ₹350 — Sweet Crumbs</title>
```

### curl — check Cache-Control header

```bash
curl -sI http://localhost:8788/p/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  | grep -i cache-control
# Expected: Cache-Control: public, max-age=300
```

### curl — check fallback on invalid id / not-found

```bash
# Invalid format → should return index.html with generic title, no OG product tags
curl -s http://localhost:8788/p/not-a-uuid | grep '<title>'

# Valid UUID but not in DB → same generic fallback
curl -s http://localhost:8788/p/00000000-0000-0000-0000-000000000000 | grep '<title>'
```

Both should return the generic `<title>tibu — local homegrown businesses</title>`.

---

## 2. Preview / production testing with curl

After a Cloudflare Pages deploy, replace `localhost:8788` with your preview or
production URL:

```bash
PREVIEW=https://abc123.tibu-v1.pages.dev

# Product OG tags
curl -s "$PREVIEW/p/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  | grep -oP 'og:[a-z:]+" content="[^"]+'

# Cache-Control header
curl -sI "$PREVIEW/p/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  | grep -i cache-control
```

---

## 3. WhatsApp link-preview test

WhatsApp fetches OG tags on first share; the preview is cached for ~24 h.

**Steps:**

1. Deploy to a Cloudflare Pages **preview** branch (any push to a non-main branch
   creates one automatically).
2. Copy a `/p/<uuid>` or `/b/<slug>` URL from the preview deploy.
3. In WhatsApp on your phone:
   - Open any chat (e.g. "Saved messages" / "Message yourself").
   - Paste the URL and **wait 2–3 seconds** before sending — WhatsApp fetches the
     preview asynchronously.
   - You should see the product/business name, description snippet, and cover image
     in the card below the message.

**If the preview doesn't appear:**

- WhatsApp caches previews aggressively. Try a URL you haven't shared before, or
  append a dummy query param like `?v=2` to bust the cache.
- Make sure the `og:image` URL is publicly accessible (not behind auth) and is
  JPEG/PNG (Supabase Storage public bucket URLs are fine).

---

## 4. Facebook / LinkedIn / Twitter card debuggers

These tools fetch your URL server-side and show the parsed OG tags — useful for
production verification without waiting for WhatsApp:

| Tool | URL |
|---|---|
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/ |
| Twitter (X) Card Validator | https://cards-dev.twitter.com/validator |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/ |
| Open Graph Check (no login) | https://www.opengraph.xyz/ |

Paste your production `/p/<uuid>` or `/b/<slug>` URL into any of these.

---

## 5. Cloudflare Pages env vars to configure

Add these in **Pages → Settings → Environment variables** for both Preview and
Production (use dev Supabase values for Preview, prod values for Production):

| Variable | Example value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | **No** `VITE_` prefix |
| `SUPABASE_ANON_KEY` | `eyJhb...` | Public anon key — safe to expose |
| `SITE_URL` | `https://tibu-v1.pages.dev` | Canonical origin for `og:url` |

> **Note:** These are separate from the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
> / `VITE_SITE_URL` build-time variables. Both sets are needed.
