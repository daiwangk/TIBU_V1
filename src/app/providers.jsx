import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { shouldToast, userMessage } from '../lib/errors';

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

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * App-wide providers: TanStack Query + sonner toasts.
 * @param {{ children: React.ReactNode }} props
 */
export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
