/**
 * Unit tests for src/lib/recentLocal.js
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocal, getLocal, pushLocal } from './recentLocal.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}

describe('recentLocal', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts empty', () => {
    expect(getLocal()).toEqual([]);
  });

  it('stores a business view', () => {
    pushLocal({ kind: 'business', id: 'sita-pottery' });
    expect(getLocal()).toMatchObject([{ kind: 'business', id: 'sita-pottery' }]);
  });

  it('stores a product view', () => {
    pushLocal({ kind: 'product', id: 'prod-uuid-1' });
    expect(getLocal()).toMatchObject([{ kind: 'product', id: 'prod-uuid-1' }]);
  });

  it('prepends new views (newest-first)', () => {
    pushLocal({ kind: 'business', id: 'biz-1' });
    pushLocal({ kind: 'product', id: 'prod-1' });
    expect(getLocal()).toMatchObject([
      { kind: 'product', id: 'prod-1' },
      { kind: 'business', id: 'biz-1' },
    ]);
  });

  it('deduplicates and moves the duplicate entry to the front', () => {
    pushLocal({ kind: 'business', id: 'biz-1' });
    pushLocal({ kind: 'product', id: 'prod-1' });
    pushLocal({ kind: 'business', id: 'biz-2' });
    // Now re-view biz-1
    pushLocal({ kind: 'business', id: 'biz-1' });

    expect(getLocal()).toMatchObject([
      { kind: 'business', id: 'biz-1' },
      { kind: 'business', id: 'biz-2' },
      { kind: 'product', id: 'prod-1' },
    ]);
  });

  it('caps items at 30 entries', () => {
    for (let i = 1; i <= 35; i++) {
      pushLocal({ kind: 'product', id: `prod-${i}` });
    }
    const stored = getLocal();
    expect(stored.length).toBe(30);
    // Newest is prod-35 at index 0, oldest is prod-6 at index 29
    expect(stored[0]).toMatchObject({ kind: 'product', id: 'prod-35' });
    expect(stored[29]).toMatchObject({ kind: 'product', id: 'prod-6' });
  });

  it('stamps each view with viewedAt and refreshes it on a repeat view', () => {
    vi.useFakeTimers({ now: new Date('2026-10-15T10:00:00.000Z') });
    pushLocal({ kind: 'product', id: 'prod-1' });
    vi.setSystemTime(new Date('2026-10-15T11:30:00.000Z'));
    pushLocal({ kind: 'business', id: 'biz-1' });
    pushLocal({ kind: 'product', id: 'prod-1' });
    vi.useRealTimers();
    expect(getLocal()).toEqual([
      { kind: 'product', id: 'prod-1', viewedAt: '2026-10-15T11:30:00.000Z' },
      { kind: 'business', id: 'biz-1', viewedAt: '2026-10-15T11:30:00.000Z' },
    ]);
  });

  it('still reads entries written before viewedAt existed', () => {
    localStorage.setItem('tibu.recent', JSON.stringify([
      { kind: 'business', id: 'old-biz' },
      { kind: 'product', id: 'old-prod', viewedAt: 42 },
    ]));
    expect(getLocal()).toEqual([
      { kind: 'business', id: 'old-biz' },
      { kind: 'product', id: 'old-prod' },
    ]);
    pushLocal({ kind: 'business', id: 'old-biz' });
    expect(getLocal()[0]).toEqual({ kind: 'business', id: 'old-biz', viewedAt: expect.any(String) });
    expect(getLocal()).toHaveLength(2);
  });

  it('clears all entries with clearLocal()', () => {
    pushLocal({ kind: 'business', id: 'biz-1' });
    expect(getLocal().length).toBe(1);
    clearLocal();
    expect(getLocal()).toEqual([]);
  });

  it('handles invalid or corrupted JSON gracefully', () => {
    localStorage.setItem('tibu.recent', '{"not": "an array"}');
    expect(getLocal()).toEqual([]);

    localStorage.setItem('tibu.recent', 'corrupt json {{');
    expect(getLocal()).toEqual([]);
  });

  it('returns empty array when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(getLocal()).toEqual([]);
    expect(() => pushLocal({ kind: 'business', id: 'b1' })).not.toThrow();
    expect(() => clearLocal()).not.toThrow();
  });
});
