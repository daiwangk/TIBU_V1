/**
 * Unit tests for pure helpers in src/queries/saved.js
 *
 * Covers (per task constraint g):
 *   1. isInSavedIds — id-set membership logic
 *   2. applyOptimisticToggle — optimistic update / rollback shape
 */

import { describe, expect, it } from 'vitest';
import { applyOptimisticToggle, isInSavedIds } from './saved.js';

// ---------------------------------------------------------------------------
// isInSavedIds
// ---------------------------------------------------------------------------

describe('isInSavedIds()', () => {
  const savedIds = {
    businessIds: ['biz-1', 'biz-2'],
    productIds: ['prod-1'],
  };

  it('returns true when a business id is in the set', () => {
    expect(isInSavedIds(savedIds, 'business', 'biz-1')).toBe(true);
  });

  it('returns false when a business id is absent', () => {
    expect(isInSavedIds(savedIds, 'business', 'biz-99')).toBe(false);
  });

  it('returns true when a product id is in the set', () => {
    expect(isInSavedIds(savedIds, 'product', 'prod-1')).toBe(true);
  });

  it('returns false when a product id is absent', () => {
    expect(isInSavedIds(savedIds, 'product', 'prod-99')).toBe(false);
  });

  it('returns false for an unknown kind', () => {
    expect(isInSavedIds(savedIds, 'review', 'biz-1')).toBe(false);
  });

  it('returns false when savedIds is null', () => {
    expect(isInSavedIds(null, 'business', 'biz-1')).toBe(false);
  });

  it('returns false when id is empty string', () => {
    expect(isInSavedIds(savedIds, 'business', '')).toBe(false);
  });

  it('does not cross-contaminate kinds (business id not in products)', () => {
    expect(isInSavedIds(savedIds, 'product', 'biz-1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// applyOptimisticToggle
// ---------------------------------------------------------------------------

describe('applyOptimisticToggle()', () => {
  const base = {
    businessIds: ['biz-1'],
    productIds: ['prod-1'],
  };

  it('adds a new business id when saved=true', () => {
    const result = applyOptimisticToggle(base, 'business', 'biz-2', true);
    expect(result.businessIds).toEqual(['biz-1', 'biz-2']);
    // Other field untouched
    expect(result.productIds).toEqual(['prod-1']);
  });

  it('removes a business id when saved=false', () => {
    const result = applyOptimisticToggle(base, 'business', 'biz-1', false);
    expect(result.businessIds).toEqual([]);
    expect(result.productIds).toEqual(['prod-1']);
  });

  it('does not duplicate an id already in the set', () => {
    const result = applyOptimisticToggle(base, 'business', 'biz-1', true);
    expect(result.businessIds).toEqual(['biz-1']);
  });

  it('removing a missing id is a no-op', () => {
    const result = applyOptimisticToggle(base, 'business', 'biz-99', false);
    expect(result.businessIds).toEqual(['biz-1']);
  });

  it('adds a product id without touching businessIds', () => {
    const result = applyOptimisticToggle(base, 'product', 'prod-2', true);
    expect(result.productIds).toEqual(['prod-1', 'prod-2']);
    expect(result.businessIds).toEqual(['biz-1']);
  });

  it('removes a product id without touching businessIds', () => {
    const result = applyOptimisticToggle(base, 'product', 'prod-1', false);
    expect(result.productIds).toEqual([]);
    expect(result.businessIds).toEqual(['biz-1']);
  });

  it('returns the original value unchanged when old is null', () => {
    expect(applyOptimisticToggle(null, 'business', 'biz-1', true)).toBeNull();
  });

  it('returns the original value unchanged when old is undefined', () => {
    expect(applyOptimisticToggle(undefined, 'business', 'biz-1', true)).toBeUndefined();
  });

  it('does not mutate the original object', () => {
    const original = { businessIds: ['biz-1'], productIds: [] };
    applyOptimisticToggle(original, 'business', 'biz-2', true);
    expect(original.businessIds).toEqual(['biz-1']);
  });
});
