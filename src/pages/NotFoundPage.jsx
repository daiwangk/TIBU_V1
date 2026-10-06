import { SearchX } from 'lucide-react';
import Button from '../components/ui/Button';

/** 404 page for any unknown route. */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12">
      <div className="flex flex-col items-center gap-4 px-screen text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lavender text-primary">
          <SearchX size={28} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-extrabold text-ink">Page not found</h1>
          <p className="font-body text-sm text-muted">
            This page doesn’t exist, or it may have moved.
          </p>
        </div>
      </div>
      <div className="flex gap-3 px-screen">
        <Button to="/">Go home</Button>
        <Button to="/search" variant="secondary">
          Search
        </Button>
      </div>
    </main>
  );
}
