/**
 * Review queries and gate handler — src/queries/reviews.js
 *
 * Hooks for the current user's review of a business, and registering the
 * 'review' login gate handler (D10, D11, CONTRACT §3, §7).
 *
 * Gate pattern: when the user taps "Write a review" while unauthenticated,
 * loginGate.request({ type: 'review', payload: { businessId }, returnTo })
 * is called. After login GateResumer navigates to returnTo then calls
 * resumePending → this handler runs → signals ReviewSheet to open via
 * the reviewSheetStore.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { toast } from 'sonner';
import { userMessage } from '../lib/errors.js';
import { deleteMyReview, getMyReview, saveMyReview } from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { registerGateHandler } from '../stores/loginGate.js';
import { qk } from './keys.js';

// ---------------------------------------------------------------------------
// Small store to signal the ReviewSheet to open after gate resume
// ---------------------------------------------------------------------------

/**
 * @typedef {{ pendingBusinessId: string|null, setPending: (id: string|null) => void }} ReviewSheetStore
 */
export const useReviewSheetStore = create((set) => ({
  pendingBusinessId: null,
  /** Set after gate resume to auto-open the ReviewSheet for a business. */
  setPending: (id) => set({ pendingBusinessId: id }),
}));

// ---------------------------------------------------------------------------
// Gate handler — registered once at module load (no hooks allowed here)
// ---------------------------------------------------------------------------

/**
 * Replays a pending 'review' gate action after login.
 * GateResumer has already navigated to returnTo (the business Reviews tab),
 * so here we only need to signal the ReviewSheet to open.
 *
 * @param {{ type: 'review', payload: { businessId: string } }} action
 */
function performReviewAction(action) {
  const { businessId } = action.payload ?? {};
  if (!businessId) return;
  useReviewSheetStore.getState().setPending(businessId);
}

// Register once at module load
registerGateHandler('review', performReviewAction);

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

/**
 * The current user's review for a business, or null if none.
 *
 * @param {string|undefined} businessId
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').Review|null>}
 */
export function useMyReview(businessId) {
  const authStatus = useAuthStore((s) => s.status);
  return useQuery({
    meta: { silent: true },
    queryKey: qk.myReview(businessId),
    queryFn: () => getMyReview(businessId),
    enabled: !!businessId && authStatus === 'authenticated',
  });
}

/**
 * Invalidate all review-related cache entries for a business after a write.
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} businessId
 */
function invalidateReviews(queryClient, businessId) {
  queryClient.invalidateQueries({ queryKey: qk.myReview(businessId) });
  // Invalidate all pages of the public reviews list for this business
  queryClient.invalidateQueries({ queryKey: ['reviews', businessId] });
  // Invalidate business detail caches (rating_avg / rating_count change via DB trigger)
  queryClient.invalidateQueries({ queryKey: ['business'] });
  queryClient.invalidateQueries({ queryKey: qk.me });
}

/**
 * Upsert the current user's review. Invalidates review list, business detail,
 * and qk.me on success. Shows a toast on error.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<
 *   import('../services/contract.js').Review, Error,
 *   { businessId: string, rating: number, body: string }
 * >}
 */
export function useSaveMyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ businessId, rating, body }) => saveMyReview({ businessId, rating, body }),
    onSuccess: (_data, { businessId }) => {
      invalidateReviews(queryClient, businessId);
    },
    onError: (err) => {
      toast.error(userMessage(err));
    },
  });
}

/**
 * Delete the current user's review for a business. Invalidates the same
 * caches as save. Shows a toast on error.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string>}
 */
export function useDeleteMyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId) => deleteMyReview(businessId),
    onSuccess: (_data, businessId) => {
      invalidateReviews(queryClient, businessId);
    },
    onError: (err) => {
      toast.error(userMessage(err));
    },
  });
}
