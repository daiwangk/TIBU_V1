import { useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import HorizontalScroller from '../../components/HorizontalScroller';
import BookmarkHeart from '../../components/decor/BookmarkHeart';
import ProductRowSkeleton from '../home/ProductRowSkeleton';
import BusinessRowSkeleton from '../home/BusinessRowSkeleton';
import GallerySection from './GallerySection';

// Values differ from the older Tabs demo on the same page, so tab ids stay unique.
const TABS = [
  { value: 'saved-products', label: 'Saved products' },
  { value: 'saved-businesses', label: 'Saved businesses' },
];

/** /dev/ui (D2): empty (default + Saved illustration), error, skeleton rows, tabs, toasts. */
export default function GalleryStates() {
  const [tab, setTab] = useState('saved-products');

  return (
    <GallerySection id="d2-states" title="D2 · States" description="Empty, error, loading, tabs and toasts">
      <Tabs value={tab} onChange={setTab} items={TABS} />
      <EmptyState
        illustration={<BookmarkHeart className="h-28 w-36" />}
        title="Nothing saved yet!"
        text="Tap the heart on anything you love and it will show up here."
        action={{ label: <>Explore Now <ArrowRight size={18} aria-hidden="true" /></>, to: '/' }}
        actionVariant="accent"
      />
      <EmptyState
        icon={<ShoppingBag size={28} strokeWidth={1.5} />}
        title="No products yet"
        text="This business hasn't listed any products."
      />
      <ErrorState message="We couldn't load the products. Check your connection." onRetry={() => {}} />
      <HorizontalScroller className="py-1">
        <ProductRowSkeleton count={2} />
      </HorizontalScroller>
      <HorizontalScroller className="py-1">
        <BusinessRowSkeleton count={1} />
      </HorizontalScroller>
      <div className="flex flex-wrap gap-3 px-screen">
        <Button variant="secondary" size="sm" onClick={() => toast('Link copied')}>Toast</Button>
        <Button variant="secondary" size="sm" onClick={() => toast.success('Saved to your list')}>Success toast</Button>
        <Button variant="secondary" size="sm" onClick={() => toast.error("We couldn't save that. Try again.")}>Error toast</Button>
      </div>
    </GallerySection>
  );
}
