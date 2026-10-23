import SellerPage from './SellerPage';
import VideosManager from './VideosManager';

/** /seller/videos — add, preview and remove the shop's Instagram reels. */
export default function SellerVideosPage() {
  return (
    <SellerPage title="Videos">
      {(business) => (
        <>
          <p className="font-body text-sm text-body">Links to public Instagram reels that show your work. They appear on your shop page.</p>
          <VideosManager videos={business.videos} />
        </>
      )}
    </SellerPage>
  );
}
