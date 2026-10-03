import { useNavigate } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useProductSearch } from '../../queries/catalog';
import HomeSection from './HomeSection';
import ProductRowSkeleton from './ProductRowSkeleton';

// TODO(A2.2): add `near` from useSearchOrigin() once src/stores/location.js exists.
// radiusKm: null keeps this row city-wide while still returning distances (DECISIONS D30).
const PARAMS = { sort: 'newest', limit: 8, radiusKm: null };

/** "New products" row. */
export default function NewProductsSection() {
  const navigate = useNavigate();
  const query = useProductSearch(PARAMS);

  return (
    <HomeSection
      title="New products"
      viewAllTo="/search?tab=products&sort=newest"
      query={query}
      skeleton={<ProductRowSkeleton />}
      errorMessage="We couldn't load new products."
      empty={{
        icon: <PackageOpen size={28} strokeWidth={1.75} aria-hidden="true" />,
        title: 'No new products yet',
        text: 'Sellers are adding new items. Check back soon.',
        action: { label: 'Search products', onClick: () => navigate('/search?tab=products') },
      }}
      renderItem={(p) => <ProductCard key={p.id} product={p} variant="row" />}
    />
  );
}
