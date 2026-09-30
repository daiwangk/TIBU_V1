import { describe, expect, it } from 'vitest';
import {
  formatDistance,
  formatPrice,
  formatRating,
  formatRelativeTime,
} from './format.js';

describe('format helpers (CONTRACT §9)', () => {
  it('formatPrice', () => {
    expect(formatPrice(350)).toBe('₹350');
    expect(formatPrice(1250)).toBe('₹1,250');
  });

  it('formatDistance', () => {
    expect(formatDistance(800)).toBe('800 m');
    expect(formatDistance(2400)).toBe('2.4 km');
    expect(formatDistance(null)).toBe('');
  });

  it('formatRating', () => {
    expect(formatRating(4.25)).toBe('4.3');
    expect(formatRating(4.25, 0)).toBe('New');
    expect(formatRating(0)).toBe('New');
    expect(formatRating(null)).toBe('New');
    expect(formatRating(undefined)).toBe('New');
    expect(formatRating(0, 5)).toBe('New');
  });

  it('formatRelativeTime', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');
    expect(formatRelativeTime(new Date(now.getTime() - 10_000).toISOString(), now)).toBe(
      'just now',
    );
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe(
      '5 min ago',
    );
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 3600_000).toISOString(), now)).toBe(
      '3 h ago',
    );
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 86400_000).toISOString(), now)).toBe(
      '2 d ago',
    );
    expect(formatRelativeTime('2026-10-12T00:00:00.000Z', new Date('2026-10-20T00:00:00.000Z'))).toBe(
      '12 Oct',
    );
  });
});
