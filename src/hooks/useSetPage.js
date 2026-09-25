import { useNavigate } from 'react-router-dom';

/**
 * useSetPage — compatibility shim for existing pages that call setPage(x).
 *
 * Returns a function with the same signature as the old `setPage` state setter
 * from App.jsx. Pages can call `setPage("product")` and get navigated to the
 * correct URL without being rewritten.
 *
 * Pass `{ state }` as a second argument to forward location state
 * (e.g. selectedProduct, selectedBusiness).
 *
 * This hook will be removed once all pages are migrated to useNavigate directly.
 */
export const PAGE_URL_MAP = {
  home: '/',
  search: '/search',
  saved: '/saved',
  profile: '/profile',
  editprofile: '/profile/edit',
  addresses: '/addresses',
  addaddress: '/addresses/new',
  notification: '/notifications',
  notificationPreferences: '/notifications/preferences',
  offers: '/offers',
  product: '/product/',
  business: '/business/',
  productsviewall: '/viewall/products',
  businessViewAll: '/viewall/businesses',
  reel: '/reel/',
  reelsviewall: '/viewall/reels',
  desserts: '/category/desserts',
  crochet: '/category/crochet',
  resin: '/category/resin',
  candles: '/category/candles',
  embroidery: '/category/embroidery',
  jewellery: '/category/jewellery',
  womenfashion: '/category/women-fashion',
  menfashion: '/category/men-fashion',
  gifts: '/category/gifts',
  fashion: '/category/fashion',
  handmade: '/category/handmade',
  discover: '/discover',
  sellerregister: '/seller/register',
  sellerdashboard: '/seller/dashboard',
  sellerproduct: '/seller/products/',
  privacySecurity: '/privacy',
  helpFeedback: '/help',
  termsConditions: '/terms',
  aboutTibu: '/about',
  // Seller sub-routes added so dashboard setPage calls don't blank the screen
  selleraddproduct: '/seller/products/new',
  selleraddvideo: '/seller/videos/new',
  sellerposts: '/seller/posts',
  sellerreviews: '/seller/reviews',
};

export default function useSetPage() {
  const navigate = useNavigate();

  /**
   * @param {string} page - old page string key (e.g. "product", "home")
   * @param {object} [state] - optional location state to forward (selectedProduct, etc.)
   */
  return (page, state) => {
    const url = PAGE_URL_MAP[page];
    if (!url) {
      console.warn(`[useSetPage] Unknown page key: "${page}". No navigation performed.`);
      return;
    }
    navigate(url, { state });
  };
}
