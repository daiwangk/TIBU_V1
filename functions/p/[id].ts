// functions/p/[id].ts — Cloudflare Pages Function
// Why: WhatsApp/social crawlers build link previews from Open Graph tags. A plain
// SPA serves the same generic tags for every URL, so the buyer never sees the
// product image or name in the preview. This function fetches the product row from
// Supabase (anon key, RLS-filtered to approved businesses + active products only),
// injects per-product OG tags via HTMLRewriter, then returns the full index.html so
// the React SPA boots normally in the browser.
//
// Env vars (Cloudflare Pages → Settings → Environment variables):
//   SUPABASE_URL       – e.g. https://xxxx.supabase.co   (no VITE_ prefix)
//   SUPABASE_ANON_KEY  – public anon key
//   SITE_URL           – canonical origin, e.g. https://tibu-v1.pages.dev
//   ASSETS             – bound automatically by Pages runtime

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Canonical origin (no trailing slash). Falls back to request origin. */
  SITE_URL?: string;
  /** Pages static-asset fetcher, bound automatically. */
  ASSETS: Fetcher;
}

/** UUID v4 pattern — 8-4-4-4-12 hex digits. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Escape HTML special characters for safe injection into tag attributes/content. */
const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Convert paise (integer) to a rupee string like "₹1,250". */
const rupeesFromPaise = (paise: number): string =>
  `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;

  // 1. Fetch the unmodified SPA shell — always returned on any error/not-found.
  //    We fetch `/` so Cloudflare Pages resolves it through its own routing rules.
  const shellResponse = await env.ASSETS.fetch(new URL('/', request.url));

  try {
    // 2. Validate the id format before hitting the database.
    const id = String(params.id);
    if (!UUID_RE.test(id)) return withCacheHeaders(shellResponse.clone());

    // 3. Fetch only the columns we need. RLS ensures anon can only see active
    //    products that belong to approved businesses. We add explicit filters as
    //    belt-and-braces, but RLS is the true guard.
    const apiUrl =
      `${env.SUPABASE_URL}/rest/v1/products` +
      `?id=eq.${encodeURIComponent(id)}` +
      `&is_active=eq.true` +
      `&select=name,price_paise,description,product_images(url,sort_order),businesses(name,slug,locality)` +
      `&limit=1`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    const rows: any[] = apiRes.ok ? await apiRes.json() : [];
    const product = rows[0];

    // 4. On not-found or error, return the plain shell so the SPA renders its
    //    own not-found state. Never return a 5xx.
    if (!product) return withCacheHeaders(shellResponse.clone());

    // 5. Derive OG values.
    const price = rupeesFromPaise(product.price_paise ?? 0);
    const biz = product.businesses ?? {};
    const localitySuffix = biz.locality ? `, ${biz.locality}` : '';
    const bizName = biz.name ?? 'Tibu';

    const ogTitle = `${product.name} · ${price} — ${bizName}`;
    // og:description: "₹350 · Sweet Crumbs, Bandra West" style as per task spec
    const ogDescShort = `${price} · ${bizName}${localitySuffix}`.slice(0, 160);
    const ogDescFull = product.description
      ? product.description.slice(0, 160)
      : ogDescShort;

    // Pick the lowest sort_order image as cover.
    const images: Array<{ url: string; sort_order: number }> = product.product_images ?? [];
    images.sort((a, b) => a.sort_order - b.sort_order);
    const coverUrl = images[0]?.url ?? '';

    // Canonical URL uses SITE_URL so preview-deploy URLs don't pollute og:url.
    const siteOrigin = (env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, '');
    const ogUrl = `${siteOrigin}/p/${id}`;

    // 6. Build the tags string.
    const metaTags: Array<[string, string]> = [
      ['og:type',        'product'],
      ['og:site_name',   'Tibu'],
      ['og:title',       ogTitle],
      ['og:description', ogDescFull],
      ['og:url',         ogUrl],
    ];
    if (coverUrl) metaTags.push(['og:image', coverUrl]);

    const tagsHtml =
      metaTags.map(([k, v]) => `<meta property="${k}" content="${esc(v)}">`).join('') +
      `<meta name="twitter:card" content="summary_large_image">` +
      `<title>${esc(ogTitle)}</title>`;

    // 7. Use HTMLRewriter to:
    //    a) Remove the existing generic <title> element.
    //    b) Append the new tags (title + OG metas) at the end of <head>.
    const rewritten = new HTMLRewriter()
      .on('title', { element(el) { el.remove(); } })
      .on('head',  { element(el) { el.append(tagsHtml, { html: true }); } })
      .transform(shellResponse);

    return withCacheHeaders(rewritten);
  } catch {
    // Never let the function 500 — fall back to the plain SPA shell.
    return withCacheHeaders(shellResponse.clone());
  }
};

/**
 * Attach Cache-Control: public, max-age=300 to any response.
 * 5-minute cache at Cloudflare edge is appropriate for product pages
 * that change infrequently; the SPA still loads fresh data client-side.
 */
function withCacheHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(response.body, { status: response.status, headers });
}
