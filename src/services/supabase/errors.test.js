import { describe, expect, it } from 'vitest';
import { AppError } from '../errors.js';
import { mapSupabaseError } from './errors.js';

describe('mapSupabaseError (CONTRACT §11)', () => {
  it('matches message prefixes before shared errcodes', () => {
    expect(mapSupabaseError({ message: 'login_required', code: '28000' })).toMatchObject({
      code: 'auth_required',
    });
    expect(mapSupabaseError({ message: 'business_not_available', code: 'P0002' })).toMatchObject({
      code: 'business_not_available',
      message: "This business isn't available right now",
    });
    expect(mapSupabaseError({ message: 'not_found', code: 'P0002' })).toMatchObject({
      code: 'not_found',
    });
    expect(mapSupabaseError({ message: 'rate_limited', code: '53400' })).toMatchObject({
      code: 'rate_limited',
      message: 'Too many requests — try again in a bit',
    });
  });

  it('maps incomplete_application with missing keys on the original cause', () => {
    const original = { message: 'incomplete_application:logo,location' };
    const err = mapSupabaseError(original);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('validation');
    expect(err.cause).toBe(original);
    expect(err.cause.missing).toEqual(['logo', 'location']);
  });

  it('maps forbidden / RLS / own-enquiry cases', () => {
    expect(mapSupabaseError({ message: 'forbidden', code: '42501' }).code).toBe('forbidden');
    expect(mapSupabaseError({ message: 'role_change_not_allowed', code: '42501' }).code).toBe(
      'forbidden',
    );
    expect(
      mapSupabaseError({ message: 'new row violates row-level security policy' }).code,
    ).toBe('forbidden');
    expect(mapSupabaseError({ message: 'cannot_enquire_own_business' })).toMatchObject({
      code: 'forbidden',
      message: "You can't send an enquiry to your own business",
    });
  });

  it('maps conflict and validation SQL codes', () => {
    expect(mapSupabaseError({ message: 'invalid_status:approved' }).code).toBe('conflict');
    expect(mapSupabaseError({ message: 'invalid_transition:draft->approved' }).code).toBe(
      'conflict',
    );
    expect(mapSupabaseError({ message: 'duplicate', code: '23505' }).code).toBe('conflict');
    expect(mapSupabaseError({ message: 'check failed', code: '23514' }).code).toBe('validation');
    expect(mapSupabaseError({ message: 'bad input', code: '22P02' }).code).toBe('validation');
    expect(mapSupabaseError({ message: 'JWT expired', code: 'PGRST301' }).code).toBe('auth_required');
    expect(mapSupabaseError({ message: 'reason_required' })).toMatchObject({
      code: 'validation',
      message: 'Add a reason',
    });
  });

  it('maps PostgREST not-found and network failures', () => {
    expect(mapSupabaseError({ message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' }))
      .toMatchObject({ code: 'not_found' });
    expect(mapSupabaseError({ message: 'no_business' }).code).toBe('not_found');
    expect(mapSupabaseError({ name: 'TypeError', message: 'Failed to fetch' })).toMatchObject({
      code: 'network',
      message: "You're offline — check your connection",
    });
  });

  it('falls back to unknown and passes through AppError', () => {
    expect(mapSupabaseError({ message: 'surprise', code: 'XXXXX' })).toMatchObject({
      code: 'unknown',
      message: 'Something went wrong',
    });
    const existing = new AppError('config', 'already mapped');
    expect(mapSupabaseError(existing)).toBe(existing);
  });

  it('never puts Postgres text in the user-facing message (CONTRACT section 1.3)', () => {
    const raw = 'new row for relation "business_contacts" violates check constraint "business_contacts_phone_check"';
    for (const code of ['23514', '22P02', '23505', 'P0002']) {
      const err = mapSupabaseError({ message: raw, code });
      expect(err.message, code).not.toMatch(/relation|constraint|violates|business_contacts/i);
      expect(err.cause.message).toBe(raw);
    }
    const incomplete = mapSupabaseError({ message: 'incomplete_application:logo,location' });
    expect(incomplete.message).toBe('Complete your application first');
    expect(incomplete.cause.missing).toEqual(['logo', 'location']);
  });

  it('only treats TypeErrors as offline when the message says the request failed', () => {
    expect(mapSupabaseError({ name: 'TypeError', message: 'Load failed' }).code).toBe('network');
    expect(mapSupabaseError({ name: 'TypeError', message: "Cannot read properties of undefined (reading 'x')" }).code).toBe('unknown');
  });

  it('maps Supabase Auth errors (CONTRACT section 11, A3.1 rows)', () => {
    expect(mapSupabaseError({ code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 }))
      .toMatchObject({ code: 'validation', message: 'Email or password is incorrect' });
    expect(mapSupabaseError({ code: 'email_not_confirmed', message: 'Email not confirmed', status: 400 }))
      .toMatchObject({ code: 'validation', message: 'Please confirm your email first' });
    expect(mapSupabaseError({ code: 'user_already_exists', message: 'User already registered', status: 422 }))
      .toMatchObject({ code: 'conflict', message: 'An account with this email already exists' });
    expect(mapSupabaseError({ code: 'weak_password', message: 'Password should be at least 6 characters.', status: 422 }))
      .toMatchObject({ code: 'validation', message: 'Choose a stronger password' });
    expect(mapSupabaseError({ code: 'over_email_send_rate_limit', message: 'email rate limit exceeded', status: 429 }))
      .toMatchObject({ code: 'rate_limited' });
    expect(mapSupabaseError({ message: 'Too many', status: 429 }).code).toBe('rate_limited');
  });

  it('falls back to the auth message text when the code is missing', () => {
    expect(mapSupabaseError({ message: 'Invalid login credentials' }).code).toBe('validation');
    expect(mapSupabaseError({ message: 'User already registered' }).code).toBe('conflict');
  });
});
