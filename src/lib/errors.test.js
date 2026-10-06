import { describe, expect, it } from 'vitest';
import { AppError } from '../services/errors.js';
import { shouldToast, userMessage } from './errors.js';

describe('userMessage', () => {
  it.each([
    ['network', "You're offline — check your connection"],
    ['rate_limited', 'Too many requests — try again in a bit'],
    ['forbidden', "You don't have access to that"],
    ['business_not_available', "This business isn't available right now"],
    ['not_found', "We couldn't find that"],
    ['auth_required', 'Please log in to continue'],
  ])('maps %s to fixed text, ignoring the error message', (code, expected) => {
    expect(userMessage(new AppError(code, 'raw internal message'))).toBe(expected);
  });

  it('passes validation and conflict messages through (they are user-safe)', () => {
    expect(userMessage(new AppError('validation', 'Add a reason'))).toBe('Add a reason');
    expect(userMessage(new AppError('conflict', 'This reel is already added'))).toBe('This reel is already added');
  });

  it('falls back to a generic message for unknown, config, mock and non-AppError values', () => {
    expect(userMessage(new AppError('unknown', 'pg exploded'))).toBe('Something went wrong');
    expect(userMessage(new AppError('config', 'Missing VITE_SUPABASE_URL'))).toBe('Something went wrong');
    expect(userMessage(new AppError('unavailable_in_mock', 'nope'))).toBe('Something went wrong');
    expect(userMessage(new TypeError('x is undefined'))).toBe('Something went wrong');
    expect(userMessage(undefined)).toBe('Something went wrong');
  });

  it('falls back when validation has no message', () => {
    expect(userMessage(new AppError('validation', ''))).toBe('Something went wrong');
  });
});

describe('shouldToast', () => {
  it.each(['network', 'rate_limited', 'forbidden', 'business_not_available', 'unknown'])(
    'toasts for %s',
    (code) => {
      expect(shouldToast(new AppError(code, 'm'))).toBe(true);
    },
  );

  it.each(['auth_required', 'not_found', 'validation', 'conflict', 'config', 'unavailable_in_mock'])(
    'stays quiet for %s',
    (code) => {
      expect(shouldToast(new AppError(code, 'm'))).toBe(false);
    },
  );

  it('toasts for non-AppErrors (treated as unknown)', () => {
    expect(shouldToast(new TypeError('boom'))).toBe(true);
  });

  it('skips the toast when the query is silent', () => {
    expect(shouldToast(new AppError('network', 'm'), { silent: true })).toBe(false);
    expect(shouldToast(new AppError('network', 'm'), { silent: false })).toBe(true);
    expect(shouldToast(new AppError('network', 'm'), undefined)).toBe(true);
  });
});
