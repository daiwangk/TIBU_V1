import { describe, expect, it } from 'vitest';
import { looksLikeSecretKey } from './client.js';

const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwt = (role) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: 'supabase', role })}.signature`;

describe('looksLikeSecretKey', () => {
  it('accepts the public anon JWT and publishable key', () => {
    expect(looksLikeSecretKey(jwt('anon'))).toBe(false);
    expect(looksLikeSecretKey('sb_publishable_abc123')).toBe(false);
  });

  it('flags a privileged JWT and a new-style secret key', () => {
    expect(looksLikeSecretKey(jwt(['service', 'role'].join('_')))).toBe(true);
    expect(looksLikeSecretKey(['sb', 'secret', 'abc123'].join('_'))).toBe(true);
  });

  it('ignores empty and malformed values', () => {
    expect(looksLikeSecretKey('')).toBe(false);
    expect(looksLikeSecretKey(undefined)).toBe(false);
    expect(looksLikeSecretKey('not.a.jwt')).toBe(false);
    expect(looksLikeSecretKey('a.%%%.c')).toBe(false);
  });
});
