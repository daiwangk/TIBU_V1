import { markNotificationsRead } from '../services/index.js';
import { qk } from './keys.js';

export const notificationReadKey = ['notificationRead'];

/** Snapshot visible IDs: pending reads must never mask notifications arriving later. */
export function notificationReadOptions(queryClient) {
  return {
    mutationKey: notificationReadKey,
    mutationFn: (ids) => markNotificationsRead(ids),
    onMutate: (ids) => {
      const items = queryClient.getQueriesData({ queryKey: qk.notifications })
        .flatMap(([, data]) => Array.isArray(data) ? data : data?.pages.flat() ?? []);
      return { ids: [...new Set(items.filter((item) => !item.readAt
        && (ids === 'all' || ids.includes(item.id))).map((item) => item.id))] };
    },
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.notifications }),
      queryClient.invalidateQueries({ queryKey: qk.unread }),
    ]),
  };
}

/** Pending display only. Failure removes the overlay; canonical cache stays intact. */
export function pendingReadSnapshot(mutation) {
  return mutation.state.status === 'pending' ? mutation.state.context?.ids ?? [] : [];
}
