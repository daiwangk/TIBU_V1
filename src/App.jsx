import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GateResumer } from './app/GateResumer.jsx';
import { RequireAuth } from './app/guards.jsx';
import LoginSheet from './components/LoginSheet';
import Spinner from './components/ui/Spinner';

// DEV-only lazy route — excluded from production bundle
const UiGalleryPage = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/UiGalleryPage'))
  : null;

// Layout
import AppShell from './layouts/AppShell';

// Pages. Home is bundled with the app (it is the first screen); every other page is a separate chunk
// that downloads when first visited. A failed chunk download is handled by ErrorBoundary and by the
// `vite:preloadError` reload in main.jsx.
import HomePage from './pages/home/HomePage';

const AboutPage = lazy(() => import('./pages/static/AboutPage'));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const BusinessPage = lazy(() => import('./pages/business/BusinessPage'));
const CategoryPage = lazy(() => import('./pages/category/CategoryPage'));
const EditProfilePage = lazy(() => import('./pages/profile/EditProfilePage'));
const HelpPage = lazy(() => import('./pages/static/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const NotificationPreferences = lazy(() => import('./NotificationPreferences'));
const Notification = lazy(() => import('./legacy/pages/Notification'));
const PrivacyPage = lazy(() => import('./pages/static/PrivacyPage'));
const ProductPage = lazy(() => import('./pages/product/ProductPage'));
const ConnectedPage = lazy(() => import('./pages/saved/ConnectedPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const RecentPage = lazy(() => import('./pages/saved/RecentPage'));
const SavedPage = lazy(() => import('./pages/saved/SavedPage'));
const SearchPage = lazy(() => import('./pages/search/SearchPage'));
const SellLandingPage = lazy(() => import('./pages/seller/SellLandingPage'));
const SellerGate = lazy(() => import('./pages/seller/SellerGate'));
const SellerPlaceholder = lazy(() => import('./pages/seller/SellerPlaceholder'));
const SellerDashboard = lazy(() => import('./SellerDashboard'));
const SellerProductDetail = lazy(() => import('./SellerProductDetail'));
const SellerRegister = lazy(() => import('./SellerRegister'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));


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
  const selectedProductRef = React.useRef(null);
  const selectedBusinessRef = React.useRef(null);


  /** Shim: translate old page strings to navigate() calls */
  function setPage(pageKey, entityState) {
    if (pageKey === 'product') {
      const p = selectedProductRef.current;
      if (p?.id) {
        navigate(`/p/${p.id}`, { state: entityState });
        return;
      }
      navigate('/');
      return;
    }

    if (pageKey === 'business') {
      const b = selectedBusinessRef.current;
      const rawId = b?.slug || b?.id || b?.businessName;
      if (rawId) {
        navigate(`/b/${encodeURIComponent(String(rawId).toLowerCase())}`);
        return;
      }
      navigate('/');
      return;
    }

    const urlMap = {
      home: '/',
      search: '/search',
      saved: '/saved',
      profile: '/profile',
      editprofile: '/profile/edit',
      notification: '/notifications',
      notificationPreferences: '/notifications/preferences',
      desserts: '/category/desserts',
      crochet: '/category/crochet',
      resin: '/category/resin-art',
      candles: '/category/candles',
      embroidery: '/category/embroidery',
      jewellery: '/category/jewellery',
      womenfashion: '/category/womens-fashion',
      menfashion: '/category/mens-fashion',
      gifts: '/category/gifts',
      fashion: '/category/fashion',
      handmade: '/category/handmade',
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
    // navigation state setters (forwarded as location state on next navigate)
    setSelectedProduct: (p) => {
      selectedProductRef.current = p;
      navigate(location.pathname, { replace: true, state: { ...state, selectedProduct: p } });
    },
    setSelectedBusiness: (b) => {
      selectedBusinessRef.current = b;
      navigate(location.pathname, { replace: true, state: { ...state, selectedBusiness: b } });
    },
    setPreviousPage: (p) => navigate(location.pathname, { replace: true, state: { ...state, previousPage: p } }),
    setSellerMode: () => {},   // dead prop per audit; keep stub to avoid crashes
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
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/saved" element={<RequireAuth><SavedPage /></RequireAuth>} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/connected" element={<RequireAuth><ConnectedPage /></RequireAuth>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
        <Route path="/notifications" element={L(Notification)} />
        {/* Temporary: both paths show the legacy screen until B5.3 builds /notifications/settings */}
        <Route path="/notifications/settings" element={L(NotificationPreferences)} />
        <Route path="/notifications/preferences" element={L(NotificationPreferences)} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Auth — BottomNav hidden via navVisibility.js */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Entity detail — BottomNav hidden via prefix matching in BottomNav.jsx */}
        <Route path="/p/:productId" element={<ProductPage />} />
        <Route path="/b/:slug" element={<BusinessPage />} />

        {/* Category hub — single route replaces 11 legacy pages */}
        <Route path="/category/:slug" element={<CategoryPage />} />

        {/* Sell landing (public) */}
        <Route path="/sell" element={<SellLandingPage />} />

        {/* Seller area — gated (seller role; no submitted shop → onboarding). Pages are placeholders until B4.2 / B4.3. */}
        <Route path="/seller" element={<SellerGate />}>
          <Route index element={<SellerPlaceholder title="Seller dashboard" backTo="/profile" />} />
          <Route path="onboarding" element={<SellerPlaceholder title="Set up your shop" backTo="/profile" />} />
          <Route path="products" element={<SellerPlaceholder title="Products" />} />
          <Route path="videos" element={<SellerPlaceholder title="Videos" />} />
          <Route path="business" element={<SellerPlaceholder title="Edit business" />} />
        </Route>

        {/* Legacy seller routes — BottomNav hidden via /seller/ prefix. Removed when B4.2 / B4.3 replace them. */}
        <Route path="/seller/register" element={L(SellerRegister)} />
        <Route path="/seller/dashboard" element={L(SellerDashboard)} />
        <Route path="/seller/products/view" element={L(SellerProductDetail)} />
        <Route path="/seller/products/:id" element={L(SellerProductDetail)} />
        {/* Seller sub-routes added so setPage calls from SellerDashboard don't blank the screen */}
        <Route path="/seller/products/new" element={L(SellerDashboard)} />
        <Route path="/seller/videos/new" element={L(SellerDashboard)} />
        <Route path="/seller/posts" element={L(SellerDashboard)} />
        <Route path="/seller/reviews" element={L(SellerDashboard)} />

        {/* DEV only — UI component gallery */}
        {import.meta.env.DEV && UiGalleryPage && (
          <Route
            path="/dev/ui"
            element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spinner size={32} /></div>}>
                <UiGalleryPage />
              </Suspense>
            }
          />
        )}

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GateResumer />
      {/* Inside the router (needs navigate), so here rather than in providers.jsx */}
      <LoginSheet />
      <AppRoutes />
    </BrowserRouter>
  );
}
