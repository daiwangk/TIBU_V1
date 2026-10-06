// functions/b/[slug].ts — Cloudflare Pages Function
// Why: WhatsApp/social crawlers build link previews from Open Graph tags. A plain
// SPA serves the same generic tags for every URL, so sharing a business page shows
// no name, image, or description. This function fetches the business row from
// Supabase (anon key, restricted to approved businesses only), injects per-business
// OG tags via HTMLRewriter, then returns the full index.html so the React SPA boots
// normally in the browser.
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

/**
 * Kebab slug: lowercase letters, digits, and hyphens; 2–80 chars.
 * Matches the DB constraint: slug ~ '^[a-z0-9-]+$' with length 2-80.
 */
const SLUG_RE = /^[a-z0-9-]{2,80}$/;

/** Escape HTML special characters for safe injection into tag attributes/content. */
const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const onRequest: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;

  // 1. Fetch the unmodified SPA shell — always returned on any error/not-found.
  //    We fetch `/` so Cloudflare Pages resolves it through its own routing rules.
  const shellResponse = await env.ASSETS.fetch(new URL('/', request.url));

  try {
    // 2. Validate the slug format before hitting the database.
    const slug = String(params.slug);
    if (!SLUG_RE.test(slug)) return withCacheHeaders(shellResponse.clone());

    // 3. Fetch only the columns we need. We filter status=eq.approved explicitly;
    //    RLS also enforces this for anon — belt-and-braces.
    //    We never select business_contacts (phone/whatsapp) here.
    const apiUrl =
      `${env.SUPABASE_URL}/rest/v1/businesses` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&status=eq.approved` +
      `&select=name,description,banner_url,logo_url,locality` +
      `&limit=1`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
    });

    const rows: any[] = apiRes.ok ? await apiRes.json() : [];
    const business = rows[0];

    // 4. On not-found or error, return the plain shell so the SPA renders its
    //    own not-found state. Never return a 5xx.
    if (!business) return withCacheHeaders(shellResponse.clone());

    // 5. Derive OG values.
    const localitySuffix = business.locality ? ` · ${business.locality}` : '';
    const ogTitle = `${business.name}${localitySuffix} — on Tibu`;
    const ogDesc = (
      business.description ?? 'Discover homegrown businesses near you on Tibu'
    ).slice(0, 160);

    // Prefer banner over logo for the OG image (banner is landscape — better preview).
    const coverUrl: string = business.banner_url ?? business.logo_url ?? '';

    // Canonical URL uses SITE_URL so preview-deploy URLs don't pollute og:url.
    const siteOrigin = (env.SITE_URL ?? new URL(request.url).origin).replace(/\/$/, '');
    const ogUrl = `${siteOrigin}/b/${slug}`;

    // 6. Build the tags string.
    const metaTags: Array<[string, string]> = [
      ['og:type',        'website'],
      ['og:site_name',   'Tibu'],
      ['og:title',       ogTitle],
      ['og:description', ogDesc],
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
 * 5-minute cache at Cloudflare edge is appropriate for business pages
 * that change infrequently; the SPA still loads fresh data client-side.
 */
function withCacheHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(response.body, { status: response.status, headers });
}
