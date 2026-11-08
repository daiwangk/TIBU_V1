import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUnreadCounts,
  listNotifications,
  markNotificationsRead,
} from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';

/**
 * Signed-in user's notification inbox, newest first.
 *
 * @param {{ limit?: number, offset?: number }} [params]
 */
export function useNotifications({ limit = 20, offset = 0 } = {}) {
  const authStatus = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: [...qk.notifications, { limit, offset }],
    queryFn: () => listNotifications({ limit, offset }),
    enabled: authStatus === 'authenticated',
  });
}

/** Signed-in notification pages, with the next offset derived from fetched pages. */
export function useInfiniteNotifications({ limit = 20 } = {}) {
  const authStatus = useAuthStore((s) => s.status);
  return useInfiniteQuery({
    queryKey: [...qk.notifications, { limit, infinite: true }],
    queryFn: ({ pageParam }) => listNotifications({ limit, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === limit ? pages.length * limit : undefined,
    enabled: authStatus === 'authenticated',
  });
}

/**
 * Mark one, many, or all notifications read. Refreshes the list and unread badge.
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => markNotificationsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications });
      queryClient.invalidateQueries({ queryKey: qk.unread });
    },
  });
}

/**
 * Unread notification + enquiry counts. Polls every 60s and on window focus.
 * Opening a thread (`useMarkThreadRead`) already invalidates `qk.unread`.
 */
export function useUnreadCounts() {
  const authStatus = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.unread,
    queryFn: getUnreadCounts,
    enabled: authStatus === 'authenticated',
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
