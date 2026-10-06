import { useNavigate } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useProductSearch } from '../../queries/catalog';
import { useSearchOrigin } from '../../stores/location';
import HomeSection from './HomeSection';
import ProductRowSkeleton from './ProductRowSkeleton';

// radiusKm: null keeps this row city-wide while still returning distances (DECISIONS D30).
// `near` defaults to the stored origin; nearest first once a location is set.
const PARAMS = { availableToday: true, limit: 8, radiusKm: null };

/** "Available today" row. */
export default function AvailableTodaySection() {
  const navigate = useNavigate();
  const origin = useSearchOrigin();
  const query = useProductSearch({ ...PARAMS, sort: origin ? 'distance' : 'newest' });

  return (
    <HomeSection
      title="Available today"
      viewAllTo="/search?tab=products&today=1"
      query={query}
      skeleton={<ProductRowSkeleton />}
      errorMessage="We couldn't load today's products."
      empty={{
        icon: <CalendarCheck size={28} strokeWidth={1.75} aria-hidden="true" />,
        title: 'Nothing marked for today yet',
        text: 'Sellers update this daily. Browse all products in the meantime.',
        action: { label: 'Browse products', onClick: () => navigate('/search?tab=products') },
      }}
      renderItem={(p) => <ProductCard key={p.id} product={p} variant="row" />}
    />
  );
}
