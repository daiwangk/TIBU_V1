import { useState } from 'react';
import ImageSlot from '../../../components/ImageSlot';
import PhotoGrid from '../../../components/PhotoGrid';
import { useRemoveBusinessImage, useUploadBusinessImage } from '../../../queries/seller';
import StepFooter from './StepFooter';

const GALLERY_MAX = 6;

/**
 * Step 4: logo (required), banner (optional) and up to 6 gallery photos. Each photo is compressed and
 * saved as soon as it is chosen, so Next only checks that a logo is there.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onBack?: () => void, onSaved: () => void, showFooter?: boolean }} props
 */
export default function BrandingStep({ business, onBack, onSaved, showFooter = true }) {
  const upload = useUploadBusinessImage();
  const removeImage = useRemoveBusinessImage();
  const [logoBusy, setLogoBusy] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [missingLogo, setMissingLogo] = useState(false);
  const busy = logoBusy || bannerBusy || galleryBusy;

  function handleSubmit(e) {
    e.preventDefault();
    if (!business.logoUrl) {
      setMissingLogo(true);
      return;
    }
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <ImageSlot
        label="Logo (required)"
        hint="A square photo works best. Customers see it on your shop card."
        imageUrl={business.logoUrl}
        alt="Your logo"
        error={missingLogo && !business.logoUrl ? 'Add a logo to continue' : undefined}
        upload={(file) => upload.mutateAsync({ kind: 'logo', file })}
        onBusyChange={setLogoBusy}
      />

      <ImageSlot
        label="Banner (optional)"
        hint="A wide 16:9 photo shown at the top of your page."
        imageUrl={business.bannerUrl}
        alt="Your banner"
        shape="video"
        upload={(file) => upload.mutateAsync({ kind: 'banner', file })}
        onBusyChange={setBannerBusy}
      />

      <div className="flex flex-col gap-2">
        <p className="font-body text-sm font-semibold text-ink">Gallery (optional)</p>
        <PhotoGrid
          images={business.images}
          max={GALLERY_MAX}
          noun="photo"
          upload={(file) => upload.mutateAsync({ kind: 'gallery', file })}
          remove={(id) => removeImage.mutateAsync(id)}
          onBusyChange={setGalleryBusy}
        />
      </div>

      {showFooter && <StepFooter onBack={onBack} loading={busy} />}
    </form>
  );
}
