import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import BusinessCard from '../../components/BusinessCard';
import { useBusinessSearch } from '../../queries/catalog';
import HomeSection from './HomeSection';
import BusinessRowSkeleton from './BusinessRowSkeleton';

// TODO(A2.2): add `near` from useSearchOrigin() once src/stores/location.js exists.
// radiusKm: null keeps this row city-wide while still returning distances (DECISIONS D30).
const PARAMS = { sort: 'newest', limit: 8, radiusKm: null };

/** "New businesses" row. */
export default function NewBusinessesSection() {
  const navigate = useNavigate();
  const query = useBusinessSearch(PARAMS);

  return (
    <HomeSection
      title="New businesses"
      viewAllTo="/search?tab=businesses&sort=newest"
      query={query}
      skeleton={<BusinessRowSkeleton />}
      errorMessage="We couldn't load new businesses."
      empty={{
        icon: <Store size={28} strokeWidth={1.75} aria-hidden="true" />,
        title: 'No new businesses yet',
        text: 'Homegrown sellers are joining soon. Explore what is already on Tibu.',
        action: { label: 'Explore Tibu', onClick: () => navigate('/search') },
      }}
      renderItem={(b) => (
        <BusinessCard key={b.id} business={b} className="w-72 flex-shrink-0 snap-start" />
      )}
    />
  );
}
