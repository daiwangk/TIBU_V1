// functions/b/[slug].ts — Cloudflare Pages Function
// Why: WhatsApp builds link previews from Open Graph tags. A plain SPA serves the
// same generic tags for every URL, so the seller would NOT see the product image.
// This injects per-business OG tags into index.html, then the SPA boots normally.
// Env vars (Pages → Settings → Environment variables): SUPABASE_URL, SUPABASE_ANON_KEY

interface Env { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; ASSETS: Fetcher }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const onRequest: PagesFunction<Env> = async ({ params, env, request }) => {
  const shell = await env.ASSETS.fetch(new URL('/index.html', request.url));
  const id = String(params.slug);
  if (!/^[a-z0-9-]{2,80}$/i.test(id)) return shell;

  const api = `${env.SUPABASE_URL}/rest/v1/businesses?slug=eq.${id}&status=eq.approved` +
    `&select=name,description,banner_url,logo_url,locality`;
  const r = await fetch(api, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  const rows = r.ok ? ((await r.json()) as any[]) : [];
  const p = rows[0];
  if (!p) return shell;

  const img = p.banner_url ?? p.logo_url;
  const title = `${p.name}${p.locality ? ' · ' + p.locality : ''} — on Tibu`;
  const desc = (p.description ?? 'Discover homegrown businesses near you on Tibu').slice(0, 160);

  const tags = [
    ['og:type', 'website'], ['og:title', title], ['og:description', desc],
    ['og:url', request.url], ['og:site_name', 'Tibu'], ...(img ? [['og:image', img]] : []),
  ].map(([k, v]) => `<meta property="${k}" content="${esc(v)}">`).join('') +
    `<meta name="twitter:card" content="summary_large_image"><title>${esc(title)}</title>`;

  return new HTMLRewriter()
    .on('head', { element(e) { e.append(tags, { html: true }); } })
    .on('title', { element(e) { e.remove(); } })
    .transform(shell);
};
