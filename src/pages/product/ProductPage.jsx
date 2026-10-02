import { PackageX, Share2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ContactButtons from '../../components/ContactButtons';
import Distance from '../../components/Distance';
import ImageGallery from '../../components/ImageGallery';
import Price from '../../components/Price';
import Rating from '../../components/Rating';
import SaveButton from '../../components/SaveButton';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import IconButton from '../../components/ui/IconButton';
import PageHeader from '../../components/ui/PageHeader';
import { useProduct } from '../../queries/catalog';
import ProductDetailsList from './ProductDetailsList';
import ProductSkeleton from './ProductSkeleton';

/**
 * Product detail page loaded directly from its URL parameter.
 * Handles loading skeleton, not found, error, and data states.
 */
export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useProduct(productId);

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader title="Product" fallbackTo="/" />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg">
        <PageHeader title="Product" fallbackTo="/" />
        <EmptyState
          icon={<PackageX size={32} aria-hidden="true" />}
          title="This product isn't available"
          text="The item you're looking for might have been removed or is no longer listed."
          action={{
            label: 'Back to Home',
            onClick: () => navigate('/'),
          }}
        />
      </div>
    );
  }

  const { business } = product;

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on Tibu!`,
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

  const headerActions = (
    <>
      <SaveButton kind="product" id={product.id} />
      <IconButton label="Share" onClick={handleShare}>
        <Share2 size={20} aria-hidden="true" />
      </IconButton>
    </>
  );

  return (
    <div className="min-h-screen bg-bg pb-28">
      <PageHeader title="Tibu" fallbackTo="/" actions={headerActions} />

      <main className="px-screen pt-3 space-y-4">
        {/* Image Gallery */}
        <ImageGallery images={product.images} name={product.name} />

        {/* Business Row */}
        {business && (
          <Link
            to={`/b/${business.slug}`}
            className="flex items-center gap-3 p-3 rounded-card bg-surface border border-border hover:bg-lavender/30 transition-colors"
          >
            <Avatar src={business.logoUrl} name={business.name} size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-ink text-sm truncate">
                {business.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                <span className="truncate">{business.locality}</span>
                <Distance distanceM={business.distanceM} />
                <Rating rating={business.rating} reviewCount={business.reviewCount} />
              </div>
            </div>
          </Link>
        )}

        {/* Product Title and Price */}
        <div>
          <h1 className="font-heading font-bold text-ink text-xl leading-snug">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Price value={product.price} size="lg" />
            {product.availableToday && (
              <Badge tone="success">Available today</Badge>
            )}
          </div>
        </div>

        {/* Product Details List (key-values) */}
        <ProductDetailsList details={product.details} />

        {/* Description */}
        {product.description && (
          <section className="mt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              About this product
            </h2>
            <p className="text-sm text-body leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur-sm border-t border-border px-screen py-3 z-20">
        <ContactButtons
          business={business}
          product={product}
          onContact={handleContact}
        />
      </footer>
    </div>
  );
}
