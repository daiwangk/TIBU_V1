import HomeHeader from './HomeHeader';
import HomeHero from './HomeHero';
import LocationPrompt from './LocationPrompt';
import CategoryShortcuts from '../../components/CategoryShortcuts';
import NewBusinessesSection from './NewBusinessesSection';
import NewProductsSection from './NewProductsSection';
import AvailableTodaySection from './AvailableTodaySection';
import NearYouSection from './NearYouSection';

/**
 * Home `/` — brand header, hero search, category shortcuts and discovery rows.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0 max-w-full overflow-x-hidden">
      <HomeHeader />
      <main className="flex flex-col gap-6 pb-6 w-full min-w-0">
        <HomeHero />
        <LocationPrompt />
        <CategoryShortcuts />
        <NewBusinessesSection />
        <NewProductsSection />
        <AvailableTodaySection />
        <NearYouSection />
      </main>
    </div>
  );
}
