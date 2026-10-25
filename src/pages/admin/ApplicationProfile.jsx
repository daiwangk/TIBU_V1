import FulfilmentInfo from '../../components/FulfilmentInfo';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder';
import AdminSection from './AdminSection';

/**
 * Banner, logo, name, category, description, established year and delivery of an application.
 *
 * @param {{ business: import('../../services/contract.js').MyBusiness }} props
 */
export default function ApplicationProfile({ business }) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {business.bannerUrl ? (
          <img src={business.bannerUrl} alt={`${business.name} banner`} className="aspect-video w-full rounded-card object-cover" />
        ) : (
          <ImagePlaceholder aspect="16/9" className="rounded-card" />
        )}
        <div className="flex items-center gap-3">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={`${business.name} logo`} className="size-16 shrink-0 rounded-card border border-border object-cover" />
          ) : (
            <div className="size-16 shrink-0 overflow-hidden rounded-card">
              <ImagePlaceholder aspect="1/1" iconSize={24} />
            </div>
          )}
          <div className="flex min-w-0 flex-col">
            <h2 className="font-heading text-2xl font-bold text-ink">{business.name}</h2>
            <p className="font-body text-sm text-body">{business.categoryName || 'No category'}</p>
          </div>
        </div>
      </div>

      <AdminSection id="about" title="About">
        <p className="whitespace-pre-line font-body text-sm text-body">{business.description || 'No description'}</p>
        <p className="font-body text-sm text-body">
          {business.establishedYear ? `Established ${business.establishedYear}` : 'Established year not stated'}
        </p>
        <FulfilmentInfo
          deliveryAvailable={business.deliveryAvailable}
          pickupAvailable={business.pickupAvailable}
          deliveryTime={business.deliveryTime}
        />
      </AdminSection>
    </>
  );
}
