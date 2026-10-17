import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BusinessCard from '../../components/BusinessCard';
import ProductCard from '../../components/ProductCard';
import SaveButton from '../../components/SaveButton';
import BookmarkHeart from '../../components/decor/BookmarkHeart';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import Tabs from '../../components/ui/Tabs';
import { parseSavedTab, stillSaved } from '../../lib/savedHelpers';
import { useSavedBusinesses, useSavedIds, useSavedProducts } from '../../queries/saved';

/** Shaped like the ProductCard grid: bordered card, square image, name, price. */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy="true" aria-label="Loading saved products">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-card border border-border bg-surface" aria-hidden="true">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-1 p-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shaped like BusinessCard: logo square + text lines. */
function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading saved businesses">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3" aria-hidden="true">
          <Skeleton className="h-14 w-14 flex-shrink-0 rounded-card" />
          <Skeleton variant="text" lines={3} className="flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * One tab's body: the four states for its list.
 * @param {{ query: import('@tanstack/react-query').UseQueryResult<any[]>, savedIds: string[]|undefined, kind: 'product'|'business' }} props
 */
function SavedList({ query, savedIds, kind }) {
  const isProducts = kind === 'product';

  if (query.isPending) return isProducts ? <GridSkeleton /> : <ListSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = stillSaved(query.data, savedIds);
  if (items.length === 0) {
    // The only place a bookmark appears; save itself is always the heart (D40).
    return (
      <EmptyState
        illustration={<BookmarkHeart className="h-28 w-36" />}
        title="Nothing saved yet!"
        text={
          isProducts
            ? 'Tap the heart on any product you love to find it here later.'
            : 'Tap the heart on any business you love to find it here later.'
        }
        action={{ label: <>Explore Now <ArrowRight size={18} aria-hidden="true" /></>, to: '/' }}
        actionVariant="accent"
      />
    );
  }

  const countRow = (
    <p className="mb-3 font-body text-sm font-semibold text-body">
      {isProducts ? 'Saved products' : 'Saved businesses'} · {items.length}
    </p>
  );

  if (isProducts) {
    return (
      <>
        {countRow}
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} variant="grid" action={<SaveButton kind="product" id={p.id} overlay />} />
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      {countRow}
      <div className="flex flex-col gap-3">
        {items.map((b) => (
          <BusinessCard key={b.id} business={b} action={<SaveButton kind="business" id={b.id} />} />
        ))}
      </div>
    </>
  );
}

/** /saved (RequireAuth) — Products | Businesses, chosen with ?tab=. */
export default function SavedPage() {
  const [params, setParams] = useSearchParams();
  const tab = parseSavedTab(params.get('tab'));
  const { data: savedIds } = useSavedIds();
  const products = useSavedProducts();
  const businesses = useSavedBusinesses();

  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur-[14px]">
        <h1 className="px-screen pt-5 pb-2 font-heading text-3xl font-extrabold text-primary">Saved</h1>
        <Tabs
          value={tab}
          onChange={(value) => setParams({ tab: value }, { replace: true })}
          items={[
            { value: 'products', label: 'Products' },
            { value: 'businesses', label: 'Businesses' },
          ]}
        />
      </header>
      <main className="px-screen pt-4 pb-8" role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'products' ? (
          <SavedList query={products} savedIds={savedIds?.productIds} kind="product" />
        ) : (
          <SavedList query={businesses} savedIds={savedIds?.businessIds} kind="business" />
        )}
      </main>
    </div>
  );
}
