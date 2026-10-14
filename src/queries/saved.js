/**
 * useSavedIds, useIsSaved, useToggleSave — src/queries/saved.js
 *
 * Also registers the 'save' gate handler so a guest-initiated save is
 * replayed after login. GateResumer imports this module as a side-effect so
 * the handler is guaranteed to be registered before resumePending() fires.
 *
 * Exported pure helpers (isInSavedIds, applyOptimisticToggle) are unit-tested
 * in saved.test.js.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSavedIds, setSaved } from '../services/index.js';
import { registerGateHandler, useLoginGateStore } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';
import { userMessage } from '../lib/errors.js';
import { qk } from './keys.js';

// ---------------------------------------------------------------------------
// Pure helpers (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Returns true when `id` is in the saved set for the given kind.
 *
 * @param {import('../services/contract.js').SavedIds|null|undefined} savedIds
 * @param {'business'|'product'} kind
 * @param {string} id
 * @returns {boolean}
 */
export function isInSavedIds(savedIds, kind, id) {
  if (!savedIds || !id) return false;
  if (kind === 'business') return savedIds.businessIds.includes(id);
  if (kind === 'product') return savedIds.productIds.includes(id);
  return false;
}

/**
 * Pure: compute the next SavedIds after a toggle (used inside onMutate).
 *
 * @param {import('../services/contract.js').SavedIds|null|undefined} old
 * @param {'business'|'product'} kind
 * @param {string} id
 * @param {boolean} saved
 * @returns {import('../services/contract.js').SavedIds|null|undefined}
 */
export function applyOptimisticToggle(old, kind, id, saved) {
  if (!old) return old;
  const field = kind === 'business' ? 'businessIds' : 'productIds';
  const ids = old[field] ?? [];
  const next = saved
    ? [...new Set([...ids, id])]
    : ids.filter((x) => x !== id);
  return { ...old, [field]: next };
}

// ---------------------------------------------------------------------------
// Gate handler — plain function, no hooks (registered at module load)
// ---------------------------------------------------------------------------

/**
 * Replays a pending save action after the user logs in.
 * Called by resumePending(queryClient) in GateResumer.
 *
 * @param {{ type: 'save', payload: { kind: 'business'|'product', id: string, saved: boolean } }} action
 * @param {import('@tanstack/react-query').QueryClient|null} queryClient
 */
async function performSaveAction(action, queryClient = null) {
  const { kind, id, saved } = action.payload ?? {};
  // Malformed payload — clear silently (prevents a retry loop)
  if (!kind || !id) return;

  try {
    await setSaved({ kind, id, saved });
    if (queryClient) {
      const listKey = kind === 'business' ? qk.savedBusinesses : qk.savedProducts;
      queryClient.invalidateQueries({ queryKey: qk.saved }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: listKey }).catch(() => {});
    }
  } catch (err) {
    if (err?.code === 'auth_required') {
      // Session expired between login and resume — re-gate
      useLoginGateStore.getState().request(action);
      return;
    }
    toast.error(userMessage(err));
  }
}

// Register once at module load (constraint b)
registerGateHandler('save', performSaveAction);

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

/**
 * Fetches the id-set of saved businesses and products.
 * Disabled until the user is authenticated.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').SavedIds>}
 */
export function useSavedIds() {
  const authStatus = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.saved,
    queryFn: getSavedIds,
    enabled: authStatus === 'authenticated',
    staleTime: 30_000,
  });
}

/**
 * Returns whether a specific entity is currently saved by the user.
 * Derived from the cached id-set; causes no extra fetch.
 *
 * @param {'business'|'product'} kind
 * @param {string|null|undefined} id
 * @returns {boolean}
 */
export function useIsSaved(kind, id) {
  const { data } = useSavedIds();
  return isInSavedIds(data, kind, id ?? '');
}

/**
 * Mutation to toggle saved state.
 *   - Applies an optimistic update on qk.saved immediately.
 *   - Rolls back and toasts on error.
 *   - Invalidates the id-set and the relevant list cache on settle.
 *
 * Caller is responsible for gate-checking auth before calling mutate.
 * (When the user is a guest, call loginGateStore.request({ type: 'save', ... })
 * instead of mutate — the gate handler will run after login.)
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ kind, id, saved }) => setSaved({ kind, id, saved }),

    onMutate: async ({ kind, id, saved }) => {
      await queryClient.cancelQueries({ queryKey: qk.saved });
      const previous = queryClient.getQueryData(qk.saved);
      queryClient.setQueryData(qk.saved, (old) =>
        applyOptimisticToggle(old, kind, id, saved),
      );
      return { previous };
    },

    onError: (err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(qk.saved, context.previous);
      }
      toast.error(userMessage(err));
    },

    onSettled: (_data, _err, { kind }) => {
      queryClient.invalidateQueries({ queryKey: qk.saved });
      queryClient.invalidateQueries({
        queryKey: kind === 'business' ? qk.savedBusinesses : qk.savedProducts,
      });
    },
  });
}
