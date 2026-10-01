import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWithExpiry, readJSON, setWithExpiry, writeJSON } from './storage.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('safe localStorage helpers', () => {
  it('reads and writes JSON, falling back for unavailable or invalid values', () => {
    const storage = createStorage();
    vi.stubGlobal('localStorage', storage);

    expect(writeJSON('profile', { name: 'Riya' })).toBe(true);
    expect(readJSON('profile', null)).toEqual({ name: 'Riya' });
    storage.setItem('broken', '{');
    expect(readJSON('broken', 'fallback')).toBe('fallback');
  });

  it('returns values before expiry and clears values after expiry', () => {
    const storage = createStorage();
    vi.stubGlobal('localStorage', storage);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));

    expect(setWithExpiry('location', { lat: 19.1 }, 1_000)).toBe(true);
    expect(getWithExpiry('location')).toEqual({ lat: 19.1 });
    vi.advanceTimersByTime(1_000);
    expect(getWithExpiry('location')).toBeNull();
    expect(storage.getItem('location')).toBeNull();
    vi.useRealTimers();
  });

  it('fails safely when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(readJSON('missing', 'fallback')).toBe('fallback');
    expect(writeJSON('missing', 'value')).toBe(false);
    expect(getWithExpiry('missing')).toBeNull();
  });
});
