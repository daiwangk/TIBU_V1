// Cloudflare Pages Function — per-product Open Graph tags for /p/:id (DECISIONS D19).
// Env (Pages → Settings → Variables): SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL. All public values.
// Any problem (bad id, not found, network, timeout) returns the untouched index.html with a 200:
// the SPA boots and shows its own not-found state. This function never returns a 5xx of its own.
import {
  UUID_RE,
  fallbackShell,
  fetchFirstRow,
  productOg,
  siteOrigin,
  withOgTags,
  type OgContext,
} from '../_lib/og';

// Only active products of approved businesses — the same visibility the app's adapter applies.
const SELECT = 'name,price_paise,description,product_images(url,sort_order),businesses!inner(name,locality,logo_url,status)';

export const onRequest = async ({ params, env, request }: OgContext): Promise<Response> => {
  let shell: Response | undefined;
  try {
    shell = await env.ASSETS.fetch(new URL('/', request.url));
    const id = String(params.id ?? '');
    if (!UUID_RE.test(id)) return shell;

    const row = await fetchFirstRow<Parameters<typeof productOg>[0]>(
      env,
      `products?id=eq.${id}&is_active=eq.true&businesses.status=eq.approved&select=${SELECT}&limit=1`,
    );
    if (!row) return shell;
    return withOgTags(shell, productOg(row, siteOrigin(env, request), `/p/${id}`));
  } catch {
    return shell ?? fallbackShell(env, request);
  }
};
