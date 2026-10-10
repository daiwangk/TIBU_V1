import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { shouldToast, userMessage } from '../lib/errors';
import { isAppError } from '../services/errors';
import AuthBootstrap from './AuthBootstrap';

/**
 * Global failure handler for queries and mutations.
 * The message doubles as the toast id so repeated failures don't stack.
 *
 * @param {unknown} error
 * @param {{ meta?: { silent?: boolean } }} source query or mutation
 */
function handleError(error, source) {
  if (!shouldToast(error, source.meta)) return;
  const message = userMessage(error);
  toast.error(message, { id: message });
}

const NO_RETRY_CODES = new Set(['rate_limited', 'forbidden', 'auth_required', 'validation', 'conflict', 'not_found', 'business_not_available', 'config', 'unavailable_in_mock']);

/** One retry for transient failures only — never re-send a rate-limited or rejected request. */
function shouldRetry(failureCount, error) {
  if (isAppError(error) && NO_RETRY_CODES.has(error.code)) return false;
  return failureCount < 1;
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * App-wide providers: TanStack Query, auth session restore + sonner toasts.
 * @param {{ children: React.ReactNode }} props
 */
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
