import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe, uploadAvatar } from '../services/index.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';

/** The signed-in user's profile. Runs only when authenticated. */
export function useMe() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    // Screens that need the profile render their own loading and error states.
    meta: { silent: true },
    queryKey: qk.me,
    queryFn: () => getMe(),
    enabled: status === 'authenticated',
  });
}

/** `updateMe(patch)`; refetches the profile on success. */
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch) => updateMe(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.me }),
  });
}

/** `uploadAvatar(file)` → public URL; refetches the profile on success. */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => uploadAvatar(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.me }),
  });
}
