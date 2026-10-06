// Shared helpers for the Open Graph Pages Functions (functions/p/[id].ts, functions/b/[slug].ts).
// Why: WhatsApp builds link previews from Open Graph tags in the HTML it fetches. The SPA serves one
// generic index.html for every URL, so these functions inject per-item tags before the SPA boots.
// Pure helpers live here so they can be unit tested; only withOgTags needs the Workers runtime.
// TypeScript is allowed in functions/ (AGENTS.md §1) — there is no compile step, Pages bundles it.

export interface OgEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  /** Public site origin, e.g. https://tibu-v1.pages.dev (no trailing slash needed). */
  SITE_URL?: string;
  ASSETS: { fetch(input: URL | string | Request): Promise<Response> };
}

export interface OgContext {
  params: Record<string, string | string[] | undefined>;
  env: OgEnv;
  request: Request;
}

export interface OgTags {
  type: 'product' | 'website';
  title: string;
  description: string;
  /** Absolute URL, or null when the item has no image. */
  image: string | null;
  /** Absolute canonical URL. */
  url: string;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Kebab-case business slug, 2–80 chars (CONTRACT §12). */
export const SLUG_RE = /^(?=.{2,80}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DESCRIPTION_MAX = 160;
const SITE_NAME = 'Tibu';
const DEFAULT_DESCRIPTION = 'Discover homegrown businesses near you on Tibu';
const CACHE_CONTROL = 'public, max-age=300';
const FETCH_TIMEOUT_MS = 4000;

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

export function truncate(value: string, max = DESCRIPTION_MAX): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** 35000 paise → "₹350"; 125000 → "₹1,250". */
export function formatRupees(paise: number): string {
  return `₹${Math.round(Number(paise) / 100).toLocaleString('en-IN')}`;
}

/** Public origin for canonical URLs: SITE_URL if set, else the request's own origin. */
export function siteOrigin(env: OgEnv, request: Request): string {
  const configured = (env.SITE_URL ?? '').trim().replace(/\/+$/, '');
  return configured || new URL(request.url).origin;
}

/** Absolute URL for an image; null for empty or unparseable values. */
export function absoluteUrl(value: string | null | undefined, base: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

interface ProductRow {
  name: string;
  price_paise: number;
  description?: string | null;
  product_images?: Array<{ url: string; sort_order?: number | null }> | null;
  businesses?: { name?: string | null; locality?: string | null; logo_url?: string | null } | null;
}

interface BusinessRow {
  name: string;
  description?: string | null;
  locality?: string | null;
  banner_url?: string | null;
  logo_url?: string | null;
  categories?: { name?: string | null } | null;
}

export function productOg(row: ProductRow, origin: string, path: string): OgTags {
  const cover = [...(row.product_images ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url;
  const seller = [row.businesses?.name, row.businesses?.locality].filter(Boolean).join(', ');
  const description = [formatRupees(row.price_paise), seller].filter(Boolean).join(' · ');

  return {
    type: 'product',
    title: truncate(row.name, 100),
    description: truncate(description || row.description || DEFAULT_DESCRIPTION),
    image: absoluteUrl(cover ?? row.businesses?.logo_url, origin),
    url: `${origin}${path}`,
  };
}

export function businessOg(row: BusinessRow, origin: string, path: string): OgTags {
  const where = [row.categories?.name, row.locality].filter(Boolean).join(' · ');
  const about = row.description ? truncate(row.description) : '';
  const description = [where, about].filter(Boolean).join(' — ');

  return {
    type: 'website',
    title: truncate(row.name, 100),
    description: truncate(description || DEFAULT_DESCRIPTION),
    image: absoluteUrl(row.banner_url ?? row.logo_url, origin),
    url: `${origin}${path}`,
  };
}

/** The <head> markup for one item. Every value is escaped. */
export function renderMeta(og: OgTags): string {
  const tags: Array<[string, string, string]> = [
    ['property', 'og:type', og.type],
    ['property', 'og:site_name', SITE_NAME],
    ['property', 'og:title', og.title],
    ['property', 'og:description', og.description],
    ['property', 'og:url', og.url],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', og.title],
    ['name', 'twitter:description', og.description],
  ];
  if (og.image) {
    tags.push(['property', 'og:image', og.image], ['name', 'twitter:image', og.image]);
  }
  return tags.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${esc(value)}">`).join('');
}

/** Same query pattern for both functions: anon key over PostgREST, no supabase-js. */
export async function fetchFirstRow<T>(env: OgEnv, path: string): Promise<T | null> {
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/${path}`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    // Workers-only hint; ignored elsewhere.
    cf: { cacheTtl: 300, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) return null;
  const rows = (await response.json()) as T[];
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

declare const HTMLRewriter: new () => {
  on(selector: string, handlers: { element(element: any): void }): any;
  transform(response: Response): Response;
};

/** Rewrite index.html: new <title>, description, and per-item OG/Twitter tags. Needs the Workers runtime. */
export function withOgTags(shell: Response, og: OgTags): Response {
  const rewritten = new HTMLRewriter()
    .on('title', { element(e) { e.setInnerContent(og.title); } })
    .on('meta[name="description"]', { element(e) { e.remove(); } })
    .on('meta[property^="og:"]', { element(e) { e.remove(); } })
    .on('meta[name^="twitter:"]', { element(e) { e.remove(); } })
    .on('head', {
      element(e) {
        e.append(`<meta name="description" content="${esc(og.description)}">${renderMeta(og)}`, { html: true });
      },
    })
    .transform(shell);

  const out = new Response(rewritten.body, rewritten);
  out.headers.set('Cache-Control', CACHE_CONTROL);
  return out;
}
