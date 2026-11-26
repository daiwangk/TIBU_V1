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
  const userId = useAuthStore((s) => s.session?.userId);
  const { data: profile } = useMe();
  const locationAppliedFor = useRef(null);

  useEffect(() => startAuthSync({
    dataSource,
    getSession,
    onAuthChange,
    queryClient,
    initialUserId: useAuthStore.getState().session?.userId ?? null,
    setSession: useAuthStore.getState().setSession,
  }), [queryClient]);

  // Default search location from profile home area when authenticated and location is empty
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      locationAppliedFor.current = null;
      return;
    }

    if (!profile || profile.id !== userId || locationAppliedFor.current === userId) return;

    locationAppliedFor.current = userId;
    const locationStore = useLocationStore.getState();
    const defaultLocation = resolveProfileLocationDefault(locationStore, profile);
    if (defaultLocation) {
      locationStore.setFromProfile({ ...defaultLocation, ownerId: userId });
    }
  }, [authStatus, userId, profile]);

  return null;
}
