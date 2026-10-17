import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dataSource, getSession, onAuthChange } from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { useLocationStore } from '../stores/location.js';
import { useMe } from '../queries/me.js';
import { resolveProfileLocationDefault } from '../lib/profileLocation.js';
import { startAuthSync } from './authSync.js';

/** Mount once inside the QueryClientProvider. Renders nothing. */
export default function AuthBootstrap() {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((s) => s.status);
  const { data: profile } = useMe();
  const hasAppliedLocation = useRef(false);

  useEffect(() => startAuthSync({
    dataSource,
    getSession,
    onAuthChange,
    queryClient,
    setSession: useAuthStore.getState().setSession,
  }), [queryClient]);

  // Default search location from profile home area when authenticated and location is empty
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      hasAppliedLocation.current = false;
      return;
    }

    if (hasAppliedLocation.current || !profile) return;

    hasAppliedLocation.current = true;
    const locationStore = useLocationStore.getState();
    const defaultLocation = resolveProfileLocationDefault(locationStore, profile);
    if (defaultLocation) {
      locationStore.setFromProfile(defaultLocation);
    }
  }, [authStatus, profile]);

  return null;
}
