import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loginRedirectPath, roleAllowed } from './authGuard.js';

describe('loginRedirectPath', () => {
  it('encodes the page the guest was heading to, query string included', () => {
    expect(loginRedirectPath('/p/abc', '?v=2')).toBe('/login?next=%2Fp%2Fabc%3Fv%3D2');
    expect(loginRedirectPath('/saved')).toBe('/login?next=%2Fsaved');
  });
});

describe('roleAllowed', () => {
  it('allows listed roles, always allows admin, rejects the rest', () => {
    expect(roleAllowed('seller', ['seller'])).toBe(true);
    expect(roleAllowed('customer', ['seller'])).toBe(false);
    expect(roleAllowed('admin', ['seller'])).toBe(true);
    expect(roleAllowed(null, ['seller'])).toBe(false);
  });
});

describe('Supabase client options', () => {
  it("does not opt into flowType 'pkce' (it breaks e-mail links opened in another browser)", () => {
    const source = readFileSync(new URL('../services/supabase/client.js', import.meta.url), 'utf8');
    expect(source).not.toMatch(/flowType|pkce/i);
  });
});
