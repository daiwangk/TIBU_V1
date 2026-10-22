/**
 * Enquiry queries and gate handler — src/queries/enquiries.js
 *
 * Implements non-real-time customer-seller enquiry hooks and registers the
 * 'enquiry' login gate handler (DECISIONS D10, D11, D20, D34).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userMessage } from '../lib/errors.js';
import {
  findMyThread,
  getThread,
  listMyThreads,
  markThreadRead,
  sendEnquiry,
  sendMessage,
} from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { registerGateHandler, useLoginGateStore } from '../stores/loginGate.js';
import { qk } from './keys.js';

// ---------------------------------------------------------------------------
// Gate handler — plain function, no hooks (registered at module load)
// ---------------------------------------------------------------------------

/**
 * Creates an action object for loginGateStore.request().
 *
 * @param {{ businessId: string, productId?: string|null, body: string, returnTo?: string }} params
 */
export function enquiryGateAction({ businessId, productId = null, body, returnTo = '/' }) {
  return {
    type: 'enquiry',
    payload: { businessId, productId, body },
    returnTo,
  };
}

/**
 * Replays a pending enquiry action after the user logs in.
 * Sends the draft message, invalidates caches, and navigates to the thread.
 *
 * @param {{ type: 'enquiry', payload: { businessId: string, productId?: string|null, body: string } }} action
 * @param {import('@tanstack/react-query').QueryClient|null} queryClient
 */
export async function performEnquiryAction(action, queryClient = null) {
  const { businessId, productId = null, body } = action.payload ?? {};
  if (!businessId || !body) return;

  try {
    const threadId = await sendEnquiry({ businessId, productId, body });

    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: qk.thread(threadId) }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['threads'] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: qk.myThread(businessId) }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: qk.unread }).catch(() => {});
    }

    const targetUrl = `/enquiries/${encodeURIComponent(threadId)}`;
    if (queryClient && typeof queryClient.navigate === 'function') {
      queryClient.navigate(targetUrl);
    } else if (typeof window !== 'undefined' && window.location) {
      window.location.assign(targetUrl);
    }
  } catch (err) {
    if (err?.code === 'auth_required') {
      useLoginGateStore.getState().request(action);
      return;
    }
    toast.error(userMessage(err));
  }
}

// Register once at module load
registerGateHandler('enquiry', performEnquiryAction);

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

/**
 * Mutation to send a new enquiry or follow-up message on customer's thread.
 * Invalidates the thread, both lists ('threads') and unread counts.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<string, Error, { businessId: string, productId?: string|null, body: string }>}
 */
export function useSendEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ businessId, productId = null, body }) =>
      sendEnquiry({ businessId, productId, body }),

    onSuccess: (threadId, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: qk.thread(threadId) });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      if (businessId) {
        queryClient.invalidateQueries({ queryKey: qk.myThread(businessId) });
      }
      queryClient.invalidateQueries({ queryKey: qk.unread });
    },

    onError: (err) => {
      toast.error(userMessage(err));
    },
  });
}

/**
 * Mutation for seller replies (direct message insert).
 * Invalidates the thread, both lists and unread counts.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<import('../services/contract.js').EnquiryMessage, Error, { threadId: string, body: string }>}
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, body }) => sendMessage({ threadId, body }),

    onSuccess: (_data, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: qk.thread(threadId) });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: qk.unread });
    },

    onError: (err) => {
      toast.error(userMessage(err));
    },
  });
}

/**
 * Mutation to mark a thread as read and clear associated notifications.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult<void, Error, string>}
 */
export function useMarkThreadRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId) => markThreadRead(threadId),

    onSuccess: (_data, threadId) => {
      queryClient.invalidateQueries({ queryKey: qk.thread(threadId) });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: qk.unread });
      queryClient.invalidateQueries({ queryKey: qk.notifications });
    },

    onError: (err) => {
      toast.error(userMessage(err));
    },
  });
}

/**
 * Query for the user's enquiry threads list (as customer or seller).
 *
 * @param {{ as?: 'customer'|'seller' }} [options]
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').EnquiryThread[]>}
 */
export function useMyThreads({ as = 'customer' } = {}) {
  const authStatus = useAuthStore((s) => s.status);

  return useQuery({
    queryKey: qk.threads(as),
    queryFn: () => listMyThreads({ as }),
    enabled: authStatus === 'authenticated',
    staleTime: 15_000,
  });
}

/**
 * Query for a specific thread detail and messages.
 *
 * @param {string|null|undefined} threadId
 * @param {{ as?: 'customer'|'seller' }} [options]
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../services/contract.js').ThreadDetail|null>}
 */
export function useThread(threadId, { as } = {}) {
  const authStatus = useAuthStore((s) => s.status);

  return useQuery({
    queryKey: qk.thread(threadId),
    queryFn: () => getThread(threadId, { as }),
    enabled: Boolean(threadId) && authStatus === 'authenticated',
  });
}

/**
 * Query to find the customer's existing thread ID for a business (if any).
 *
 * @param {string|null|undefined} businessId
 * @returns {import('@tanstack/react-query').UseQueryResult<string|null>}
 */
export function useMyThread(businessId) {
  const authStatus = useAuthStore((s) => s.status);

  return useQuery({
    queryKey: qk.myThread(businessId),
    queryFn: () => findMyThread(businessId),
    enabled: Boolean(businessId) && authStatus === 'authenticated',
  });
}
