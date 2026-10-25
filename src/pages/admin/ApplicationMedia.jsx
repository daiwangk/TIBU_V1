import ReelEmbed from '../../components/ReelEmbed';
import Badge from '../../components/ui/Badge';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import { formatPrice } from '../../lib/format';
import AdminSection from './AdminSection';

function None({ children }) {
  return <p className="font-body text-sm text-muted">{children}</p>;
}

function ProductItem({ product }) {
  const images = product.images ?? [];
  return (
    <li className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate font-body text-sm font-semibold text-ink">{product.name}</span>
        <span className="shrink-0 font-heading text-sm font-extrabold text-primary">{formatPrice(product.price)}</span>
      </div>
      {!product.isActive && (
        <div>
          <Badge tone="neutral">Hidden</Badge>
        </div>
      )}
      {/* Every photo, so the admin can check them all. */}
      <ul className="flex gap-2 overflow-x-auto no-scrollbar" aria-label={`${product.name} photos`}>
        {images.length === 0 ? (
          <li className="size-16 shrink-0 overflow-hidden rounded-btn">
            <ImagePlaceholder aspect="1/1" iconSize={20} />
          </li>
        ) : (
          images.map((image, i) => (
            <li key={image.id} className="shrink-0">
              <img src={image.url} alt={`${product.name} photo ${i + 1}`} className="size-16 rounded-btn object-cover" />
            </li>
          ))
        )}
      </ul>
    </li>
  );
}

/**
 * Gallery photos, every product (hidden ones too) and the shop's reels.
 *
 * @param {{ business: import('../../services/contract.js').MyBusiness }} props
 */
export default function ApplicationMedia({ business }) {
  const { images, products, videos } = business;
  return (
    <>
      <AdminSection id="gallery" title={`Gallery (${images.length})`}>
        {images.length === 0 ? (
          <None>No gallery photos</None>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {images.map((image, i) => (
              <li key={image.id}>
                <img src={image.url} alt={`${business.name} photo ${i + 1}`} className="aspect-square w-full rounded-btn object-cover" />
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      <AdminSection id="products" title={`Products (${products.length})`}>
        {products.length === 0 ? (
          <None>No products</None>
        ) : (
          <ul className="overflow-hidden rounded-card border border-border bg-surface">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </ul>
        )}
      </AdminSection>

      <AdminSection id="videos" title={`Videos (${videos.length})`}>
        {videos.length === 0 ? (
          <None>No videos</None>
        ) : (
          <ul className="flex flex-col gap-4">
            {videos.map((video) => (
              <li key={video.id}>
                <ReelEmbed video={video} />
              </li>
            ))}
          </ul>
        )}
      </AdminSection>
    </>
  );
}
