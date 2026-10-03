import { Store, Share2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useBusiness } from '../../queries/catalog';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import IconButton from '../../components/ui/IconButton';
import SaveButton from '../../components/SaveButton';
import ContactButtons from '../../components/ContactButtons';
import Tabs from '../../components/ui/Tabs';
import BusinessSkeleton from './BusinessSkeleton';
import BusinessHeader from './BusinessHeader';
import ProductsTab from './ProductsTab';
import VideosTab from './VideosTab';
import ReviewsTab from './ReviewsTab';

export default function BusinessPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const rawTab = searchParams.get('tab');
  const validTabs = ['products', 'videos', 'reviews'];
  const activeTab = validTabs.includes(rawTab) ? rawTab : 'products';

  const { data: business, isLoading, isError, refetch } = useBusiness(slug, null);

  if (isLoading) {
    return <BusinessSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader title="Business" fallbackTo="/" />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader title="Business" fallbackTo="/" />
        <EmptyState
          icon={<Store size={32} aria-hidden="true" />}
          title="This business isn't available"
          text="The business you're looking for might have been removed or is no longer listed."
          action={{
            label: 'Back to Home',
            onClick: () => navigate('/'),
          }}
        />
      </div>
    );
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: business.name,
          text: `Check out ${business.name} on Tibu!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast('Link copied to clipboard');
    }
  }

  function handleContact() {
    toast('Contact opens after login — coming soon');
  }

  function handleTabChange(value) {
    setSearchParams({ tab: value }, { replace: true });
  }

  const headerActions = (
    <>
      <SaveButton kind="business" id={business.id} />
      <IconButton label="Share" onClick={handleShare}>
        <Share2 size={20} aria-hidden="true" />
      </IconButton>
    </>
  );

  return (
    <div className="min-h-screen bg-bg pb-28">
      <PageHeader title={business.name} fallbackTo="/" actions={headerActions} />

      <main>
        <BusinessHeader business={business} />

        <div className="sticky top-[61px] z-10 bg-surface">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            items={[
              { value: 'products', label: 'Products' },
              { value: 'videos', label: 'Videos' },
              { value: 'reviews', label: 'Reviews' },
            ]}
          />
        </div>

        <div className="px-screen" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'products' && <ProductsTab products={business.products} />}
          {activeTab === 'videos' && <VideosTab videos={business.videos} />}
          {activeTab === 'reviews' && <ReviewsTab business={business} />}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur-sm border-t border-border px-screen py-3 z-20">
        <ContactButtons
          business={business}
          onContact={handleContact}
        />
      </footer>
    </div>
  );
}
