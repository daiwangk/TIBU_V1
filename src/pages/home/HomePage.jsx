import HomeHeader from './HomeHeader';
import HomeHero from './HomeHero';
import CategoryShortcuts from './CategoryShortcuts';
import NewBusinessesSection from './NewBusinessesSection';
import NewProductsSection from './NewProductsSection';
import AvailableTodaySection from './AvailableTodaySection';

/**
 * Home `/` — brand header, hero search, category shortcuts and discovery rows.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0 max-w-full overflow-x-hidden">
      <HomeHeader />
      <main className="flex flex-col gap-6 pb-6 w-full min-w-0">
        <HomeHero />
        <CategoryShortcuts />
        <NewBusinessesSection />
        <NewProductsSection />
        <AvailableTodaySection />
        {/* TODO(A2.2): add NearYouSection — useBusinessSearch({ sort: 'distance', limit: 8, near })
            (default 15 km radius), rendered only when useSearchOrigin() returns a location. */}
      </main>
    </div>
  );
}
