import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Layout
import AppShell from './layouts/AppShell';

// Pages — alphabetical
import AboutTibu from './AboutTibu';
import AddAddress from './AddAddress';
import Addresses from './Addresses';
import Business from './Business';
import BusinessViewAll from './BusinessViewAll';
import Candles from './Candles';
import Crochet from './Crochet';
import Desserts from './Desserts';
import Discover from './Discover';
import EditProfile from './EditProfile';
import Embroidery from './Embroidery';
import Fashion from './Fashion';
import Gifts from './Gifts';
import Handmade from './Handmade';
import HelpFeedback from './HelpFeedback';
import Home from './Home';
import Jewellery from './Jewellery';
import MenFashion from './MenFashion';
import NotificationPreferences from './NotificationPreferences';
import Notification from './Pages/Notification';
import Offers from './Offers';
import PrivacySecurity from './PrivacySecurity';
import Product from './Product';
import ProductsViewAll from './ProductsViewAll';
import Profile from './Profile';
import Reel from './Reel';
import ReelsViewAll from './ReelsViewAll';
import Resin from './Resin';
import Saved from './Saved';
import Search from './Search';
import SellerDashboard from './SellerDashboard';
import SellerProductDetail from './SellerProductDetail';
import SellerRegister from './SellerRegister';
import TermsConditions from './TermsConditions';
import WomenFashion from './WomenFashion';
import NotFound from './pages/NotFound';

// Contexts
import { useSaved } from './contexts/SavedContext';
import { useProfile } from './contexts/ProfileContext';

/**
 * LegacyPage — wraps legacy pages that still need setPage + selected-entity
 * props forwarded from router location state.
 *
 * Legacy pages call setPage(key) and also read location.state for entities
 * selected before navigation (selectedProduct, selectedBusiness, etc.).
 *
 * This wrapper is intentionally minimal. Pages will be migrated to read
 * from contexts / route params directly in a later task.
 */
function LegacyPage({ Component, extraProps = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state ?? {};
  
  // searchText needs to be held locally so Home/Search don't crash when calling toLowerCase()
  const [searchText, setSearchText] = React.useState('');

  const { savedProducts, setSavedProducts, savedBusinesses, setSavedBusinesses, savedReels, setSavedReels } = useSaved();
  const { profile, setProfile, addresses, setAddresses, filters, setFilters, profileStats } = useProfile();

  /** Shim: translate old page strings to navigate() calls */
  function setPage(pageKey, entityState) {
    const urlMap = {
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
      product: '/product/view',
      business: '/business/view',
      productsviewall: '/viewall/products',
      businessViewAll: '/viewall/businesses',
      reel: '/reel/view',
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
      sellerproduct: '/seller/products/view',
      selleraddproduct: '/seller/products/new',
      selleraddvideo: '/seller/videos/new',
      sellerposts: '/seller/posts',
      sellerreviews: '/seller/reviews',
      privacySecurity: '/privacy',
      helpFeedback: '/help',
      termsConditions: '/terms',
      aboutTibu: '/about',
    };
    const url = urlMap[pageKey];
    if (!url) {
      console.warn(`[setPage shim] Unknown page key: "${pageKey}"`);
      return;
    }
    navigate(url, { state: entityState });
  }

  const legacyProps = {
    setPage,
    // selected entities from location state (set by the calling page)
    selectedProduct: state.selectedProduct ?? null,
    selectedBusiness: state.selectedBusiness ?? null,
    selectedReel: state.selectedReel ?? null,
    selectedOffer: state.selectedOffer ?? null,
    currentReels: state.currentReels ?? [],
    // view-all payloads
    viewAllTitle: state.viewAllTitle ?? '',
    viewAllProducts: state.viewAllProducts ?? [],
    viewAllBusinesses: state.viewAllBusinesses ?? [],
    viewAllBusinessTitle: state.viewAllBusinessTitle ?? '',
    viewAllReels: state.viewAllReels ?? [],
    viewAllReelsTitle: state.viewAllReelsTitle ?? '',
    previousPage: state.previousPage ?? 'home',
    availableTodayCategory: state.availableTodayCategory ?? 'All',
    // navigation state setters (forwarded as location state on next navigate)
    setSelectedProduct: (p) => navigate(location.pathname, { replace: true, state: { ...state, selectedProduct: p } }),
    setSelectedBusiness: (b) => navigate(location.pathname, { replace: true, state: { ...state, selectedBusiness: b } }),
    setSelectedReel: (r) => navigate(location.pathname, { replace: true, state: { ...state, selectedReel: r } }),
    setCurrentReels: (rs) => navigate(location.pathname, { replace: true, state: { ...state, currentReels: rs } }),
    setViewAllTitle: (t) => navigate(location.pathname, { replace: true, state: { ...state, viewAllTitle: t } }),
    setViewAllProducts: (ps) => navigate(location.pathname, { replace: true, state: { ...state, viewAllProducts: ps } }),
    setViewAllBusinesses: (bs) => navigate(location.pathname, { replace: true, state: { ...state, viewAllBusinesses: bs } }),
    setViewAllBusinessTitle: (t) => navigate(location.pathname, { replace: true, state: { ...state, viewAllBusinessTitle: t } }),
    setViewAllReels: (rs) => navigate(location.pathname, { replace: true, state: { ...state, viewAllReels: rs } }),
    setViewAllReelsTitle: (t) => navigate(location.pathname, { replace: true, state: { ...state, viewAllReelsTitle: t } }),
    setPreviousPage: (p) => navigate(location.pathname, { replace: true, state: { ...state, previousPage: p } }),
    setAvailableTodayCategory: (c) => navigate(location.pathname, { replace: true, state: { ...state, availableTodayCategory: c } }),
    setSellerMode: () => {},   // dead prop per audit; keep stub to avoid crashes
    sellerMode: false,
    searchText,
    setSearchText,
    // contexts
    savedProducts,
    setSavedProducts,
    savedBusinesses,
    setSavedBusinesses,
    savedReels,
    setSavedReels,
    profile,
    setProfile,
    profileStats,
    addresses,
    setAddresses,
    filters,
    setFilters,
    ...extraProps,
  };

  return <Component {...legacyProps} />;
}

/** Shorthand for wrapping a page in LegacyPage */
function L(Component, extraProps) {
  return <LegacyPage Component={Component} extraProps={extraProps} />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Shell routes (with BottomNav) ── */}
      <Route element={<AppShell />}>
        <Route path="/" element={L(Home)} />
        <Route path="/search" element={L(Search)} />
        <Route path="/saved" element={L(Saved)} />
        <Route path="/profile" element={L(Profile)} />
        <Route path="/profile/edit" element={L(EditProfile)} />
        <Route path="/addresses" element={L(Addresses)} />
        <Route path="/addresses/new" element={L(AddAddress)} />
        <Route path="/notifications" element={L(Notification)} />
        <Route path="/notifications/preferences" element={L(NotificationPreferences)} />
        <Route path="/offers" element={L(Offers)} />
        <Route path="/discover" element={L(Discover)} />
        <Route path="/privacy" element={L(PrivacySecurity)} />
        <Route path="/help" element={L(HelpFeedback)} />
        <Route path="/terms" element={L(TermsConditions)} />
        <Route path="/about" element={L(AboutTibu)} />

        {/* Entity detail — BottomNav hidden via prefix matching in BottomNav.jsx */}
        <Route path="/product/:productId" element={L(Product)} />
        <Route path="/product/view" element={L(Product)} />
        <Route path="/business/:businessId" element={L(Business)} />
        <Route path="/business/view" element={L(Business)} />
        <Route path="/reel/:reelId" element={L(Reel)} />
        <Route path="/reel/view" element={L(Reel)} />

        {/* View-all — BottomNav hidden via prefix matching */}
        <Route path="/viewall/products" element={L(ProductsViewAll)} />
        <Route path="/viewall/businesses" element={L(BusinessViewAll)} />
        <Route path="/viewall/reels" element={L(ReelsViewAll)} />

        {/* Category hubs */}
        <Route path="/category/desserts" element={L(Desserts)} />
        <Route path="/category/crochet" element={L(Crochet)} />
        <Route path="/category/resin" element={L(Resin)} />
        <Route path="/category/candles" element={L(Candles)} />
        <Route path="/category/embroidery" element={L(Embroidery)} />
        <Route path="/category/jewellery" element={L(Jewellery)} />
        <Route path="/category/women-fashion" element={L(WomenFashion)} />
        <Route path="/category/men-fashion" element={L(MenFashion)} />
        <Route path="/category/gifts" element={L(Gifts)} />
        <Route path="/category/fashion" element={L(Fashion)} />
        <Route path="/category/handmade" element={L(Handmade)} />

        {/* Seller routes — BottomNav hidden via /seller/ prefix */}
        <Route path="/seller/register" element={L(SellerRegister)} />
        <Route path="/seller/dashboard" element={L(SellerDashboard)} />
        <Route path="/seller/products/view" element={L(SellerProductDetail)} />
        <Route path="/seller/products/:id" element={L(SellerProductDetail)} />
        {/* Seller sub-routes added so setPage calls from SellerDashboard don't blank the screen */}
        <Route path="/seller/products/new" element={L(SellerDashboard)} />
        <Route path="/seller/videos/new" element={L(SellerDashboard)} />
        <Route path="/seller/posts" element={L(SellerDashboard)} />
        <Route path="/seller/reviews" element={L(SellerDashboard)} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}