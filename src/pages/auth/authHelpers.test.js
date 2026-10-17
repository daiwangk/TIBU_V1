import { describe, expect, it } from 'vitest';
import { AppError } from '../../services/errors.js';
import { authErrorMessage, isEmailNotConfirmed, linkErrorMessage, safeNextPath, withNext } from './authHelpers.js';

describe('safeNextPath', () => {
  it('keeps same-site paths with their query', () => {
    expect(safeNextPath('/saved')).toBe('/saved');
    expect(safeNextPath('/b/sweet-crumbs?tab=reviews')).toBe('/b/sweet-crumbs?tab=reviews');
  });

  it('rejects empty, absolute and protocol-relative values', () => {
    for (const bad of [null, undefined, '', 'saved', 'https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)']) {
      expect(safeNextPath(bad), String(bad)).toBeNull();
    }
  });

  it('rejects auth screens so login never loops back to itself', () => {
    for (const p of ['/login', '/login?next=/x', '/signup', '/forgot-password', '/reset-password', '/auth/callback']) {
      expect(safeNextPath(p), p).toBeNull();
    }
    expect(safeNextPath('/loginhelp')).toBe('/loginhelp');
  });
});

describe('withNext', () => {
  it('adds next and extra params, skipping empty ones', () => {
    expect(withNext('/signup', '/p/1?x=1')).toBe('/signup?next=%2Fp%2F1%3Fx%3D1');
    expect(withNext('/signup', null, { as: 'seller' })).toBe('/signup?as=seller');
    expect(withNext('/login', null, { as: null })).toBe('/login');
  });
});

describe('authErrorMessage', () => {
  it('is friendly in mock mode', () => {
    expect(authErrorMessage(new AppError('unavailable_in_mock', 'x'))).toBe("Accounts aren't available in this demo build.");
  });

  it('passes contract messages through', () => {
    expect(authErrorMessage(new AppError('validation', 'Email or password is incorrect'))).toBe('Email or password is incorrect');
    expect(authErrorMessage(new AppError('rate_limited', 'x'))).toBe('Too many requests — try again in a bit');
    expect(authErrorMessage(new Error('boom'))).toBe('Something went wrong');
  });
});

describe('isEmailNotConfirmed', () => {
  it('detects the unconfirmed sign-in error by cause code or message', () => {
    expect(isEmailNotConfirmed(new AppError('validation', 'Please confirm your email first', { code: 'email_not_confirmed' }))).toBe(true);
    expect(isEmailNotConfirmed(new AppError('validation', 'Please confirm your email first'))).toBe(true);
    expect(isEmailNotConfirmed(new AppError('validation', 'x', { message: 'Email not confirmed' }))).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isEmailNotConfirmed(new AppError('validation', 'Email or password is incorrect', { code: 'invalid_credentials' }))).toBe(false);
    expect(isEmailNotConfirmed(new AppError('network', 'Please confirm your email first'))).toBe(false);
    expect(isEmailNotConfirmed(null)).toBe(false);
  });
});

describe('linkErrorMessage', () => {
  it('reads errors from the hash or the query', () => {
    expect(linkErrorMessage('#error=access_denied&error_code=otp_expired&error_description=x', '')).toBe(
      'This link has expired or was already used.',
    );
    expect(linkErrorMessage('', '?error=server_error')).toBe('This link is invalid or has expired.');
  });

  it('is null for a normal link', () => {
    expect(linkErrorMessage('#access_token=abc&type=signup', '')).toBeNull();
    expect(linkErrorMessage('', '')).toBeNull();
  });
});
