import { MessageSquare, Share2, Store } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useBusiness } from '../../queries/catalog';
import { useTrackView } from '../../queries/activity.js';
import { useContactAction } from '../../queries/contact.js';
import { useMyThread } from '../../queries/enquiries.js';
import { useMyBusiness } from '../../queries/seller.js';
import Button from '../../components/ui/Button';
import ContactButtons from '../../components/ContactButtons';
import EmptyState from '../../components/ui/EmptyState';
import EnquirySheet from '../../components/EnquirySheet';
import ErrorState from '../../components/ui/ErrorState';
import IconButton from '../../components/ui/IconButton';
import PageHeader from '../../components/ui/PageHeader';
import SaveButton from '../../components/SaveButton';
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

  const { data: business, isLoading, isError, error, refetch } = useBusiness(slug);
  // slug is the local id (for guest localStorage); business.id is the UUID (for the RPC).
  useTrackView('business', slug, { enabled: !!business, serverId: business?.id });
  const { start: startContact, pendingChannel, ready: contactReady } = useContactAction();
  const { data: myBusiness } = useMyBusiness();
  const { data: existingThreadId } = useMyThread(business?.id);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const isOwner = Boolean(myBusiness?.id && business?.id && myBusiness.id === business.id);

  function handleEnquiryClick() {
    if (existingThreadId) {
      navigate(`/enquiries/${encodeURIComponent(existingThreadId)}`);
      return;
    }
    setEnquiryOpen(true);
  }

  if (isLoading) {
    return <BusinessSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader title="Business" fallbackTo="/" />
        <ErrorState error={error} onRetry={() => refetch()} />
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
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(
        () => toast('Link copied to clipboard'),
        () => toast("Couldn't copy the link"),
      );
    } else {
      toast("Couldn't copy the link — copy it from the address bar");
    }
  }

  function handleContact(channel) {
    startContact(channel, { business });
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
      <PageHeader title={business.name} titleAs="p" fallbackTo="/" actions={headerActions} />

      <main>
        <BusinessHeader business={business} />

        <div className="sticky top-14 z-10 bg-surface">
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
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur-sm border-t border-border px-screen py-3 z-20 flex flex-col gap-2">
        {!isOwner && (
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={handleEnquiryClick}
          >
            <MessageSquare size={18} aria-hidden="true" />
            Send enquiry
          </Button>
        )}
        <ContactButtons onContact={handleContact} loadingChannel={pendingChannel} disabled={!contactReady} />
      </footer>

      {business && !isOwner && (
        <EnquirySheet
          open={enquiryOpen}
          onClose={() => setEnquiryOpen(false)}
          business={{ id: business.id, name: business.name, slug: business.slug }}
        />
      )}
    </div>
  );
}
