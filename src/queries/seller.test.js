import { afterEach, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { startAuthSync } from '../app/authSync.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';
import { useSaveMyBusiness } from './seller.js';

const mocks = vi.hoisted(() => ({ client: null, saveMyBusiness: vi.fn() }));
vi.mock('../services/index.js', () => ({ saveMyBusiness: mocks.saveMyBusiness }));
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

it('keeps a slow save from account A out of account B’s business cache', async () => {
  const a = { userId: 'A', email: 'a@example.invalid' };
  const b = { userId: 'B', email: 'b@example.invalid' };
  const businessA = { id: 'shop-a', name: 'A’s shop' };
  const businessB = { id: 'shop-b', name: 'B’s shop' };
  mocks.client = new QueryClient();
  let emit;
  const stop = startAuthSync({
    dataSource: 'supabase',
    getSession: async () => null,
    onAuthChange: (listener) => { emit = listener; return () => {}; },
    queryClient: mocks.client,
    setSession: useAuthStore.getState().setSession,
  });
  let resolveSave;
  mocks.saveMyBusiness.mockImplementation(() => new Promise((resolve) => { resolveSave = resolve; }));

  try {
    emit(a, 'SIGNED_IN');
    const pending = mocks.client.getMutationCache()
      .build(mocks.client, useSaveMyBusiness())
      .execute({ name: businessA.name });
    await vi.waitFor(() => expect(mocks.saveMyBusiness).toHaveBeenCalledOnce());

    emit(b, 'SIGNED_IN');
    mocks.client.setQueryData(qk.myBusiness, businessB);
    resolveSave(businessA);
    await pending;

    expect(useAuthStore.getState().session).toEqual(b);
    expect(mocks.client.getQueryData(qk.myBusiness)).toEqual(businessB);
  } finally {
    stop();
  }
});
