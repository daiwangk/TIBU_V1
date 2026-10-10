// Cloudflare Pages Function — per-business Open Graph tags for /b/:slug (DECISIONS D19).
// Env (Pages → Settings → Variables): SUPABASE_URL, SUPABASE_ANON_KEY, SITE_URL. All public values.
// Any problem (bad slug, not found, network, timeout) returns the untouched index.html with a 200:
// the SPA boots and shows its own not-found state. This function never returns a 5xx of its own.
import {
  SLUG_RE,
  businessOg,
  fallbackShell,
  fetchFirstRow,
  siteOrigin,
  withOgTags,
  type OgContext,
} from '../_lib/og';

const SELECT = 'name,description,locality,banner_url,logo_url,categories(name)';

export const onRequest = async ({ params, env, request }: OgContext): Promise<Response> => {
  let shell: Response | undefined;
  try {
    shell = await env.ASSETS.fetch(new URL('/', request.url));
    const slug = String(params.slug ?? '');
    if (!SLUG_RE.test(slug)) return shell;

    const row = await fetchFirstRow<Parameters<typeof businessOg>[0]>(
      env,
      `businesses?slug=eq.${slug}&status=eq.approved&select=${SELECT}&limit=1`,
    );
    if (!row) return shell;
    return withOgTags(shell, businessOg(row, siteOrigin(env, request), `/b/${slug}`));
  } catch {
    return shell ?? fallbackShell(env, request);
  }
};
