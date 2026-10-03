// functions/p/[id].ts — Cloudflare Pages Function
// Why: WhatsApp builds link previews from Open Graph tags. A plain SPA serves the
// same generic tags for every URL, so the seller would NOT see the product image.
// This injects per-product OG tags into index.html, then the SPA boots normally.
// Env vars (Pages → Settings → Environment variables): SUPABASE_URL, SUPABASE_ANON_KEY

interface Env { SUPABASE_URL: string; SUPABASE_ANON_KEY: string; ASSETS: Fetcher }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const onRequest: PagesFunction<Env> = async ({ params, env, request }) => {
  const shell = await env.ASSETS.fetch(new URL('/index.html', request.url));
  const id = String(params.id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return shell;

  const api = `${env.SUPABASE_URL}/rest/v1/products?id=eq.${id}` +
    `&select=name,price_paise,description,product_images(url,sort_order),businesses(name)`;
  const r = await fetch(api, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  const rows = r.ok ? ((await r.json()) as any[]) : [];
  const p = rows[0];
  if (!p) return shell;

  const img = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  const price = `₹${Math.round(p.price_paise / 100).toLocaleString('en-IN')}`;
  const title = `${p.name} · ${price} — ${p.businesses?.name ?? 'Tibu'}`;
  const desc = (p.description ?? 'Discover homegrown businesses near you on Tibu').slice(0, 160);

  const tags = [
    ['og:type', 'product'], ['og:title', title], ['og:description', desc],
    ['og:url', request.url], ['og:site_name', 'Tibu'], ...(img ? [['og:image', img]] : []),
  ].map(([k, v]) => `<meta property="${k}" content="${esc(v)}">`).join('') +
    `<meta name="twitter:card" content="summary_large_image"><title>${esc(title)}</title>`;

  return new HTMLRewriter()
    .on('head', { element(e) { e.append(tags, { html: true }); } })
    .on('title', { element(e) { e.remove(); } })
    .transform(shell);
};
