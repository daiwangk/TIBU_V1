import { describe, expect, it } from 'vitest';
import { ONBOARDING_PATH, sellerGateRedirect } from './sellerGate.js';

describe('sellerGateRedirect', () => {
  it('sends a seller with no business to onboarding from every other seller route', () => {
    for (const path of ['/seller', '/seller/products', '/seller/videos', '/seller/business']) {
      expect(sellerGateRedirect(null, path), path).toBe(ONBOARDING_PATH);
    }
  });

  it('treats a draft like no business', () => {
    expect(sellerGateRedirect({ status: 'draft' }, '/seller')).toBe(ONBOARDING_PATH);
  });

  it('lets onboarding itself render (no redirect loop)', () => {
    expect(sellerGateRedirect(null, '/seller/onboarding')).toBeNull();
    expect(sellerGateRedirect({ status: 'draft' }, '/seller/onboarding/')).toBeNull();
  });

  it('lets pending, approved, rejected and unpublished sellers through everywhere', () => {
    for (const status of ['pending', 'approved', 'rejected', 'unpublished']) {
      expect(sellerGateRedirect({ status }, '/seller'), status).toBeNull();
      expect(sellerGateRedirect({ status }, '/seller/onboarding'), status).toBeNull();
    }
  });
});
