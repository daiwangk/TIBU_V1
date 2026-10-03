import { Link } from 'react-router-dom';
import HorizontalScroller from '../../components/HorizontalScroller';
import ErrorState from '../../components/ui/ErrorState';
import { useCategories } from '../../queries/catalog';
import { getCategoryIcon } from '../../lib/categoryIcons';

/** Pastel tile colours, cycled by position. */
const TILE_BG = ['bg-lavender', 'bg-blush', 'bg-lime', 'bg-mint'];
const SKELETON_COUNT = 6;

/**
 * Top-level category shortcuts (parentSlug === null) as round pastel tiles.
 * Hidden when there are no categories.
 */
export default function CategoryShortcuts() {
  const { data, isPending, isError, refetch } = useCategories();

  if (isPending) {
    return (
      <section aria-label="Categories" aria-busy="true" className="w-full min-w-0">
        <HorizontalScroller className="py-1">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="flex w-16 flex-shrink-0 flex-col items-center gap-2 py-1"
            >
              <span className="block h-16 w-16 rounded-full bg-border motion-safe:animate-pulse" />
              <span className="block h-3 w-12 rounded bg-border motion-safe:animate-pulse" />
            </div>
          ))}
        </HorizontalScroller>
      </section>
    );
  }

  if (isError) {
    return (
      <ErrorState message="We couldn't load categories." onRetry={() => refetch()} />
    );
  }

  const topLevel = (data ?? []).filter((c) => c.parentSlug === null);
  if (topLevel.length === 0) {
    return (
      <p className="px-screen font-body text-sm text-muted">
        Categories aren't available right now.
      </p>
    );
  }

  return (
    <section aria-label="Categories" className="w-full min-w-0">
      <HorizontalScroller className="py-1">
        {topLevel.map((cat, i) => {
          const Icon = getCategoryIcon(cat.slug);
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex w-16 flex-shrink-0 snap-start flex-col items-center gap-2 rounded-card py-1 no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full text-primary ${TILE_BG[i % TILE_BG.length]} group-active:opacity-80 motion-safe:transition-opacity motion-safe:duration-150`}
              >
                <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="line-clamp-2 text-center font-body text-xs font-semibold leading-tight text-ink">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </HorizontalScroller>
    </section>
  );
}
