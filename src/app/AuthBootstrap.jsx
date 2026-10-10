import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dataSource, getSession, onAuthChange } from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { startAuthSync } from './authSync.js';

/** Mount once inside the QueryClientProvider. Renders nothing. */
export default function AuthBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => startAuthSync({
    dataSource,
    getSession,
    onAuthChange,
    queryClient,
    setSession: useAuthStore.getState().setSession,
  }), [queryClient]);

  return null;
}
