import { describe, expect, it } from 'vitest';
import { gateTitle, signupHref } from './gateTitle.js';

describe('gateTitle', () => {
  it('names the business for contact actions', () => {
    expect(gateTitle({ type: 'whatsapp', payload: { businessName: 'Sweet Crumbs' } })).toBe('Log in to contact Sweet Crumbs');
    expect(gateTitle({ type: 'call', payload: { businessName: ' Amma’s Kitchen ' } })).toBe('Log in to contact Amma’s Kitchen');
    expect(gateTitle({ type: 'call', payload: {} })).toBe('Log in to contact the seller');
  });

  it('covers the other gated actions', () => {
    expect(gateTitle({ type: 'save', payload: { kind: 'product', id: 'p1', saved: true } })).toBe('Log in to save');
    expect(gateTitle({ type: 'enquiry' })).toBe('Log in to send an enquiry');
    expect(gateTitle({ type: 'review' })).toBe('Log in to write a review');
  });

  it('falls back for no or unknown pending action', () => {
    expect(gateTitle(null)).toBe('Log in to continue');
    expect(gateTitle({ type: 'other' })).toBe('Log in to continue');
  });
});

describe('signupHref', () => {
  it('keeps the return path as an encoded next', () => {
    expect(signupHref('/p/abc?x=1')).toBe('/signup?next=%2Fp%2Fabc%3Fx%3D1');
    expect(signupHref(null)).toBe('/signup');
  });
});
