import HomeHeader from './HomeHeader';
import HomeSearch from './HomeSearch';
import HomeHero from './HomeHero';
import LocationPrompt from './LocationPrompt';
import SectionHeader from '../../components/SectionHeader';
import CategoryShortcuts from '../../components/CategoryShortcuts';
import NewBusinessesSection from './NewBusinessesSection';
import NewProductsSection from './NewProductsSection';
import AvailableTodaySection from './AvailableTodaySection';
import NearYouSection from './NearYouSection';

/**
 * Home `/` — brand header, search, hero band, category shortcuts and discovery rows.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 w-full min-w-0 max-w-full overflow-x-hidden">
      <HomeHeader />
      <HomeSearch />
      <main className="flex flex-col gap-6 pb-6 w-full min-w-0">
        <HomeHero />
        <LocationPrompt />
        <section aria-label="Shop by category" className="flex flex-col gap-2 w-full min-w-0">
          <SectionHeader title="Shop by category" />
          <CategoryShortcuts />
        </section>
        <NewBusinessesSection />
        <NewProductsSection />
        <AvailableTodaySection />
        <NearYouSection />
      </main>
    </div>
  );
}
