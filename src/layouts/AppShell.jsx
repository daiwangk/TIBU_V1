import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

/**
 * AppShell — centered mobile column layout.
 *
 * On desktop (≥640px): renders a centered 480px column on the cream
 * background. On mobile: full-width, matching the phone UI as designed.
 *
 * Provides:
 * - Safe-area padding via env(safe-area-inset-*)
 * - Bottom padding so content is not hidden under BottomNav (~68px)
 * - BottomNav (conditionally shown based on route, handled inside BottomNav)
 */
export default function AppShell() {
  return (
    <>
      {/* Outer full-viewport layer — cream bg on desktop */}
      <div
        style={{
          minHeight: '100svh',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Inner 480px column — white card on desktop */}
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'var(--color-surface)',
            minHeight: '100svh',
            position: 'relative',
            paddingBottom: '76px', /* room for BottomNav */
            paddingTop: 'env(safe-area-inset-top)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)',
          }}
        >
          <Outlet />
        </div>
      </div>

      {/* BottomNav renders inside its own fixed positioning */}
      <BottomNav />
    </>
  );
}
