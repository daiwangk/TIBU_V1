import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import BottomNav from './BottomNav';
import { isBottomNavHidden } from './navVisibility';

/**
 * AppShell — centered mobile column layout.
 *
 * On desktop (≥640px): renders a centered 480px column on the cream
 * background. On mobile: full-width, matching the phone UI as designed.
 *
 * Provides:
 * - Safe-area padding via env(safe-area-inset-*)
 * - Bottom padding so content is not hidden under BottomNav (~76px) — only on routes that show it
 * - BottomNav (conditionally shown based on route)
 */
export default function AppShell() {
  const { pathname } = useLocation();
  const navVisible = !isBottomNavHidden(pathname);

  return (
    <>
      {/* Outer full-viewport layer — cream bg on desktop */}
      <div className="flex min-h-svh justify-center bg-bg">
        {/* Inner 480px column — white card on desktop */}
        <div
          className={`relative min-h-svh w-full max-w-[480px] bg-surface pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] ${
            navVisible ? 'pb-[76px]' : ''
          }`}
        >
          {/* Lazy pages show a spinner here while their chunk downloads; the nav stays put. */}
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
                <Spinner size={32} />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>

      {/* BottomNav renders inside its own fixed positioning */}
      <BottomNav />
    </>
  );
}
