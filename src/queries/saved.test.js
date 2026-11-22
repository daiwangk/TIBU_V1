/**
 * Unit tests for pure helpers in src/queries/saved.js
 *
 * Covers (per task constraint g):
 *   1. isInSavedIds — id-set membership logic
 *   2. applyOptimisticToggle — optimistic update / rollback shape
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';
import { applyOptimisticToggle, isInSavedIds, useToggleSave } from './saved.js';

const mocks = vi.hoisted(() => ({ client: null, setSaved: vi.fn() }));
vi.mock('../services/index.js', () => ({ setSaved: mocks.setSaved }));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...await importOriginal(),
  useQueryClient: () => mocks.client,
  useMutation: (options) => options,
}));

afterEach(() => {
  mocks.client?.clear();
  useAuthStore.setState(useAuthStore.getInitialState(), true);
  vi.resetAllMocks();
});

it('does not roll back the next account’s saved list when the previous save fails', async () => {
  const { setSession } = useAuthStore.getState();
  const savedA = { businessIds: ['a'], productIds: [] };
  const savedB = { businessIds: ['b'], productIds: [] };
  mocks.client = new QueryClient();
  setSession({ userId: 'A', email: 'a@example.invalid' });
  mocks.client.setQueryData(qk.saved, savedA);
  let rejectSave;
  mocks.setSaved.mockImplementation(() => new Promise((_resolve, reject) => { rejectSave = reject; }));
  const pending = mocks.client.getMutationCache()
    .build(mocks.client, useToggleSave())
    .execute({ kind: 'business', id: 'extra', saved: true })
    .catch((error) => error);
  await vi.waitFor(() => expect(mocks.setSaved).toHaveBeenCalledOnce());
  expect(mocks.client.getQueryData(qk.saved).businessIds).toEqual(['a', 'extra']);

  mocks.client.clear();
  setSession({ userId: 'B', email: 'b@example.invalid' });
  mocks.client.setQueryData(qk.saved, savedB);
  rejectSave(new Error('save failed'));
  expect(await pending).toMatchObject({ message: 'save failed' });
  expect(mocks.client.getQueryData(qk.saved)).toEqual(savedB);
});

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
