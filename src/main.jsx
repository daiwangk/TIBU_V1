import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ProfileProvider } from './contexts/ProfileContext.jsx';
import { SavedProvider } from './contexts/SavedContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileProvider>
      <SavedProvider>
        <App />
      </SavedProvider>
    </ProfileProvider>
  </StrictMode>,
);
