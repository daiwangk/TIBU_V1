import { Heart, Store } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BusinessCard from '../../components/BusinessCard';
import ProductCard from '../../components/ProductCard';
import SaveButton from '../../components/SaveButton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import Tabs from '../../components/ui/Tabs';
import { parseSavedTab, stillSaved } from '../../lib/savedHelpers';
import { useSavedBusinesses, useSavedIds, useSavedProducts } from '../../queries/saved';

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy="true" aria-label="Loading saved products">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2" aria-hidden="true">
          <Skeleton className="aspect-square w-full rounded-card" />
          <Skeleton variant="text" lines={2} />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading saved businesses">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-card" />
      ))}
    </div>
  );
}

/**
 * One tab's body: the four states for its list.
 * @param {{ query: import('@tanstack/react-query').UseQueryResult<any[]>, savedIds: string[]|undefined, kind: 'product'|'business' }} props
 */
function SavedList({ query, savedIds, kind }) {
  const navigate = useNavigate();
  const isProducts = kind === 'product';

  if (query.isPending) return isProducts ? <GridSkeleton /> : <ListSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = stillSaved(query.data, savedIds);
  if (items.length === 0) {
    return (
      <EmptyState
        icon={isProducts ? <Heart size={28} aria-hidden="true" /> : <Store size={28} aria-hidden="true" />}
        title={isProducts ? 'No saved products yet' : 'No saved businesses yet'}
        text="Tap the heart on anything you like to find it here later."
        action={{ label: 'Explore Home', onClick: () => navigate('/') }}
      />
    );
  }

  if (isProducts) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="grid" action={<SaveButton kind="product" id={p.id} overlay />} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((b) => (
        <BusinessCard key={b.id} business={b} action={<SaveButton kind="business" id={b.id} />} />
      ))}
    </div>
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
      <header className="sticky top-0 z-10 bg-surface">
        <h1 className="px-screen pt-5 pb-2 font-heading text-2xl font-bold text-ink">Saved</h1>
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
