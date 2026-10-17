import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteUrl } from './siteUrl.js';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('siteUrl', () => {
  it('strips trailing slashes and whitespace from VITE_SITE_URL', () => {
    vi.stubEnv('VITE_SITE_URL', ' https://tibu-app.pages.dev// ');
    expect(siteUrl()).toBe('https://tibu-app.pages.dev');
    expect(`${siteUrl()}/p/abc`).toBe('https://tibu-app.pages.dev/p/abc');
  });

  it('falls back to the page origin when unset', () => {
    vi.stubEnv('VITE_SITE_URL', '');
    vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } });
    expect(siteUrl()).toBe('http://localhost:5173');
  });
});
