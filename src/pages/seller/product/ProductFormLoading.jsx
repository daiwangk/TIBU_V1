import { ChevronLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ErrorState from '../../../components/ui/ErrorState';
import Skeleton from '../../../components/ui/Skeleton';

/**
 * What ProductForm shows while the categories load (or if they fail): the way back, and a skeleton or
 * an error with retry.
 *
 * @param {{ error?: unknown, onRetry: () => void, onClose: () => void }} props `error` set = failed
 */
export default function ProductFormLoading({ error, onRetry, onClose }) {
  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="ghost" className="self-start" onClick={onClose}>
        <ChevronLeft size={18} aria-hidden="true" />
        Products
      </Button>
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : (
        <div className="flex flex-col gap-4" role="status" aria-label="Loading">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}
    </div>
  );
}
