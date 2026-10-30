import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GateResumer } from './app/GateResumer.jsx';
import { RequireAuth, RequireRole } from './app/guards.jsx';
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
const AdminApplicationPage = lazy(() => import('./pages/admin/AdminApplicationPage'));
const AdminListPage = lazy(() => import('./pages/admin/AdminListPage'));
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const BusinessPage = lazy(() => import('./pages/business/BusinessPage'));
const CategoryPage = lazy(() => import('./pages/category/CategoryPage'));
const EditProfilePage = lazy(() => import('./pages/profile/EditProfilePage'));
const HelpPage = lazy(() => import('./pages/static/HelpPage'));
const InboxPage = lazy(() => import('./pages/enquiries/InboxPage'));
const ThreadPage = lazy(() => import('./pages/enquiries/ThreadPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const NotificationSettingsPage = lazy(() => import('./pages/notifications/NotificationSettingsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const PrivacyPage = lazy(() => import('./pages/static/PrivacyPage'));
const ProductPage = lazy(() => import('./pages/product/ProductPage'));
const ConnectedPage = lazy(() => import('./pages/saved/ConnectedPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const RecentPage = lazy(() => import('./pages/saved/RecentPage'));
const SavedPage = lazy(() => import('./pages/saved/SavedPage'));
const SearchPage = lazy(() => import('./pages/search/SearchPage'));
const SellLandingPage = lazy(() => import('./pages/seller/SellLandingPage'));
const OnboardingPage = lazy(() => import('./pages/seller/onboarding/OnboardingPage'));
const SellerGate = lazy(() => import('./pages/seller/SellerGate'));
const SellerReviewsPage = lazy(() => import('./pages/seller/SellerReviewsPage'));
const SellerBusinessPage = lazy(() => import('./pages/seller/SellerBusinessPage'));
const SellerHomePage = lazy(() => import('./pages/seller/SellerHomePage'));
const SellerProductPage = lazy(() => import('./pages/seller/SellerProductPage'));
const SellerProductsPage = lazy(() => import('./pages/seller/SellerProductsPage'));
const SellerVideosPage = lazy(() => import('./pages/seller/SellerVideosPage'));
const TermsPage = lazy(() => import('./pages/static/TermsPage'));

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
        <Route path="/enquiries" element={<RequireAuth><InboxPage /></RequireAuth>} />
        <Route path="/enquiries/:threadId" element={<RequireAuth><ThreadPage /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/notifications/settings" element={<RequireAuth><NotificationSettingsPage /></RequireAuth>} />
        <Route path="/notifications/preferences" element={<RequireAuth><NotificationSettingsPage /></RequireAuth>} />
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

        {/* Seller area — gated (seller role; no submitted shop → onboarding). BottomNav hidden via navVisibility.js. */}
        <Route path="/seller" element={<SellerGate />}>
          <Route index element={<SellerHomePage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/new" element={<SellerProductPage />} />
          <Route path="products/:id" element={<SellerProductPage />} />
          <Route path="videos" element={<SellerVideosPage />} />
          <Route path="business" element={<SellerBusinessPage />} />
          {/* Seller enquiries: B5.1 reuse of InboxPage and ThreadPage; /seller/enquiries/<id> is a CONTRACT §14 notification link. */}
          <Route path="enquiries" element={<InboxPage as="seller" />} />
          <Route path="enquiries/:threadId" element={<ThreadPage as="seller" />} />
          <Route path="reviews" element={<SellerReviewsPage />} />
        </Route>

        {/* Admin panel — admin role only (RequireRole includes RequireAuth). BottomNav hidden via navVisibility.js. */}
        <Route path="/admin" element={<RequireRole roles={['admin']} />}>
          <Route index element={<AdminListPage />} />
          <Route path="applications/:businessId" element={<AdminApplicationPage />} />
        </Route>

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
