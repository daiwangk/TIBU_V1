import { zodResolver } from '@hookform/resolvers/zod';
import { describe, expect, it } from 'vitest';
import { accountRows, editProfileSchema, formToPatch, profileToForm, toTenDigitMobile } from './profileForm.js';

const profile = {
  id: 'u1',
  email: 'a@b.co',
  role: 'customer',
  fullName: 'Asha Rao',
  phone: null,
  avatarUrl: null,
  homeLocality: null,
  homeLat: null,
  homeLng: null,
  notifyDigest: true,
};

const errorsOf = (values) => {
  const r = editProfileSchema.safeParse(values);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join('.'), i.message]));
};

describe('toTenDigitMobile', () => {
  it('stores 10 digits without +91', () => {
    expect(toTenDigitMobile('+91 98765 43210')).toBe('9876543210');
    expect(toTenDigitMobile('09876543210')).toBe('9876543210');
    expect(toTenDigitMobile('12345')).toBeNull();
    expect(toTenDigitMobile('')).toBeNull();
  });
});

describe('editProfileSchema', () => {
  const base = profileToForm(profile);

  it('accepts an empty phone (optional)', () => {
    expect(errorsOf({ ...base, phone: '' })).toEqual({});
    expect(errorsOf({ ...base, phone: '   ' })).toEqual({});
  });

  it('validates a phone only when one is entered', () => {
    expect(errorsOf({ ...base, phone: '98765 43210' })).toEqual({});
    expect(errorsOf({ ...base, phone: '5123456789' })).toEqual({ phone: 'Enter a valid 10-digit Indian mobile number' });
    expect(errorsOf({ ...base, phone: '98765' })).toEqual({ phone: 'Enter a valid 10-digit Indian mobile number' });
  });

  it('requires a name of at most 80 characters', () => {
    expect(errorsOf({ ...base, fullName: ' ' })).toEqual({ fullName: 'Enter your name' });
    expect(errorsOf({ ...base, fullName: 'x'.repeat(81) })).toEqual({ fullName: 'Use 80 characters or fewer' });
  });
});

describe('profileToForm / formToPatch', () => {
  it('maps nulls to empty inputs and back', () => {
    const form = profileToForm(profile);
    expect(form).toEqual({ fullName: 'Asha Rao', phone: '', homeLocality: '', homeLat: null, homeLng: null, notifyDigest: true });
    expect(formToPatch(form)).toEqual({
      fullName: 'Asha Rao', phone: null, homeLocality: null, homeLat: null, homeLng: null, notifyDigest: true,
    });
  });

  it('normalises the phone and keeps a complete home area', () => {
    const patch = formToPatch({
      fullName: ' Asha ', phone: '+91 98765 43210', homeLocality: 'Bandra West', homeLat: 19.0596, homeLng: 72.8295, notifyDigest: false,
    });
    expect(patch).toEqual({
      fullName: 'Asha', phone: '9876543210', homeLocality: 'Bandra West', homeLat: 19.0596, homeLng: 72.8295, notifyDigest: false,
    });
  });

  it('drops a half-filled home area and never sends role or avatarUrl', () => {
    const patch = formToPatch({ ...profileToForm(profile), homeLocality: 'Juhu', homeLat: null, homeLng: 72.8 });
    expect(patch.homeLocality).toBeNull();
    expect(patch.homeLat).toBeNull();
    expect(Object.keys(patch)).not.toContain('role');
    expect(Object.keys(patch)).not.toContain('avatarUrl');
  });
});

describe('accountRows', () => {
  const keys = (role) => accountRows(role).map((r) => r.key);

  it('guests only get Recently viewed', () => {
    expect(keys(null)).toEqual(['recent']);
  });

  it('members get the retention rows and notification settings', () => {
    expect(keys('customer')).toEqual(['saved', 'recent', 'connected', 'notifications', 'sell']);
    expect(accountRows('customer').find((r) => r.key === 'notifications').to).toBe('/notifications/settings');
  });

  it('customers get Sell on Tibu, sellers get the Seller dashboard, admins get neither', () => {
    expect(accountRows('customer').find((r) => r.key === 'sell').to).toBe('/sell');
    expect(accountRows('seller').find((r) => r.key === 'seller').to).toBe('/seller');
    expect(keys('seller')).not.toContain('sell');
    expect(keys('customer')).not.toContain('seller');
    expect(keys('admin')).not.toContain('sell');
    expect(keys('admin')).not.toContain('seller');
    expect(accountRows(null).some((r) => r.to === '/sell' || r.to.startsWith('/seller'))).toBe(false);
  });

  it('only admins see the admin panel; nothing links to the legacy seller register', () => {
    expect(keys('admin')).toContain('admin');
    expect(keys('seller')).not.toContain('admin');
    for (const role of ['customer', 'seller', 'admin']) {
      expect(accountRows(role).some((r) => r.to === '/seller/register')).toBe(false);
    }
  });
});

describe('editProfileSchema through zodResolver (what the form sees)', () => {
  const base = profileToForm(profile);
  const resolve = (values) =>
    zodResolver(editProfileSchema)(values, undefined, { fields: {}, shouldUseNativeValidation: false });

  it('reports an invalid phone on the "phone" path', async () => {
    const { errors } = await resolve({ ...base, phone: '12345' });
    expect(Object.keys(errors)).toEqual(['phone']);
    expect(errors.phone.message).toBe('Enter a valid 10-digit Indian mobile number');
  });

  it('has no errors for an empty phone', async () => {
    const { errors } = await resolve({ ...base, phone: '' });
    expect(errors).toEqual({});
  });
});
