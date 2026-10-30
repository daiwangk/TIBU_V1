/**
 * Admin hooks — src/queries/admin.js. One hook per admin service (CONTRACT §7). The list is loaded once
 * for every status and grouped on the client.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { decideApplication, getApplication, listApplications } from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';

function useAdminQuery(queryKey, queryFn) {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    // Admin screens render their own loading and error states.
    meta: { silent: true },
    queryKey,
    queryFn,
    enabled: status === 'authenticated',
  });
}

/** Every application, all statuses (`listApplications({ status: null })`). */
export function useApplications() {
  return useAdminQuery(qk.applications(null), () => listApplications({ status: null }));
}

/** One application with its business, owner row and history; `null` for an unknown id. */
export function useApplication(businessId) {
  return useAdminQuery(qk.application(businessId), () => getApplication(businessId));
}

/**
 * `mutate({ businessId, action, reason })`. Refreshes the lists, the application and the public catalog
 * whether it worked or not: a conflict means the status moved meanwhile, and the page must show the real one.
 */
export function useDecideApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => decideApplication(input),
    onSettled: (_data, _error, input) =>
      Promise.all(
        [['applications'], qk.application(input.businessId), ['business'], ['businesses'], ['products']].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}
