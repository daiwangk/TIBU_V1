import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ErrorBoundary } from './app/ErrorBoundary.jsx';
import { Providers } from './app/providers.jsx';
import { ProfileProvider } from './contexts/ProfileContext.jsx';
import { SavedProvider } from './contexts/SavedContext.jsx';

// A tab left open across a deploy can request a chunk filename that no longer exists. Reload once
// (guarded, so a genuinely missing file can't cause a reload loop) to pick up the new build.
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('tibu.chunkReload')) return;
    sessionStorage.setItem('tibu.chunkReload', '1');
  } catch {
    return;
  }
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <ProfileProvider>
          <SavedProvider>
            <App />
          </SavedProvider>
        </ProfileProvider>
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
);
