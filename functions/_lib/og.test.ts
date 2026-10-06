import { describe, expect, it } from 'vitest';
import {
  SLUG_RE,
  UUID_RE,
  absoluteUrl,
  businessOg,
  esc,
  formatRupees,
  productOg,
  renderMeta,
  siteOrigin,
  truncate,
  type OgEnv,
} from './og';

const ORIGIN = 'https://tibu-v1.pages.dev';
const env = (extra: Partial<OgEnv> = {}) => ({ SUPABASE_URL: 'x', SUPABASE_ANON_KEY: 'y', ASSETS: { fetch: async () => new Response('') }, ...extra }) as OgEnv;

describe('id and slug validation', () => {
  it('accepts uuids only for products', () => {
    expect(UUID_RE.test('11111111-1111-4111-8111-111111111111')).toBe(true);
    expect(UUID_RE.test('11111111-1111-4111-8111-11111111111')).toBe(false);
    expect(UUID_RE.test('aura-candles-vanilla-soy-candle')).toBe(false);
    expect(UUID_RE.test('11111111-1111-4111-8111-111111111111&select=*')).toBe(false);
  });

  it('accepts kebab-case slugs of 2–80 characters for businesses', () => {
    expect(SLUG_RE.test('sweet-crumbs-4f2a')).toBe(true);
    expect(SLUG_RE.test('whisk')).toBe(true);
    // everything the database accepts, including generated slugs from long or odd names
    expect(SLUG_RE.test('a')).toBe(true);
    expect(SLUG_RE.test('-ab12')).toBe(true);
    expect(SLUG_RE.test('sweet--crumbs')).toBe(true);
    expect(SLUG_RE.test(`${'x'.repeat(80)}-ab12`)).toBe(true);
    expect(SLUG_RE.test('Sweet-Crumbs')).toBe(false);
    expect(SLUG_RE.test('')).toBe(false);
    expect(SLUG_RE.test('x'.repeat(101))).toBe(false);
    expect(SLUG_RE.test('a&select=*')).toBe(false);
    expect(SLUG_RE.test('cocoa corner')).toBe(false);
  });
});

describe('formatting helpers', () => {
  it('formats paise as Indian rupees', () => {
    expect(formatRupees(35000)).toBe('₹350');
    expect(formatRupees(125000)).toBe('₹1,250');
    expect(formatRupees(10000000)).toBe('₹1,00,000');
    expect(formatRupees(0)).toBe('₹0');
  });

  it('escapes every HTML-significant character', () => {
    expect(esc(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });

  it('truncates on whitespace-normalised text and adds an ellipsis', () => {
    expect(truncate('  hello \n  world ')).toBe('hello world');
    const long = truncate('word '.repeat(80), 160);
    expect(long.length).toBeLessThanOrEqual(160);
    expect(long.endsWith('…')).toBe(true);
  });

  it('resolves relative image urls and drops garbage', () => {
    expect(absoluteUrl('/img/a.webp', ORIGIN)).toBe(`${ORIGIN}/img/a.webp`);
    expect(absoluteUrl('https://x.supabase.co/storage/v1/a.webp', ORIGIN)).toBe('https://x.supabase.co/storage/v1/a.webp');
    expect(absoluteUrl(null, ORIGIN)).toBeNull();
    expect(absoluteUrl('', ORIGIN)).toBeNull();
  });

  it('uses SITE_URL when set (trailing slash trimmed) and the request origin otherwise', () => {
    const request = new Request('https://abc123.tibu-v1.pages.dev/p/x?v=2');
    expect(siteOrigin(env({ SITE_URL: 'https://tibu.example/' }), request)).toBe('https://tibu.example');
    expect(siteOrigin(env(), request)).toBe('https://abc123.tibu-v1.pages.dev');
    expect(siteOrigin(env({ SITE_URL: '   ' }), request)).toBe('https://abc123.tibu-v1.pages.dev');
  });
});

describe('productOg', () => {
  const row = {
    name: 'Vanilla Cupcakes',
    price_paise: 35000,
    description: 'Fresh daily.',
    product_images: [
      { url: 'https://cdn.example/second.jpg', sort_order: 2 },
      { url: 'https://cdn.example/cover.jpg', sort_order: 0 },
    ],
    businesses: { name: 'Sweet Crumbs', locality: 'Bandra West', logo_url: 'https://cdn.example/logo.jpg' },
  };

  it('builds title, "₹350 · Seller, Locality" description, cover image and canonical url', () => {
    const og = productOg(row, ORIGIN, '/p/abc');
    expect(og).toEqual({
      type: 'product',
      title: 'Vanilla Cupcakes',
      description: '₹350 · Sweet Crumbs, Bandra West',
      image: 'https://cdn.example/cover.jpg',
      url: `${ORIGIN}/p/abc`,
    });
  });

  it('falls back to the seller logo, then to no image', () => {
    expect(productOg({ ...row, product_images: [] }, ORIGIN, '/p/abc').image).toBe('https://cdn.example/logo.jpg');
    expect(productOg({ ...row, product_images: null, businesses: { name: 'S' } }, ORIGIN, '/p/abc').image).toBeNull();
  });

  it('copes with a missing locality or seller', () => {
    expect(productOg({ ...row, businesses: { name: 'Sweet Crumbs' } }, ORIGIN, '/p/a').description).toBe('₹350 · Sweet Crumbs');
    expect(productOg({ ...row, businesses: null }, ORIGIN, '/p/a').description).toBe('₹350');
  });
});

describe('businessOg', () => {
  const row = {
    name: 'Sweet Crumbs',
    description: 'Freshly baked brownies and cakes.',
    locality: 'Bandra West',
    banner_url: null,
    logo_url: 'https://cdn.example/logo.jpg',
    categories: { name: 'Desserts' },
  };

  it('combines category, locality and description; prefers the banner, then the logo', () => {
    const og = businessOg(row, ORIGIN, '/b/sweet-crumbs');
    expect(og.type).toBe('website');
    expect(og.title).toBe('Sweet Crumbs');
    expect(og.description).toBe('Desserts · Bandra West — Freshly baked brownies and cakes.');
    expect(og.image).toBe('https://cdn.example/logo.jpg');
    expect(og.url).toBe(`${ORIGIN}/b/sweet-crumbs`);
    expect(businessOg({ ...row, banner_url: 'https://cdn.example/banner.jpg' }, ORIGIN, '/b/x').image).toBe('https://cdn.example/banner.jpg');
  });

  it('uses a generic description when nothing is known', () => {
    const og = businessOg({ name: 'X' }, ORIGIN, '/b/x');
    expect(og.description).toBe('Discover homegrown businesses near you on Tibu');
    expect(og.image).toBeNull();
  });

  it('keeps the description within 160 characters', () => {
    const og = businessOg({ ...row, description: 'long '.repeat(100) }, ORIGIN, '/b/x');
    expect(og.description.length).toBeLessThanOrEqual(160);
  });
});

describe('renderMeta', () => {
  it('emits og and twitter tags, escaped, with the image when present', () => {
    const html = renderMeta({
      type: 'product',
      title: 'Tom & "Jerry" <b>',
      description: "It's ₹350",
      image: 'https://cdn.example/a.jpg?x=1&y=2',
      url: `${ORIGIN}/p/abc`,
    });
    expect(html).toContain('<meta property="og:type" content="product">');
    expect(html).toContain('content="Tom &amp; &quot;Jerry&quot; &lt;b&gt;"');
    expect(html).toContain("content=\"It&#39;s ₹350\"");
    expect(html).toContain('<meta property="og:image" content="https://cdn.example/a.jpg?x=1&amp;y=2">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).not.toContain('<b>');
  });

  it('omits image tags when there is no image', () => {
    const html = renderMeta({ type: 'website', title: 'T', description: 'D', image: null, url: ORIGIN });
    expect(html).not.toContain('og:image');
    expect(html).not.toContain('twitter:image');
    expect(html).toContain('summary_large_image');
  });
});
