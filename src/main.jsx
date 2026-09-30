import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ErrorBoundary } from './app/ErrorBoundary.jsx';
import { Providers } from './app/providers.jsx';
import { ProfileProvider } from './contexts/ProfileContext.jsx';
import { SavedProvider } from './contexts/SavedContext.jsx';

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
