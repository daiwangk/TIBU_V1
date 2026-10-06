import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import BusinessCard from '../../components/BusinessCard';
import { useBusinessSearch } from '../../queries/catalog';
import { useSearchOrigin } from '../../stores/location';
import HomeSection from './HomeSection';
import BusinessRowSkeleton from './BusinessRowSkeleton';

// Default radius (15 km) applies — this row is about what is genuinely close.
const PARAMS = { sort: 'distance', limit: 8 };

/** "Near you" row — only rendered once a location is set, and hidden if nothing is nearby. */
export default function NearYouSection() {
  const navigate = useNavigate();
  const origin = useSearchOrigin();
  const query = useBusinessSearch(PARAMS, { enabled: !!origin });

  if (!origin) return null;
  if (!query.isPending && !query.isError && (query.data?.length ?? 0) === 0) return null;

  return (
    <HomeSection
      title="Near you"
      viewAllTo="/search?tab=businesses&sort=distance"
      query={query}
      skeleton={<BusinessRowSkeleton />}
      errorMessage="We couldn't load businesses near you."
      empty={{
        icon: <MapPin size={28} strokeWidth={1.75} aria-hidden="true" />,
        title: 'Nothing nearby yet',
        action: { label: 'Explore Tibu', onClick: () => navigate('/search') },
      }}
      renderItem={(b) => (
        <BusinessCard key={b.id} business={b} className="w-72 flex-shrink-0 snap-start" />
      )}
    />
  );
}
