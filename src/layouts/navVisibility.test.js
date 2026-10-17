import { describe, expect, it } from 'vitest';
import { isBottomNavHidden } from './navVisibility.js';

describe('isBottomNavHidden', () => {
  it('hides the nav on auth screens', () => {
    for (const p of ['/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback']) {
      expect(isBottomNavHidden(p), p).toBe(true);
    }
  });

  it('keeps hiding it on detail, seller and dev screens', () => {
    for (const p of ['/p/abc', '/b/sweet-crumbs', '/seller/dashboard', '/dev/ui']) {
      expect(isBottomNavHidden(p), p).toBe(true);
    }
  });

  it('shows it on the main tabs', () => {
    for (const p of ['/', '/search', '/saved', '/profile', '/category/desserts']) {
      expect(isBottomNavHidden(p), p).toBe(false);
    }
  });
});
